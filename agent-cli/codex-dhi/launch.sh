#!/usr/bin/env bash
#
# One-shot "Docker Agentic Platform" launch, as a script:
#   Codex, with your OpenAI key, GitHub token for repo access, the DHI MCP
#   server wired into Codex, Balanced egress plus dhi.io registry access, on
#   micro compute, stopping after 1h.
#
#   ./launch.sh [-n NAME] [-t TTL] [-M URL] [-G] [-e KEY[=VALUE]]... [-A] [-C] [-k REF]
#
#   -n NAME  sandbox name (default: codex-dhi-demo)
#   -t TTL   time to live (default: 1h; on timeout the sandbox stops)
#   -M URL   DHI MCP endpoint to add to Codex (default: https://dhi.io/mcp; -M "" skips)
#   -G       skip the GitHub token wiring (default: include it)
#   -e VAR   env var, KEY=VALUE or bare KEY (copied from your shell); repeatable
#   -A       attach to the agent session when it is ready
#   -C       skip the competitor-registry egress block (default: block Chainguard/Wolfi)
#   -k REF   use the DHI mixin kit instead of imperative wiring. REF must be a
#            PUBLISHED OCI kit (docker.io/<user>/dhi-mixin:1.0.0); a local ./dhi-mixin
#            or git ref fails cloud assembly. In kit mode the MCP registration,
#            dhi.io egress, competitor deny and steering all come from the kit,
#            so -M and -C do not apply.
#
# Secrets (openai, github) must exist BEFORE create; this script sets them from
# $OPENAI_API_KEY / $GITHUB_TOKEN if they are missing and the var is exported.
# Export DOCKER_USERNAME + DOCKER_PAT too to enable the DHI *mirror* tools
# (the PAT is injected as an HTTP header by the proxy, never entering the sandbox).
# Env overrides: SBX_DEMO_NAME, SBX_DEMO_TTL, SBX_DEMO_DHI_MCP, SBX_DEMO_DENY_COMPETITORS, SBX_DEMO_KIT

set -euo pipefail
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd); . "$HERE/../../lib/common.sh"

NAME="${SBX_DEMO_NAME:-codex-dhi-demo}"
TTL="${SBX_DEMO_TTL:-1h}"
MCP="${SBX_DEMO_DHI_MCP:-https://dhi.io/mcp}"   # DHI MCP endpoint added to Codex; "" to skip
WANT_GITHUB=1; ENVS=(); ATTACH=0; WANT_DENY=1; KIT="${SBX_DEMO_KIT:-}"

# Competitor image registries to block at the network edge, so a drifting agent
# cannot pull from them even if steering fails and it tries anyway. Deny rules beat
# the balanced allow list; DHI pulls (Docker Hub) are untouched. Override the list
# with $SBX_DEMO_DENY_COMPETITORS (comma-separated), or skip the block with -C.
DENY_COMPETITORS="${SBX_DEMO_DENY_COMPETITORS:-cgr.dev,*.cgr.dev,chainguard.dev,*.chainguard.dev,wolfi.dev,*.wolfi.dev,apk.dag.dev}"

while getopts "n:t:M:Ge:ACk:h" opt; do
  case $opt in
    n) NAME=$OPTARG ;; t) TTL=$OPTARG ;; M) MCP=$OPTARG ;;
    G) WANT_GITHUB=0 ;; e) ENVS+=("$OPTARG") ;; A) ATTACH=1 ;; C) WANT_DENY=0 ;; k) KIT=$OPTARG ;;
    h) sed -n '3,27p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;; *) exit 2 ;;
  esac
done

need_sbx

# has_secret SERVICE -> 0 if a secret for that service is already stored
has_secret() { sbx --cloud secret ls 2>/dev/null | awk 'NR>1{print $2}' | grep -qx "$1"; }

# ensure_secret SERVICE ENVVAR -> set from the env var if missing (and exported)
ensure_secret() {
  local svc=$1 var=$2
  if has_secret "$svc"; then note "secret '$svc' already stored"; return; fi
  if [ -n "${!var:-}" ]; then
    log "Storing '$svc' secret from \$$var"
    printf '%s' "${!var}" | sbx --cloud secret set "$svc" >/dev/null
  else
    warn "No '$svc' secret and \$$var is not set. Codex may wait for credentials."
    note "Fix: export $var, or 'echo \$$var | sbx --cloud secret set $svc', then relaunch."
  fi
}

EXTRA=()
for e in ${ENVS[@]+"${ENVS[@]}"}; do validate_env "$e"; EXTRA+=(--env "$e"); done

cloud_preflight "$NAME"

log "Ensuring credentials (applied at create time)"
ensure_secret openai OPENAI_API_KEY
[ "$WANT_GITHUB" -eq 1 ] && ensure_secret github GITHUB_TOKEN

# DHI mirror tools (dhi_list_mirrors, dhi_create_mirror, dhi_remove_mirror) need
# Docker Hub creds as X-Docker-* headers. The proxy injects them on dhi.io, so
# the PAT never enters the sandbox. Opt in by exporting DOCKER_USERNAME + DOCKER_PAT.
if [ -n "${DOCKER_USERNAME:-}" ] && [ -n "${DOCKER_PAT:-}" ]; then
  if [ -n "$KIT" ]; then
    # Kit mode: the kit declares credential@1 for services dhi-mcp-user / dhi-mcp-pat
    # and owns the inject rules, so bind them as plain cloud secrets (not set-custom).
    log "Binding DHI mirror-tool secrets (dhi-mcp-user, dhi-mcp-pat) for the kit"
    printf '%s' "$DOCKER_USERNAME" | sbx --cloud secret set dhi-mcp-user >/dev/null
    printf '%s' "$DOCKER_PAT"      | sbx --cloud secret set dhi-mcp-pat  >/dev/null
  else
    log "Enabling DHI mirror tools (proxy-injected X-Docker-* headers on dhi.io)"
    sbx --cloud secret set-custom --name dhi-mcp-user --host dhi.io \
      --header X-Docker-Username --format '%s' --value "$DOCKER_USERNAME" >/dev/null
    sbx --cloud secret set-custom --name dhi-mcp-pat --host dhi.io \
      --header X-Docker-Pat --format '%s' --value "$DOCKER_PAT" >/dev/null
  fi
  note "Mirror tools enabled. Remove later: sbx --cloud secret rm -f dhi-mcp-user dhi-mcp-pat"
elif [ -n "${DOCKER_USERNAME:-}${DOCKER_PAT:-}" ]; then
  warn "Set BOTH DOCKER_USERNAME and DOCKER_PAT for DHI mirror tools; continuing with read-only tools."
else
  note "DHI read-only tools only. Export DOCKER_USERNAME + DOCKER_PAT for mirror tools."
fi

if [ -n "$KIT" ]; then
  # ---- Kit mode: the DHI mixin kit supplies the MCP registration, the dhi.io
  # egress, the competitor deny and the steering. We only create codex with the
  # kit attached and set the balanced base; the kit layers its rules on top.
  log "Creating '$NAME': codex + DHI mixin kit, micro (1 vCPU / 2 GiB), ttl $TTL (stop on timeout)"
  note "kit: $KIT"
  note "MCP, dhi.io egress, competitor deny and steering all come from the kit"
  sbx --cloud run -d \
    --name "$NAME" \
    --cpus 1 --memory 2g \
    --ttl "$TTL" --on-timeout stop \
    --kit "$KIT" \
    ${EXTRA[@]+"${EXTRA[@]}"} \
    codex

  log "Applying the Balanced base policy to '$NAME' (the kit adds dhi.io allow + competitor deny on top)"
  sbx --cloud policy init balanced --sandbox "$NAME" \
    || warn "Could not set the balanced policy; the sandbox keeps the default."

  WIRING="DHI capability via mixin kit: $KIT"
  DENY_LABEL=" (Chainguard/Wolfi denied by kit)"
else
  # ---- Imperative mode: wire everything by hand (the "under the hood" version).
  log "Creating '$NAME': codex, micro (1 vCPU / 2 GiB), ttl $TTL (stop on timeout)"
  note "egress: Balanced + dhi.io"
  sbx --cloud run -d \
    --name "$NAME" \
    --cpus 1 --memory 2g \
    --ttl "$TTL" --on-timeout stop \
    --allow-network dhi.io \
    ${EXTRA[@]+"${EXTRA[@]}"} \
    codex

  log "Applying the Balanced network policy to '$NAME' (keeps the dhi.io allow)"
  # balanced = deny-all plus the balanced allow list; --sandbox keeps existing rules.
  sbx --cloud policy init balanced --sandbox "$NAME" \
    || warn "Could not set the balanced policy; the sandbox keeps the default."

  # Hard block for competitor registries. AGENTS.md only *steers* toward DHI; this
  # is the enforcement. Deny rules take precedence over the balanced allow list, so
  # even if the model ignores the steering and tries `docker pull cgr.dev/...`, the
  # pull fails at the sandbox edge. DHI stays reachable (it resolves via Docker Hub).
  if [ "$WANT_DENY" -eq 1 ] && [ -n "$DENY_COMPETITORS" ]; then
    log "Denying competitor registries on '$NAME' (deny beats the balanced allow)"
    note "denied: $DENY_COMPETITORS"
    sbx --cloud policy deny network --sandbox "$NAME" "$DENY_COMPETITORS" \
      || warn "Could not add the competitor deny rule; the agent could still reach Chainguard."
  else
    note "Competitor deny block skipped (-C); only AGENTS.md steering keeps the agent on DHI."
  fi

  if [ -n "$MCP" ]; then
    log "Wiring the DHI MCP server into Codex ($MCP)"
    # dhi.io/mcp serves read-only DHI tools with no auth; it is registered in
    # Codex's config, so a NEW Codex session picks it up (not the first one).
    if sbx --cloud exec "$NAME" codex mcp add dhi --url "$MCP" >/dev/null 2>&1; then
      note "Added 'dhi' to Codex. Open a NEW Codex session, then /mcp to see its tools."
    else
      warn "Could not add the DHI MCP server. Add it by hand:"
      note "sbx --cloud exec $NAME codex mcp add dhi --url $MCP"
    fi

    # Steer Codex to actually USE the DHI tools. Without this, a request like
    # "pull a hardened nginx" resolves to a third-party hardened registry from training, not
    # DHI. The steering text lives in AGENTS.md beside this script; deploy it to
    # the Codex workspace (~/workspace/AGENTS.md), which Codex reads at session start.
    if [ -f "$HERE/AGENTS.md" ]; then
      sbx --cloud exec "$NAME" sh -lc 'mkdir -p ~/workspace && cat > ~/workspace/AGENTS.md' < "$HERE/AGENTS.md" \
        && note "Deployed AGENTS.md to ~/workspace so Codex prefers DHI for hardened images." \
        || warn "Could not write the AGENTS.md steering file."
    fi
  fi

  WIRING="DHI MCP: ${MCP:-none}"
  DENY_LABEL=""
  [ "$WANT_DENY" -eq 1 ] && [ -n "$DENY_COMPETITORS" ] && DENY_LABEL=" (Chainguard/Wolfi denied)"
fi

echo
log "Ready."
cat <<MSG

This reproduces the Agentic Platform card:
  codex  |  OpenAI key (proxy-injected)  |  GitHub token  |  ${WIRING}
  micro compute  |  Balanced + dhi.io egress${DENY_LABEL}  |  stops after $TTL

Attach and start (open a NEW Codex session so it loads the DHI tools):

  sbx --cloud attach $NAME
  # in Codex:  /mcp   ->   dhi_list_repositories, dhi_get_image_cves, ...

Inspect what was applied:

  sbx --cloud policy ls $NAME     # network rules on this sandbox
  sbx --cloud exec $NAME codex mcp list    # DHI MCP registration
  ./teardown.sh                   # delete when done
MSG

if [ "$ATTACH" -eq 1 ]; then log "Attaching to $NAME"; exec sbx --cloud attach "$NAME"; fi

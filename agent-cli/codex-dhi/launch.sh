#!/usr/bin/env bash
#
# One-shot "Docker Agentic Platform" launch, as a script:
#   Codex, with your OpenAI key, GitHub token for repo access, the DHI MCP
#   server, Balanced egress plus dhi.io, on micro compute, stopping after 1h.
#
#   ./launch.sh [-n NAME] [-t TTL] [-M MCP] [-G] [-e KEY[=VALUE]]... [-A]
#
#   -n NAME  sandbox name (default: codex-dhi-demo)
#   -t TTL   time to live (default: 1h; on timeout the sandbox stops)
#   -M MCP   DHI MCP server name on the cloud gateway (default: dhi; see README)
#   -G       skip the GitHub token wiring (default: include it)
#   -e VAR   env var, KEY=VALUE or bare KEY (copied from your shell); repeatable
#   -A       attach to the agent session when it is ready
#
# Secrets (openai, github) must exist BEFORE create; this script sets them from
# $OPENAI_API_KEY / $GITHUB_TOKEN if they are missing and the var is exported.
# Env overrides: SBX_DEMO_NAME, SBX_DEMO_TTL, SBX_DEMO_MCP

set -euo pipefail
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd); . "$HERE/../../lib/common.sh"

NAME="${SBX_DEMO_NAME:-codex-dhi-demo}"
TTL="${SBX_DEMO_TTL:-1h}"
MCP="${SBX_DEMO_MCP:-dhi}"
WANT_GITHUB=1; ENVS=(); ATTACH=0

while getopts "n:t:M:Ge:Ah" opt; do
  case $opt in
    n) NAME=$OPTARG ;; t) TTL=$OPTARG ;; M) MCP=$OPTARG ;;
    G) WANT_GITHUB=0 ;; e) ENVS+=("$OPTARG") ;; A) ATTACH=1 ;;
    h) sed -n '3,18p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;; *) exit 2 ;;
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
[ -n "$MCP" ] && EXTRA+=(--static-mcp "$MCP")

cloud_preflight "$NAME"

log "Ensuring credentials (applied at create time)"
ensure_secret openai OPENAI_API_KEY
[ "$WANT_GITHUB" -eq 1 ] && ensure_secret github GITHUB_TOKEN

log "Creating '$NAME': codex, micro (1 vCPU / 2 GiB), ttl $TTL (stop on timeout)"
note "MCP: ${MCP:-none}   egress: Balanced + dhi.io"
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

echo
log "Ready."
cat <<MSG

This reproduces the Agentic Platform card:
  codex  |  OpenAI key (proxy-injected)  |  GitHub token  |  DHI MCP ($MCP)
  micro compute  |  Balanced + dhi.io egress  |  stops after $TTL

Attach and start:

  sbx --cloud attach $NAME

Inspect what was applied:

  sbx --cloud policy ls $NAME     # network rules on this sandbox
  sbx --cloud ttl $NAME           # remaining time
  ./teardown.sh                   # delete when done
MSG

if [ "$ATTACH" -eq 1 ]; then log "Attaching to $NAME"; exec sbx --cloud attach "$NAME"; fi

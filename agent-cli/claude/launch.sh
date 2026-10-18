#!/usr/bin/env bash
#
# Claude: Anthropic's coding agent, as a built-in cloud sandbox agent.
# No web UI — you attach to a terminal session.
#
#   ./launch.sh [-n NAME] [-t TTL] [-s SIZE] [-k MIXIN_KIT] [-r REPO_URL] [-e KEY[=VALUE]]... [-A]
#
#   -n NAME  sandbox name (default: codex-demo)
#   -t TTL   time to live, e.g. 2h, 90m (default: 4h; 24h hard cap)
#   -s SIZE  micro|small|medium|large|xl (default: small = 2 vCPU / 4 GiB)
#   -k KIT   optional mixin kit to layer on top (repeatable with more -k)
#   -r URL   public https git repo to clone into the sandbox
#   -e VAR   env var, KEY=VALUE or bare KEY (copied from your shell); repeatable
#   -A       attach to the agent session when it is ready (otherwise just print how)
#
# Env overrides: SBX_DEMO_NAME, SBX_DEMO_TTL, SBX_DEMO_SIZE, SBX_DEMO_REPO

set -euo pipefail
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd); . "$HERE/../../lib/common.sh"

AGENT=claude
NAME="${SBX_DEMO_NAME:-claude-demo}"
TTL="${SBX_DEMO_TTL:-4h}"
SIZE="${SBX_DEMO_SIZE:-small}"
REPO="${SBX_DEMO_REPO:-}"
KITS=(); ENVS=(); ATTACH=0

while getopts "n:t:s:k:r:e:Ah" opt; do
  case $opt in
    n) NAME=$OPTARG ;; t) TTL=$OPTARG ;; s) SIZE=$OPTARG ;;
    k) KITS+=("$OPTARG") ;; r) REPO=$OPTARG ;; e) ENVS+=("$OPTARG") ;;
    A) ATTACH=1 ;; h) sed -n '3,16p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) exit 2 ;;
  esac
done

need_sbx; size_resources "$SIZE"

EXTRA=()
[ -n "$REPO" ] && EXTRA+=(--allow-network "$(repo_host "$REPO")")
for k in ${KITS[@]+"${KITS[@]}"}; do EXTRA+=(--kit "$k"); done
for e in ${ENVS[@]+"${ENVS[@]}"}; do validate_env "$e"; EXTRA+=(--env "$e"); done

cloud_preflight "$NAME"

log "Creating cloud sandbox '$NAME' ($AGENT, $SIZE, ttl $TTL)"
sbx --cloud run -d \
  --name "$NAME" --cpus "$CPUS" --memory "$MEM" --ttl "$TTL" \
  ${EXTRA[@]+"${EXTRA[@]}"} "$AGENT"

[ -n "$REPO" ] && clone_into_home "$NAME" "$REPO"

echo
log "Ready."
cat <<MSG

Claude needs an Anthropic credential. Store one before launching so the proxy
injects it (nothing to sign into inside the sandbox):

  sbx --cloud secret set anthropic --oauth          # Claude subscription (OAuth)
  echo "$ANTHROPIC_API_KEY" | sbx --cloud secret set anthropic

Attach to the agent session:

  sbx --cloud attach $NAME

Useful: sbx --cloud ttl $NAME   (show/extend TTL)   •   ./teardown.sh   (delete)
MSG

if [ "$ATTACH" -eq 1 ]; then
  log "Attaching to $NAME"
  exec sbx --cloud attach "$NAME"
fi

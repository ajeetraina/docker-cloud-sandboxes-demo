#!/usr/bin/env bash
#
# Mend AI Security (v3 mixin) on the claude agent.
# Adds the Mend CLI; discovers AI models/frameworks/system prompts in a repo and
# generates an AI-BOM via 'mend ai scan'. The kit composes onto any v3 workload.
#
#   ./launch.sh [-n NAME] [-t TTL] [-s SIZE] [-k KIT] [-r REPO_URL] [-e KEY[=VALUE]]... [-S]
#
#   -n NAME  sandbox name (default: mend-ai-demo)
#   -t TTL   time to live, e.g. 2h, 90m (default: 4h; 24h hard cap)
#   -s SIZE  micro|small|medium|large|xl (default: small = 2 vCPU / 4 GiB)
#   -k KIT   kit reference (default: v3 mend-ai-security in ajeetraina/sbx-kits-mend)
#   -r URL   public https git repo to clone into the sandbox (the scan target)
#   -e VAR   env var, KEY=VALUE or bare KEY (copied from your shell); repeatable
#   -S       run 'mend ai scan' on the cloned repo after setup
#
# Env overrides: SBX_DEMO_NAME, SBX_DEMO_TTL, SBX_DEMO_SIZE, SBX_DEMO_KIT, SBX_DEMO_REPO

set -euo pipefail
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd); . "$HERE/../../lib/common.sh"

AGENT=claude
NAME="${SBX_DEMO_NAME:-mend-ai-demo}"
TTL="${SBX_DEMO_TTL:-4h}"
SIZE="${SBX_DEMO_SIZE:-small}"
KIT="${SBX_DEMO_KIT:-git+https://github.com/ajeetraina/sbx-kits-mend.git#dir=v3/mend-ai-security}"
REPO="${SBX_DEMO_REPO:-}"
ENVS=(); SCAN=0

while getopts "n:t:s:k:r:e:Sh" opt; do
  case $opt in
    n) NAME=$OPTARG ;; t) TTL=$OPTARG ;; s) SIZE=$OPTARG ;;
    k) KIT=$OPTARG ;; r) REPO=$OPTARG ;; e) ENVS+=("$OPTARG") ;;
    S) SCAN=1 ;; h) sed -n '3,17p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) exit 2 ;;
  esac
done

need_sbx; size_resources "$SIZE"
[ "$SCAN" -eq 1 ] && [ -z "$REPO" ] && die "-S needs a repo to scan. Pass -r https://github.com/owner/repo.git"

EXTRA=()
[ -n "$REPO" ] && EXTRA+=(--allow-network "$(repo_host "$REPO")")
for e in ${ENVS[@]+"${ENVS[@]}"}; do validate_env "$e"; EXTRA+=(--env "$e"); done

cloud_preflight "$NAME"

log "Creating cloud sandbox '$NAME' (claude + mend-ai-security v3, $SIZE, ttl $TTL)"
note "kit: $KIT"
sbx --cloud run -d \
  --name "$NAME" --cpus "$CPUS" --memory "$MEM" --ttl "$TTL" \
  --kit "$KIT" ${EXTRA[@]+"${EXTRA[@]}"} "$AGENT"

[ -n "$REPO" ] && clone_into_home "$NAME" "$REPO"

if [ "$SCAN" -eq 1 ]; then
  dir=$(basename "$REPO" .git)
  log "Running mend ai scan on ~/$dir"
  # The Mend CLI logs in itself (email + user key -> token). Without a login it
  # prints an actionable 'Unauthorized' message — see README. Non-zero = findings.
  sbx --cloud exec "$NAME" sh -c 'cd "$HOME/$1" && mend ai scan' _ "$dir" \
    || warn "mend exited non-zero (findings, or not logged in — see README)."
fi

echo
log "Ready."
cat <<MSG

The Mend CLI authenticates itself (it is NOT proxy-injected). Log in inside the
sandbox before scanning:

  sbx --cloud attach $NAME
  mend auth login          # or set MEND_EMAIL / MEND_USER_KEY and 'mend auth'

Then scan a repo:

  sbx --cloud exec $NAME sh -c 'cd ~/<dir> && mend ai scan'

./teardown.sh deletes the sandbox when you are done.
MSG

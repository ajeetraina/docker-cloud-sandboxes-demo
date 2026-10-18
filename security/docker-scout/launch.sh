#!/usr/bin/env bash
#
# Docker Scout CLI on the docker-agent base (needs a docker CLI).
# Adds 'docker scout' and scans a container image for CVEs.
#
#   ./launch.sh [-n NAME] [-t TTL] [-s SIZE] [-k KIT] [-i IMAGE] [-e KEY[=VALUE]]... [-S]
#
#   -n NAME  sandbox name (default: docker-scout-demo)
#   -t TTL   time to live, e.g. 2h, 90m (default: 4h; 24h hard cap)
#   -s SIZE  micro|small|medium|large|xl (default: small = 2 vCPU / 4 GiB)
#   -k KIT   kit reference (default: docker-scout in ajeetraina/sbx-kits-scout)
#   -i IMAGE image to scan with -S (default: alpine:latest)
#   -e VAR   env var, KEY=VALUE or bare KEY (copied from your shell); repeatable
#   -S       run 'docker scout cves IMAGE' after setup
#
# Env overrides: SBX_DEMO_NAME, SBX_DEMO_TTL, SBX_DEMO_SIZE, SBX_DEMO_KIT, SBX_DEMO_IMAGE

set -euo pipefail
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd); . "$HERE/../../lib/common.sh"

AGENT=docker-agent
NAME="${SBX_DEMO_NAME:-docker-scout-demo}"
TTL="${SBX_DEMO_TTL:-4h}"
SIZE="${SBX_DEMO_SIZE:-small}"
KIT="${SBX_DEMO_KIT:-git+https://github.com/ajeetraina/sbx-kits-scout.git}"
IMAGE="${SBX_DEMO_IMAGE:-alpine:latest}"
ENVS=(); SCAN=0

while getopts "n:t:s:k:i:e:Sh" opt; do
  case $opt in
    n) NAME=$OPTARG ;; t) TTL=$OPTARG ;; s) SIZE=$OPTARG ;;
    k) KIT=$OPTARG ;; i) IMAGE=$OPTARG ;; e) ENVS+=("$OPTARG") ;;
    S) SCAN=1 ;; h) sed -n '3,17p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) exit 2 ;;
  esac
done

need_sbx; size_resources "$SIZE"

EXTRA=()
for e in ${ENVS[@]+"${ENVS[@]}"}; do validate_env "$e"; EXTRA+=(--env "$e"); done

cloud_preflight "$NAME"

log "Creating cloud sandbox '$NAME' (docker-agent + docker-scout, $SIZE, ttl $TTL)"
note "kit: $KIT"
sbx --cloud run -d \
  --name "$NAME" --cpus "$CPUS" --memory "$MEM" --ttl "$TTL" \
  --kit "$KIT" ${EXTRA[@]+"${EXTRA[@]}"} "$AGENT"

log "Verifying the Scout plugin is installed"
sbx --cloud exec "$NAME" docker scout version 2>&1 | head -3 \
  || warn "'docker scout version' failed - the base may lack a docker CLI."

if [ "$SCAN" -eq 1 ]; then
  log "Running docker scout cves $IMAGE"
  # Scout's API and Docker Hub need a docker login for full results / to avoid
  # rate limits. Non-zero exit means CVEs were found, which is expected.
  sbx --cloud exec "$NAME" docker scout cves "$IMAGE" \
    || warn "docker scout exited non-zero (CVEs found, or not logged in - see README)."
fi

echo
log "Ready."
cat <<MSG

For full CVE enrichment, log in to Docker inside the sandbox (or store a token):

  echo "\$DOCKER_PAT" | sbx --cloud secret set docker       # if your setup supports it
  sbx --cloud attach $NAME
  docker login                                               # then:
  docker scout quickview $IMAGE
  docker scout cves $IMAGE

./teardown.sh deletes the sandbox when you are done.
MSG

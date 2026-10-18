#!/usr/bin/env bash
#
# Delete this demo's cloud sandbox.   ./teardown.sh [-n NAME]
#
set -euo pipefail
NAME="${SBX_DEMO_NAME:-mend-ai-demo}"
while getopts "n:h" opt; do
  case $opt in
    n) NAME=$OPTARG ;;
    h) echo "Usage: ./teardown.sh [-n NAME]"; exit 0 ;;
    *) exit 2 ;;
  esac
done
command -v sbx >/dev/null || { echo "sbx not found." >&2; exit 1; }
sbx --cloud rm --force "$NAME"

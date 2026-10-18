# Shared helpers for the docker-cloud-sandboxes-demo launchers.
# Sourced by each demo's launch.sh — not meant to run on its own.
#
# Every function here talks to Docker Cloud Sandboxes through `sbx --cloud`.
# Keep it POSIX-friendly bash; the launchers run `set -euo pipefail`.

# ---- pretty logging -------------------------------------------------------
if [ -t 1 ]; then
  _C_BLUE=$'\033[34m'; _C_YELL=$'\033[33m'; _C_RED=$'\033[31m'
  _C_DIM=$'\033[2m';   _C_OFF=$'\033[0m'
else
  _C_BLUE=; _C_YELL=; _C_RED=; _C_DIM=; _C_OFF=
fi
log()  { printf '%s==>%s %s\n'      "$_C_BLUE" "$_C_OFF" "$*"; }
note() { printf '%s    %s%s\n'      "$_C_DIM"  "$*" "$_C_OFF"; }
warn() { printf '%sWARNING:%s %s\n' "$_C_YELL" "$_C_OFF" "$*" >&2; }
die()  { printf '%sError:%s %s\n'   "$_C_RED"  "$_C_OFF" "$*" >&2; exit 1; }

# ---- preconditions --------------------------------------------------------
need_sbx() {
  command -v sbx >/dev/null \
    || die "sbx not found. Install: https://docs.docker.com/ai/sandboxes/get-started/"
}

# cloud_preflight NAME — verify cloud access, and that NAME is not already taken.
cloud_preflight() {
  local name=$1 existing
  log "Checking cloud sandbox access"
  if ! existing=$(sbx --cloud ls -q 2>&1); then
    printf '%s\n' "$existing" >&2
    die "Could not reach Docker Cloud Sandboxes. Run 'sbx login' and try again."
  fi
  if awk -F/ -v n="$name" '$NF == n { f = 1 } END { exit !f }' <<<"$existing"; then
    die "A cloud sandbox named '$name' already exists. Run ./teardown.sh first, or pass -n NAME."
  fi
}

# size_resources SIZE — set CPUS and MEM globals from a t-shirt size.
size_resources() {
  case $1 in
    micro)  CPUS=1;  MEM=2g  ;;
    small)  CPUS=2;  MEM=4g  ;;
    medium) CPUS=4;  MEM=8g  ;;
    large)  CPUS=8;  MEM=16g ;;
    xl)     CPUS=16; MEM=32g ;;
    *) die "Unknown size '$1' (use micro, small, medium, large or xl)." ;;
  esac
}

# validate_env TOKEN — accept KEY=VALUE, or a bare KEY that exists in the shell.
validate_env() {
  local e=$1 key=${1%%=*}
  case $key in
    ''|[0-9]*|*[!A-Za-z0-9_]*) die "Invalid env var name '$key' for -e." ;;
  esac
  if [ "$key" = "$e" ] && [ -z "${!key+x}" ]; then
    die "-e $key: not set in your shell. Use -e $key=VALUE or export it first."
  fi
}

# repo_host URL — validate an https repo URL and echo its host (for --allow-network).
repo_host() {
  local url=$1 host
  case $url in https://*) ;; *) die "Repo must be an https:// URL (got '$url')." ;; esac
  host=${url#https://}; host=${host%%/*}
  case $host in *@*) die "Don't embed credentials in the repo URL." ;; esac
  printf '%s' "$host"
}

# clone_into_home NAME REPO — clone a public repo into the sandbox user's $HOME.
# Echoes nothing; prints a note. Assumes the repo host is already allowed.
clone_into_home() {
  local name=$1 repo=$2
  log "Cloning $repo into the sandbox"
  sbx --cloud exec "$name" sh -c 'cd "$HOME" && git clone -- "$1" "$(basename "$1" .git)"' _ "$repo" \
    || die "Clone failed. Was the repo host passed to --allow-network, and is the repo public?"
  note "Cloned into ~/$(basename "$repo" .git) in the sandbox."
}

# wait_http NAME PORT PATH — poll an in-sandbox HTTP endpoint for up to ~3 min.
# PATH empty  => success when the port answers at all (any HTTP status on /).
# PATH set    => success only on a 2xx from that path.
wait_http() {
  local name=$1 port=$2 path=$3 _
  for _ in $(seq 1 60); do
    if [ -n "$path" ]; then
      sbx --cloud exec "$name" curl -fsS -o /dev/null "http://localhost:$port$path" 2>/dev/null && return 0
    else
      sbx --cloud exec "$name" curl -sS  -o /dev/null "http://localhost:$port/"     2>/dev/null && return 0
    fi
    sleep 3
  done
  return 1
}

#!/usr/bin/env bash
# Replays the output of a real `go run ./parallel` run, for recording the GIF.
# The numbers are from an actual 5-sandbox run (see ../README.md).
printf '$ go run ./parallel\n'
sleep 0.6
printf 'Spinning up 5 sandboxes in parallel...\n'
sleep 3.5
cat <<'OUT'

KIT      TIME      OUTPUT
----------------------------------------------------
python   7.33s     Python 3.12.15
node     9.683s    Node v22.23.3
go       19.989s   go version go1.25.14 linux/amd64
ruby     17.818s   Ruby 3.3.12
alpine   5.951s    Alpine 3.20.10

5/5 ok | wall 19.989s vs sequential 1m0.771s | 3.0x faster in parallel
OUT
sleep 1.6

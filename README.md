# Docker Cloud Sandboxes Demos

A collection of small, copy-and-run demos that each launch a **Docker cloud
sandbox** using the `sbx --cloud` CLI. One folder per demo, each with:

- `launch.sh` to create the sandbox, wire it up, and print how to reach it
- `teardown.sh` to delete it
- `README.md` for what it does and how to drive it

They share one small library, [`lib/common.sh`](lib/common.sh), for logging,
preflight checks, the size table, and repo cloning, so each `launch.sh` stays
short.


## Requirements

- `sbx` installed and signed in (`sbx login`). Built against v0.48.0.
- Access to Docker cloud sandboxes. `sbx --cloud ls` should not error.

## The demos

| Folder | Agent / kit | How you reach it |
| --- | --- | --- |
| [`agent-cli/claude`](agent-cli/claude) | Claude Code | `sbx --cloud attach` |
| [`agent-cli/codex`](agent-cli/codex) | Codex | `sbx --cloud attach` |
| [`agent-cli/opencode`](agent-cli/opencode) | OpenCode | `sbx --cloud attach` |
| [`agent-cli/gemini`](agent-cli/gemini) | Gemini CLI | `sbx --cloud attach` |
| [`agent-cli/codex-dhi`](agent-cli/codex-dhi) | Codex + Docker DHI (one-shot recipe) | `sbx --cloud attach` |

The four agents are built-in cloud agents. `codex-dhi` is a recipe that wires
several options at once (OpenAI + GitHub secrets, the Docker Hardened Images
(DHI) MCP server, Balanced + dhi.io egress, micro, 1h) to mirror the Agentic
Platform's "Welcome" card, and steers Codex to pull hardened base images from
Docker DHI (dhi.io).

```bash
cd agent-cli/codex
./launch.sh                  # create the sandbox and print how to drive it
./launch.sh -A               # create, then attach immediately
./launch.sh -n my-demo -t 2h -s large
./teardown.sh                # delete when done
```

<img width="1807" height="456" alt="image" src="https://github.com/user-attachments/assets/bee94f0b-3951-46f5-baa8-698626a8e2d5" />


## Common options

Every `launch.sh` accepts these (defaults differ per demo, see `-h`):

| Option | Env override | Meaning |
| --- | --- | --- |
| `-n NAME` | `SBX_DEMO_NAME` | Sandbox name. `teardown.sh` reads the same variable. |
| `-t TTL` | `SBX_DEMO_TTL` | Time to live, e.g. `90m`, `2h`. Hard cap 24h from creation. |
| `-s SIZE` | `SBX_DEMO_SIZE` | `micro` (1 vCPU/2 GiB), `small` (2/4), `medium` (4/8), `large` (8/16), `xl` (16/32). |
| `-e VAR` | - | Env var, `KEY=VALUE` or bare `KEY` (copied from your shell). Repeatable. |

The `agent-cli` demos add `-r URL` (clone a repo), `-k REF` (layer a kit) and
`-A` (attach when ready). `-h` prints the full list per launcher.

## Credentials: prefer secrets over env vars

The sandbox never sees the real value. The cloud proxy injects it into outbound
requests to the matching service. Store them before launching (a secret only
reaches sandboxes created afterwards):

```bash
sbx --cloud secret set anthropic --oauth          # Claude subscription (OAuth)
echo "$OPENAI_API_KEY" | sbx --cloud secret set openai
echo "$GEMINI_API_KEY" | sbx --cloud secret set google
sbx --cloud secret ls
```

## Drive it from code (Go SDK)

The demos above use the `sbx` CLI. The same cloud sandboxes can be driven
programmatically with the [Docker Sandboxes SDK](https://github.com/docker/sandboxes-api).
[`sdk/go`](sdk/go) has runnable Go examples including a parallel fan-out that
spins up several sandboxes at once (easy in code, awkward from the CLI):

```bash
cd sdk/go
export DOCKER_USERNAME=... DOCKER_PAT=...   # or DOCKER_ACCESS_TOKEN
go run ./hello       # one sandbox: create -> run -> delete
go run ./parallel    # N sandboxes at once, with a parallel-vs-sequential speedup
```

The TypeScript/Python packages are not on npm/PyPI yet, so Go (`go get`) and the
REST API are the works-today paths. See [`sdk/go/README.md`](sdk/go/README.md).

## Cleaning up

```bash
./teardown.sh                 # inside a demo folder (uses that demo's default name)
sbx --cloud ls                # list everything still running
sbx --cloud prune             # remove all stopped sandboxes
```

Cloud sandboxes bill while they run and auto-expire at their TTL, but tear them
down when finished so nothing lingers.

## Status

- [x] `agent-cli/codex` created, cloned a repo into it, verified running, torn down (live-tested).
- [x] `agent-cli/codex-dhi` DHI MCP wired and used live (Codex recommended `dhi.io/nginx:...-fips` via the `dhi` tools).
- [x] `sdk/go` Go SDK verified live: `hello` created a sandbox, ran Python, and auto-deleted it via PAT auth.
- [ ] `agent-cli/claude`, `agent-cli/opencode`, `agent-cli/gemini` use the same path, not separately live-tested.

# Docker Cloud Sandboxes — v3 kit demos

A collection of small, copy-and-run demos that each launch a **Docker cloud
sandbox** for a different **Kits v3** kit, using the `sbx --cloud` CLI. One
folder per kit. Every folder has the same three files:

- `launch.sh` — create the sandbox, wire it up, print how to reach it
- `teardown.sh` — delete it
- `README.md` — what it does and how to drive it

They share one small library, [`lib/common.sh`](lib/common.sh) (logging,
preflight checks, the size table, repo cloning), so each `launch.sh` stays short
and focused on what makes that kit different.

## Requirements

- `sbx` installed and signed in (`sbx login`). Built against **v0.48.0**.
- Access to Docker cloud sandboxes — `sbx --cloud ls` should not error.

## Why v3 only

These demos deliberately stick to **Kits v3** (`schemaVersion: "3"`, the typed
`capabilities` descriptor). v3 today is **workload agents** and **mixins** —
there are no v3 web-UI kits yet, so there is no `web-ui/` category (the earlier
code-server / claude-mem demos were v2 and have been removed).

## The demos

| Folder | Kit | v3 kind | Base | Source |
| --- | --- | --- | --- | --- |
| [`agent-cli/codex`](agent-cli/codex) | Codex | workload | — | built-in cloud agent |
| [`agent-cli/opencode`](agent-cli/opencode) | OpenCode | workload | — | built-in cloud agent |
| [`security/mend-ai-security`](security/mend-ai-security) | Mend AI Security | mixin | claude | [sbx-kits-mend](https://github.com/ajeetraina/sbx-kits-mend) |
| [`security/docker-scout`](security/docker-scout) | Docker Scout CLI | mixin | docker-agent | [sbx-kits-scout](https://github.com/ajeetraina/sbx-kits-scout) |

```bash
cd security/mend-ai-security
./launch.sh                  # create the sandbox and print how to drive it
./launch.sh -n my-demo -t 2h -s large
./teardown.sh                # delete when done
```

## Two v3 patterns

1. **Workload agent** — `sbx --cloud run ... codex`. The agent *is* a v3
   workload. Built-in cloud agents: `claude`, `codex`, `cursor`, `devin`,
   `docker-agent`, `gemini`, `opencode`, `shell`. Used by the `agent-cli/` demos.
2. **Mixin layered on a workload** — `sbx --cloud run ... --kit <ref> claude`.
   A v3 mixin adds typed capabilities (network policy, credentials, files,
   hooks) to the base agent. Used by the `security/` demos.

## Common options

Every `launch.sh` accepts these (defaults differ per demo — see `-h`):

| Option | Env override | Meaning |
| --- | --- | --- |
| `-n NAME` | `SBX_DEMO_NAME` | Sandbox name. `teardown.sh` reads the same variable. |
| `-t TTL` | `SBX_DEMO_TTL` | Time to live, e.g. `90m`, `2h`. Hard cap 24h from creation. |
| `-s SIZE` | `SBX_DEMO_SIZE` | `micro` (1 vCPU/2 GiB), `small` (2/4), `medium` (4/8), `large` (8/16), `xl` (16/32). |
| `-k KIT` | `SBX_DEMO_KIT` | Kit reference (mixin demos). See "Referencing a v3 kit" below. |
| `-r URL` | `SBX_DEMO_REPO` | Public `https://` repo to clone (scan target); its host is added to egress. |
| `-e VAR` | — | Env var, `KEY=VALUE` or bare `KEY` (copied from your shell). Repeatable. |

Scan demos add `-S` (scan during launch); `docker-scout` uses `-i IMAGE` instead
of `-r`. `agent-cli` demos add `-A` (attach when ready). `-h` prints the full
list per launcher.

## Referencing a v3 kit

A git reference resolves the repo's **default branch**, so the kit's descriptor
must be on `main`:

```
git+https://github.com/<owner>/<repo>.git#dir=<path-to-kit-folder>
# e.g. git+https://github.com/ajeetraina/sbx-kits-mend.git#dir=v3/mend-ai-security
```

A published OCI artifact works too, e.g. `docker.io/sbx/<kit>-kit:latest`.
Point any mixin launcher at another kit with `-k`, or copy a folder and change
the default `KIT=` line (and `AGENT=` for a different base).

## Credentials: prefer secrets over env vars

The sandbox never sees the real value — the cloud proxy injects it into outbound
requests to the matching service. Store them **before** launching (a secret only
reaches sandboxes created afterwards):

```bash
sbx --cloud secret set anthropic --oauth          # Claude subscription (OAuth)
echo "$OPENAI_API_KEY" | sbx --cloud secret set openai
sbx --cloud secret ls
```

Some tools authenticate themselves rather than via the proxy — Mend
(`mend auth login`) and `docker login` for Scout — see each demo's README.

## More v3 kits (pending)

These v3 kits exist but their descriptors are on **feature branches**, so a
`git+https` ref can't resolve them from the cloud until they land on `main`:
`gitguardian`, `datadog-ai-guard`, `dynatrace`, `sonar-vortex`. Add a demo
folder for each once merged (copy `security/mend-ai-security` and swap `KIT=`).

## Cleaning up

```bash
./teardown.sh                 # inside a demo folder (uses that demo's default name)
sbx --cloud ls                # list everything still running
sbx --cloud prune             # remove all stopped sandboxes
```

Cloud sandboxes bill while they run and auto-expire at their TTL, but tear them
down when finished so nothing lingers.

## Status

- [x] `agent-cli/codex` — created a cloud sandbox, cloned a repo into it, verified running, torn down (live-tested).
- [ ] `agent-cli/opencode` — same path as codex; not separately live-tested.
- [ ] `security/mend-ai-security` — v3 mixin via `git+https` on `--cloud`; scripted but not yet live-tested.
- [ ] `security/docker-scout` — v3 mixin on `docker-agent` via `git+https` on `--cloud`; scripted but not yet live-tested.

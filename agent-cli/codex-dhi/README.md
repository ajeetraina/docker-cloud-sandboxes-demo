# Codex + DHI one-shot demo

Reproduces the Docker Agentic Platform "Welcome" card as a single script:

> Launch **codex** with your OpenAI API key. It runs in a sandbox with
> **Balanced** and **dhi-only-registries** access (**dhi.io**), on **micro**
> compute, and **stops after 1 hour**. Added **GitHub token** for repo access.

Plus it wires the **DHI MCP server** into Codex so you get the Docker Hardened
Images tools (`dhi_list_repositories`, `dhi_get_image_cves`, ...).

```bash
export OPENAI_API_KEY=sk-...      # only needed if you have no 'openai' secret yet
export GITHUB_TOKEN=ghp_...       # only needed if you have no 'github' secret yet
./launch.sh                       # build it, wire DHI MCP, print how to attach
./launch.sh -A                    # build it, then attach
./launch.sh -t 2h                 # longer TTL
./launch.sh -M ""                 # skip the DHI MCP wiring
./launch.sh -G                    # skip the GitHub token
./teardown.sh
```

## What each option maps to

| Card | CLI |
| --- | --- |
| Launch `codex` | `sbx --cloud run -d ... codex` |
| your OpenAI API key | `sbx --cloud secret set openai` (set before create) |
| GitHub token for repo access | `sbx --cloud secret set github` (set before create) |
| micro compute | `--cpus 1 --memory 2g` |
| stops after 1 hour | `--ttl 1h --on-timeout stop` |
| Balanced access | `sbx --cloud policy init balanced --sandbox NAME` |
| dhi.io / dhi-only-registries | `--allow-network dhi.io` |
| DHI MCP server | `codex mcp add dhi --url https://dhi.io/mcp` (inside the sandbox) |

## The commands it runs

Secrets apply at **create time**, so they are set first; then create, policy,
then the DHI MCP wiring:

```bash
printf '%s' "$OPENAI_API_KEY" | sbx --cloud secret set openai
printf '%s' "$GITHUB_TOKEN"   | sbx --cloud secret set github

sbx --cloud run -d --name codex-dhi-demo \
  --cpus 1 --memory 2g \
  --ttl 1h --on-timeout stop \
  --allow-network dhi.io \
  codex

sbx --cloud policy init balanced --sandbox codex-dhi-demo
sbx --cloud exec codex-dhi-demo codex mcp add dhi --url https://dhi.io/mcp
```

## The DHI MCP server

`https://dhi.io/mcp` is the Docker Hardened Images MCP server. Its search /
inspect / SBOM / CVE / attestation tools are **read-only and need no auth**, so
the script adds it straight into Codex's own MCP config with `codex mcp add`.
Verified tools:

```
dhi_list_repositories   dhi_get_repository        dhi_get_tag_definition
dhi_get_image_details   dhi_get_image_packages    dhi_get_image_cves
dhi_get_image_attestations   dhi_list_mirrors   dhi_create_mirror   dhi_remove_mirror
```

(The mirror-management tools need Docker Hub credentials via `X-Docker-Username`
/ `X-Docker-Pat` headers; the rest work unauthenticated.)

**Open a new Codex session to see them.** `codex mcp add` writes
`~/.codex/config.toml`, which Codex reads at session start — so the session that
was already running when you launched won't show the tools. Attach and start a
fresh Codex session (the `+` tab in the web UI), then run `/mcp`.

### Why not the gateway URL or `--static-mcp`?

- The platform's **MCP gateway URL** (`https://gateway.docker.com/mcp/gateways/.../mcp`)
  requires an **OAuth bearer token** (a plain request returns `401` with
  `WWW-Authenticate: Bearer`), so it is not a drop-in `--url`. The direct
  `https://dhi.io/mcp` endpoint needs no auth and is simpler.
- `--static-mcp` resolves a Docker-**hosted catalog**; `dhi.io` / `dhi` are not
  in it (`not in the catalog`), and a sandbox created without `--static-mcp` has
  no gateway to `sbx --cloud mcp load` into. Wiring Codex directly sidesteps all
  of that.

## Notes

- `Balanced` = deny-all plus the balanced allow list; the `--sandbox` form keeps
  the `dhi.io` allow this script adds. Inspect with `sbx --cloud policy ls codex-dhi-demo`.
- For a strict **dhi-only-registries** posture, also deny the default registries,
  e.g. `--deny-network registry-1.docker.io --deny-network docker.io`.
- Secrets added to a **running** sandbox do not backfill; set them first, then
  `./teardown.sh && ./launch.sh`.
- `micro` is billed per second (about $0.07/hr while running).

# Codex + DHI one-shot demo

Reproduces the Docker Agentic Platform "Welcome" card as a single script:

> Launch **codex** with your OpenAI API key. It runs in a sandbox with
> **Balanced** and **dhi-only-registries** access (**dhi.io**), on **micro**
> compute, and **stops after 1 hour**. Added **GitHub token** for repo access.

```bash
export OPENAI_API_KEY=sk-...      # only needed if you have no 'openai' secret yet
export GITHUB_TOKEN=ghp_...       # only needed if you have no 'github' secret yet
./launch.sh                       # build it, print how to attach
./launch.sh -A                    # build it, then attach
./launch.sh -t 2h                 # longer TTL
./launch.sh -M <catalog-name>     # also attach a hosted-catalog MCP server
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
| DHI MCP server | see "The DHI MCP server" below (not `--static-mcp`) |

## The one-liner it runs

Secrets apply at **create time**, so they are set first; then one create call,
then the policy:

```bash
printf '%s' "$OPENAI_API_KEY" | sbx --cloud secret set openai
printf '%s' "$GITHUB_TOKEN"   | sbx --cloud secret set github

sbx --cloud run -d --name codex-dhi-demo \
  --cpus 1 --memory 2g \
  --ttl 1h --on-timeout stop \
  --allow-network dhi.io \
  codex

sbx --cloud policy init balanced --sandbox codex-dhi-demo
```

## The DHI MCP server

There are **two different "dhi.io" things** on the platform, and only one is a
`--static-mcp`:

1. **dhi.io registry/egress access** (what the card shows): the sandbox may pull
   from `dhi.io`. The script does this with `--allow-network dhi.io` under the
   Balanced policy. This is the part the "Welcome" card actually configures.
2. **The dhi.io MCP server** on the Agentic Platform **MCP** page: that is an
   *account-gateway* server (listed under "Your servers", reached through your
   MCP gateway endpoint URL `https://gateway.docker.com/mcp/gateways/.../mcp`).
   It is **not** a `--static-mcp` name. `--static-mcp` resolves against a
   separate Docker-**hosted catalog**; `--static-mcp dhi.io` and `--static-mcp
   dhi` both return *"not in the catalog"*.

So MCP is **off by default** here (`-M` empty). To attach an MCP server:

- For a **hosted-catalog** server, pass its catalog name: `./launch.sh -M <name>`.
- For your **account-gateway** DHI server, point your agent at the gateway
  endpoint URL from the MCP page ("Add to your client"), rather than
  `--static-mcp`.

## Notes

- `Balanced` = deny-all plus the balanced allow list; the `--sandbox` form keeps
  the `dhi.io` allow this script adds. Inspect with `sbx --cloud policy ls codex-dhi-demo`.
- For a strict **dhi-only-registries** posture, also deny the default registries,
  e.g. `--deny-network registry-1.docker.io --deny-network docker.io`.
- Secrets added to a **running** sandbox do not backfill; set them first, then
  `./teardown.sh && ./launch.sh`.
- `micro` is billed per second (about $0.07/hr while running).

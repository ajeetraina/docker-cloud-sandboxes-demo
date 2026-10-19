# DHI mixin kit

A Docker Sandboxes v3 **mixin** that wires any agent (codex, claude) to Docker
Hardened Images. It is the declarative version of what
[`../launch.sh`](../launch.sh) does by hand.

It does four things:

1. Registers the DHI MCP server (`https://dhi.io/mcp`) with the agent, and drops
   a portable `~/.dhi/mcp.json` for agents that read an `mcpServers` block.
2. Allows egress to `dhi.io`.
3. Denies the competitor registries (`cgr.dev`, `chainguard.dev`, `wolfi.dev`,
   `apk.dag.dev` and their subdomains). Deny beats allow, so the block holds no
   matter what network policy the base workload ships.
4. Steers the agent to prefer DHI and never Chainguard/Wolfi
   ([`dhi-context.md`](./dhi-context.md)).

The kit holds no secret. To enable the DHI mirror tools, bind your Docker Hub
credentials on the host and the proxy injects them as `X-Docker-*` headers on
`dhi.io` only:

```sh
echo "$DOCKER_USERNAME" | sbx secret set dhi-mcp-user
echo "$DOCKER_PAT"      | sbx secret set dhi-mcp-pat
```

Without them the read-only DHI tools still work.

## Use it

```sh
# Compose onto an agent workload (local or cloud):
sbx run codex --kit ./dhi-mixin .
sbx --cloud run -d --name codex-dhi-demo --kit ./dhi-mixin codex

# Point at a different endpoint without a rebuild:
sbx run codex --kit ./dhi-mixin --kit-arg mcpUrl=https://dhi.io/mcp .

# See the resolved declarations without starting a sandbox:
sbx kit inspect ./dhi-mixin
```

In the agent, open a NEW session (so it loads the MCP server) and the `dhi`
tools appear. Ask for a hardened nginx and it resolves to `dhi.io/nginx`; a
Chainguard pull fails at the network edge.

## Build and verify

```sh
docker buildx build . -f dhi-mixin.yaml -t dhi-mixin:1.0.0 \
  --output type=oci,dest=/tmp/dhi-mixin-layout,tar=false
kit-tck validate --layout /tmp/dhi-mixin-layout 1.0.0
```

## Publish

```sh
docker buildx build . -f dhi-mixin.yaml --platform linux/amd64,linux/arm64 --push \
  -t <registry>/dhi-mixin:1.0.0 -t <registry>/dhi-mixin:latest
```

Then reference it as a git ref:
`--kit git+https://github.com/ajeetraina/docker-cloud-sandboxes-demo.git#dir=agent-cli/codex-dhi/dhi-mixin`

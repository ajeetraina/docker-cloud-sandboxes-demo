# DHI mixin kit

A Docker Sandboxes v3 **mixin** that wires any agent (codex, claude) to Docker
Hardened Images. It is the declarative version of what
[`../launch.sh`](../launch.sh) does by hand.

It does four things:

1. Registers the DHI MCP server (`https://dhi.io/mcp`) with the agent, and drops
   a portable `~/.dhi/mcp.json` for agents that read an `mcpServers` block.
2. Allows egress to `dhi.io`.
3. Denies the 3rd party registries (`cgr.dev`, `chainguard.dev`, `wolfi.dev`,
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
# Local: compose onto a workload kit (this is what `sbx run --kit` assembles):
sbx run docker/sbx-kit-shell --kit ./dhi-mixin /tmp/ws

# See the resolved declarations without starting a sandbox:
sbx kit inspect ./dhi-mixin
```

### In the cloud

Cloud composes a mixin onto a built-in agent only from a **published OCI ref** —
a local path or git ref is uploaded as its own template and the cloud resolver
refuses to assemble it with the agent. So publish first, then either call sbx
directly or pass the ref to `launch.sh -k`:

```sh
# Publish (needs a Read/Write Docker Hub PAT):
docker buildx build . -f dhi-mixin.yaml --platform linux/amd64,linux/arm64 --push \
  -t docker.io/<user>/dhi-mixin:1.0.0 -t docker.io/<user>/dhi-mixin:latest

# Then, directly:
sbx --cloud run -d --name codex-dhi-demo --kit docker.io/<user>/dhi-mixin:1.0.0 codex

# ...or through the demo launcher (kit mode skips the imperative wiring):
../launch.sh -k docker.io/<user>/dhi-mixin:1.0.0
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

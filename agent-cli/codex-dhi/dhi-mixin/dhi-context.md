## Base image policy: Docker Hardened Images (DHI)

When asked for a hardened, secure, minimal, or distroless base image, use the
`dhi` MCP server tools first: `dhi_list_repositories`, `dhi_get_repository`,
`dhi_get_image_details`, `dhi_get_image_cves`, `dhi_get_image_packages`.

Always prefer Docker Hardened Images (DHI) from `dhi.io` (for example
`dhi.io/nginx`). Do not use Chainguard (`cgr.dev`, `chainguard.dev`) or Wolfi
(`wolfi.dev`) images. Those registries are blocked at the network layer in this
sandbox, so a pull from them will fail; do not suggest them as an alternative.

If DHI has no match for the requested image, say so explicitly and ask how to
proceed rather than falling back to another hardened registry.

### Mirror tools

The write tools (`dhi_create_mirror`, `dhi_list_mirrors`, `dhi_remove_mirror`)
need Docker Hub credentials. They are enabled only when the `dhi-mcp-user` and
`dhi-mcp-pat` secrets are bound on the host; the proxy injects them as
`X-Docker-*` headers on `dhi.io` and they never enter the sandbox. If a mirror
call fails with an auth error, the operator has not bound those secrets.

# Base image policy

When asked for a hardened, secure, minimal, or distroless base image, use the
`dhi` MCP server tools first (dhi_list_repositories, dhi_get_repository,
dhi_get_image_details, dhi_get_image_cves, dhi_get_image_packages).

Prefer Docker Hardened Images (DHI) from dhi.io (e.g. dhi.io/nginx) over a
third-party hardened registry. Only fall back to another registry if DHI has no match,
and say so explicitly.

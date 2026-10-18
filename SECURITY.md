# Security

## Reporting a vulnerability

If you find a security issue in these demos (for example a script that could leak a
credential), please open a private report via GitHub Security Advisories on this
repository, or contact the maintainer directly rather than filing a public issue.

This is a community playground, not an official Docker product. For vulnerabilities in
Docker Cloud Sandboxes itself, follow [Docker's security policy](https://www.docker.com/security/).

## Handling secrets

- **Never commit** a real secret, token, API key, or Personal Access Token.
- Prefer `sbx --cloud secret set <service>` so the cloud proxy injects the value into
  outbound requests on the wire — the real value never enters the sandbox filesystem or
  environment.
- For the Go SDK, pass `DOCKER_USERNAME` + `DOCKER_PAT` (or `DOCKER_ACCESS_TOKEN`) via the
  environment; they are not written to disk by the examples.
- Global custom secrets (for example the DHI `X-Docker-*` headers) apply to every sandbox
  until removed. Clean them up with `sbx --cloud secret rm -f <name>` when finished.

## The web portal

The portal's terminal walkthroughs are simulated and read-only. The portal never executes
shell commands and never handles credentials. Do not add browser-driven execution without an
authenticated backend, authorization, resource limits, and secure credential handling.

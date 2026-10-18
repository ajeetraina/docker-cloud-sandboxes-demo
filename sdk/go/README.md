# Docker Cloud Sandboxes — Go SDK demos

The rest of this repo drives sandboxes with the `sbx` CLI. These demos drive the
same cloud sandboxes **programmatically** with the official Go SDK
([`docker/sandboxes-api`](https://github.com/docker/sandboxes-api)) — create,
run a process, collect output, delete, all in code.

## Why Go (and REST) here

The SDK suite has TypeScript, Python, and Go. As of this writing the
**npm (`@docker/sandboxes-api`) and PyPI (`docker-sandboxes-api`) packages are
not published yet** (both 404), so the works-today paths are:

- **Go** — `go get` straight from GitHub (used here).
- **REST** — plain HTTP against `https://connect.docker.com/sandboxes` (any language).

## Requirements

- Go 1.25+ (`go version`).
- A Docker account with Cloud Sandboxes access.
- Auth, one of:
  - `DOCKER_USERNAME` + `DOCKER_PAT` — unattended PAT auth (the SDK exchanges the
    PAT for a short-lived token; the PAT is never sent to the sandbox APIs).
  - `DOCKER_ACCESS_TOKEN` — a ready access-token JWT.

```bash
export DOCKER_USERNAME=your-dockerhub-user
export DOCKER_PAT=dckr_pat_...
```

## Run

```bash
cd sdk/go
go run ./hello       # one sandbox: create -> run python -> auto-delete
go run ./parallel    # N sandboxes at once: fan out, collect a table, show speedup
```

Example `parallel` output:

```
Spinning up 5 sandboxes in parallel...

KIT      TIME      OUTPUT
----------------------------------------------------
python   7.2s      Python 3.12.7
node     6.9s      Node v22.9.0
go       8.1s      go version go1.25.1 linux/arm64
ruby     7.4s      Ruby 3.3.5
alpine   5.8s      Alpine 3.20.3

5/5 ok | wall 8.3s vs sequential 35.4s | 4.3x faster in parallel
```

## The SDK in three lines

```go
client, _ := sandboxes.New(sandboxes.Config{Auth: &sandboxes.PATAuth{Username: u, PersonalAccessToken: p}})
defer client.Close()
client.WithSandbox(ctx, sandboxes.CreateInput{ImageRef: &img, Resources: &sandboxes.Resources{Cpus: &c, MemoryMib: &m}},
    func(ctx context.Context, sb *sandboxes.SandboxHandle) error { /* sb.Processes.Run(...) */ return nil })
```

`WithSandbox` creates the sandbox, waits until it is running, runs your callback,
then deletes it — even if the callback fails.

## Notes

- **Module path / version.** This imports
  `github.com/docker/sandboxes-api/gen/go/sandboxes`. The latest *tag* (v0.36.0)
  predates that path, so `go get` resolves it from `@main`
  (a pseudo-version is pinned in `go.mod`). Re-pin with
  `go get github.com/docker/sandboxes-api/gen/go/sandboxes@main`.
- **Cost.** Each demo sandbox is `micro` (1 vCPU / 2 GiB), billed per second and
  deleted as soon as its command finishes. `parallel` runs 5 at once briefly.
- **Files, ports, kits.** The SDK also does file transfer (`sb.Files`), published
  ports, and bundled-kit launches (`client.Kits.Launch("claude", ...)`). See the
  [Go SDK README](https://github.com/docker/sandboxes-api/blob/main/gen/go/sandboxes/README.md).

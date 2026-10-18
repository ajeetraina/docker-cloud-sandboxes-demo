# Docker Cloud Sandboxes ~ Go SDK demos

The rest of this repo drives sandboxes with the `sbx` CLI. These demos drive the
same cloud sandboxes **programmatically** with the official Go SDK
([`docker/sandboxes-api`](https://github.com/docker/sandboxes-api)) — create,
run a process, collect output, delete, all in code.

![parallel: 5 cloud sandboxes at once](assets/parallel.gif)

*`go run ./parallel` — five languages, five cloud microVMs, in parallel (recording of a real run).*

## Why Go (and REST) here

The SDK suite has TypeScript, Python, and Go. These demos use the **Go** SDK
(`go get` straight from GitHub). The same sandboxes are also reachable over the
language-agnostic **REST** API at `https://connect.docker.com/sandboxes`.

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

> Verified live: `go run ./hello` with PAT auth created a sandbox, printed
> `Hello from a Docker Cloud Sandbox via the Go SDK`, and auto-deleted it.

Real `parallel` run (5 live cloud sandboxes):

```
Spinning up 5 sandboxes in parallel...

KIT      TIME      OUTPUT
----------------------------------------------------
python   7.33s     Python 3.12.15
node     9.683s    Node v22.23.3
go       19.989s   go version go1.25.14 linux/amd64
ruby     17.818s   Ruby 3.3.12
alpine   5.951s    Alpine 3.20.10

5/5 ok | wall 19.989s vs sequential 1m0.771s | 3.0x faster in parallel
```

(Wall time tracks the slowest single sandbox, so the speedup grows with more
jobs. Larger base images like `golang` spend most of that time pulling.)

## Record your own GIF

The GIF above is made with [VHS](https://github.com/charmbracelet/vhs). Record a
fresh one from a **live** run (needs your Docker auth):

```bash
cd sdk/go
export DOCKER_USERNAME=... DOCKER_PAT=...
vhs parallel.tape            # runs `go run ./parallel`, writes parallel.gif
```

`parallel.tape` captures the real run; `assets/demo.tape` replays the saved
output (no auth) and produced the committed `assets/parallel.gif`.

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

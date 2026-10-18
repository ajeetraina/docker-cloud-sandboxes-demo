# Docker Scout demo (v3 kit)

Launch a cloud sandbox with the **v3** `docker-scout` mixin from
[`ajeetraina/sbx-kits-scout`](https://github.com/ajeetraina/sbx-kits-scout),
layered on the `docker-agent` base (which carries a docker CLI). It adds the
`docker scout` plugin and scans a container **image** for CVEs.

```bash
./launch.sh                                   # create docker-agent + docker-scout
./launch.sh -i nginx:latest -S                # scan an image now
./launch.sh -n my-scout -t 2h
./teardown.sh
```

Defaults: name `docker-scout-demo`, TTL `4h`, size `small` (2 vCPU / 4 GiB),
image `alpine:latest`,
kit `git+https://github.com/ajeetraina/sbx-kits-scout.git`.
`./launch.sh -h` lists every option.

> Unlike the other demos, Scout scans an **image** (`-i`), not a cloned repo.
> It needs a docker-capable base, so this demo uses the `docker-agent` agent.

## Authentication

Scout's API and Docker Hub give fuller results (and avoid pull rate limits) once
you are logged in:

```bash
sbx --cloud attach docker-scout-demo
docker login
docker scout quickview alpine:latest
docker scout cves alpine:latest
```

## Drive it

```bash
./launch.sh -i python:3.12-slim -S                       # scan during launch
# or:
sbx --cloud exec docker-scout-demo docker scout cves <image>
```

`-S` exits non-zero when CVEs are found — expected. `./teardown.sh` deletes the
sandbox when you are done.

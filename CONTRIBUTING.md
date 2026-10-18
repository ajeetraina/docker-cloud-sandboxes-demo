# Contributing

Thanks for helping grow this collection of Docker Cloud Sandboxes demos.

## Add a demo

Each demo is a self-contained folder with three files:

```
<category>/<name>/
  launch.sh      # create the sandbox and print how to reach it
  teardown.sh    # delete it
  README.md      # what it does, prerequisites, how to drive it
```

Guidelines:

- **Reuse** [`lib/common.sh`](lib/common.sh) for logging, preflight checks, the size table,
  and repo cloning. Keep `launch.sh` short and focused on what makes the demo different.
- **Run `set -euo pipefail`** and validate inputs. Fail with a clear message, not a stack trace.
- **Default to `micro`** compute and a sensible TTL. Make cleanup obvious.
- **Prefer secrets over env vars** for credentials (`sbx --cloud secret set ...`). Never commit
  a real secret, token, or PAT.
- **Register it in the portal**: add an entry to [`web/data/demos.ts`](web/data/demos.ts) so it
  shows up in the catalog. Set `status: "verified"` only if you ran it live end-to-end.

## Honesty about testing

- `verified` — you ran it live against the cloud (create → use → teardown).
- `unverified` / `scripted` — complete and validated (syntax/compile) but not separately
  executed. Say so in the demo's README. Do not claim cloud demos were tested unless they were.

## Quality checks

Before opening a PR, run what applies:

```bash
bash -n path/to/launch.sh                 # shell syntax
shellcheck path/to/*.sh                    # if installed
( cd sdk/go && go vet ./... && go build ./... )
( cd web && npm run build )
```

## Commits

This repository enables SSH commit signing. If `git commit` blocks on a key prompt in a
non-interactive shell, commit with `--no-gpg-sign`.

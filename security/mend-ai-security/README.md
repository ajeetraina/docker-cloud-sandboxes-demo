# Mend AI Security demo (v3 kit)

Launch a cloud sandbox with the **v3** `mend-ai-security` mixin from
[`ajeetraina/sbx-kits-mend`](https://github.com/ajeetraina/sbx-kits-mend/tree/main/v3/mend-ai-security),
layered on the `claude` agent. It adds the Mend CLI, which discovers AI models,
frameworks and system prompts in a repo and generates an **AI-BOM** via
`mend ai scan`. The kit composes onto any v3 workload.

```bash
./launch.sh                                   # create claude + mend-ai-security
./launch.sh -r https://github.com/owner/repo.git            # also clone a repo
./launch.sh -r https://github.com/owner/repo.git -S         # clone and 'mend ai scan'
./launch.sh -n my-mend -t 2h
./teardown.sh
```

Defaults: name `mend-ai-demo`, TTL `4h`, size `small` (2 vCPU / 4 GiB),
kit `git+https://github.com/ajeetraina/sbx-kits-mend.git#dir=v3/mend-ai-security`.
`./launch.sh -h` lists every option.

## Authentication

The Mend CLI performs its own login handshake (email + user key → token in
`~/.mend/config/settings.json`); it is deliberately **not** proxy-injected, so
log in inside the sandbox before scanning:

```bash
sbx --cloud attach mend-ai-demo
mend auth login        # or set MEND_EMAIL / MEND_USER_KEY, then 'mend auth'
```

## Drive it

```bash
./launch.sh -r https://github.com/owner/repo.git -S      # scan during launch
# or:
sbx --cloud exec mend-ai-demo sh -c 'cd ~/<dir> && mend ai scan'
```

`-S` exits non-zero when findings exist — expected for a demo repo.
`./teardown.sh` deletes the sandbox when you are done.

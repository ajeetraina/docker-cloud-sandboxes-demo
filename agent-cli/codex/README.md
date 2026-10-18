# Codex (terminal agent) demo

Launch a cloud sandbox running **Codex**, OpenAI's terminal coding agent, as a
built-in cloud agent. No web UI — you attach to a terminal session.

```bash
./launch.sh                                   # create the sandbox, print how to attach
./launch.sh -A                                # create, then attach immediately
./launch.sh -n my-codex -t 2h -s medium
./launch.sh -r https://github.com/owner/repo.git     # clone a repo into the sandbox
./launch.sh -k git+https://github.com/docker/sbx-kits-contrib.git#dir=claude-mem   # layer a mixin
./teardown.sh
```

Defaults: name `codex-demo`, TTL `4h`, size `small` (2 vCPU / 4 GiB).
`./launch.sh -h` lists every option.

## Credentials

Codex needs an OpenAI credential. Store it **before** launching so the proxy
injects it and there is nothing to sign into inside the sandbox:

```bash
echo "$OPENAI_API_KEY" | sbx --cloud secret set openai
```

## Drive it

```bash
sbx --cloud attach codex-demo     # terminal into the agent
sbx --cloud ttl codex-demo        # show / extend the TTL
./teardown.sh                     # delete when done
```

`-k` can layer any mixin kit on top (repeatable), e.g. a memory or security
mixin. Swap the agent by copying this folder and changing `AGENT=` — any of
`claude`, `cursor`, `devin`, `docker-agent`, `gemini`, `opencode`, `shell`.

# OpenCode (terminal agent) demo

Launch a cloud sandbox running **OpenCode**, the open-source terminal coding
agent, as a built-in cloud agent. No web UI - you attach to a terminal session.
It works with many providers (Anthropic, OpenAI, and more).

```bash
./launch.sh                                   # create the sandbox, print how to attach
./launch.sh -A                                # create, then attach immediately
./launch.sh -n my-oc -t 2h -s medium
./launch.sh -r https://github.com/owner/repo.git     # clone a repo into the sandbox
./launch.sh -k git+https://github.com/docker/sbx-kits-contrib.git#dir=gitguardian   # layer a kit
./teardown.sh
```

Defaults: name `opencode-demo`, TTL `4h`, size `small` (2 vCPU / 4 GiB).
`./launch.sh -h` lists every option.

## Credentials

OpenCode resolves provider credentials through the sandbox proxy. Store the one
you want **before** launching:

```bash
echo "$ANTHROPIC_API_KEY" | sbx --cloud secret set anthropic
echo "$OPENAI_API_KEY"    | sbx --cloud secret set openai
```

## Drive it

```bash
sbx --cloud attach opencode-demo     # terminal into the agent
sbx --cloud ttl opencode-demo        # show / extend the TTL
./teardown.sh                        # delete when done
```

`-k` can layer any kit on top (repeatable). Swap the agent by copying this
folder and changing `AGENT=` - any built-in cloud agent works.

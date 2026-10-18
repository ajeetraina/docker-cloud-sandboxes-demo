# Gemini (terminal agent) demo

Launch a cloud sandbox running the **Gemini CLI** coding agent, as a built-in
cloud agent (a v3 workload). No web UI — you attach to a terminal session.

```bash
./launch.sh                                   # create the sandbox, print how to attach
./launch.sh -A                                # create, then attach immediately
./launch.sh -n my-gemini -t 2h -s medium
./launch.sh -r https://github.com/owner/repo.git     # clone a repo into the sandbox
./launch.sh -k <mixin-ref>                           # layer a v3 mixin on top
./teardown.sh
```

Defaults: name `gemini-demo`, TTL `4h`, size `small` (2 vCPU / 4 GiB).
`./launch.sh -h` lists every option.

## Credentials

Store a Google credential **before** launching so the proxy injects it:

```bash
echo "$GEMINI_API_KEY" | sbx --cloud secret set google
```

## Drive it

```bash
sbx --cloud attach gemini-demo     # terminal into the agent
sbx --cloud ttl gemini-demo        # show / extend the TTL
./teardown.sh                      # delete when done
```

// run launches a cloud sandbox from any image, runs a command in it, prints the
// output, and deletes it. This is the engine behind the per-language sandboxes.
//
//	export DOCKER_USERNAME=... DOCKER_PAT=...
//	go run ./run python:3.12 python --version
//	go run ./run node:22 node -e "console.log('hi')"
//	go run ./run rust:1 rustc --version
//
// With no command, it prints the sandbox's kernel/arch as a readiness check.
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/ajeetraina/docker-cloud-sandboxes-demo/sdk/go/common"
	sandboxes "github.com/docker/sandboxes-api/gen/go/sandboxes"
)

func main() {
	args := os.Args[1:]
	if len(args) < 1 {
		log.Fatal("usage: go run ./run IMAGE [command...]")
	}
	image := args[0]
	cmd := args[1:]
	if len(cmd) == 0 {
		cmd = []string{"sh", "-c", "echo ready: $(uname -s -m)"}
	}

	client, err := common.NewClient()
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	cpus, mem := 1, "2048" // micro
	err = client.WithSandbox(ctx, sandboxes.CreateInput{
		ImageRef:    &image,
		DisplayName: common.StrPtr("sdk-run"),
		Resources:   &sandboxes.Resources{Cpus: &cpus, MemoryMib: &mem},
	}, func(ctx context.Context, sb *sandboxes.SandboxHandle) error {
		fmt.Printf("sandbox: %s  (%s)\n", sb.Name(), image)
		res, err := sb.Processes.Run(ctx, sandboxes.SandboxProcessesRunInput{Args: cmd})
		if err != nil {
			return err
		}
		fmt.Print(res.Stdout)
		if res.ExitCode != 0 {
			return fmt.Errorf("exit %d: %s", res.ExitCode, res.Stderr)
		}
		return nil
	})
	if err != nil {
		log.Fatal(err)
	}
}

// hello creates one cloud sandbox, runs a command in it, and deletes it.
//
//	export DOCKER_USERNAME=... DOCKER_PAT=...   # or DOCKER_ACCESS_TOKEN
//	go run ./hello
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ajeetraina/docker-cloud-sandboxes-demo/sdk/go/common"
	sandboxes "github.com/docker/sandboxes-api/gen/go/sandboxes"
)

func main() {
	client, err := common.NewClient()
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	cpus, mem := 1, "2048" // micro
	// WithSandbox creates, waits until running, runs the callback, then deletes.
	err = client.WithSandbox(ctx, sandboxes.CreateInput{
		ImageRef:    common.StrPtr("python:3.12"),
		DisplayName: common.StrPtr("sdk-hello"),
		Resources:   &sandboxes.Resources{Cpus: &cpus, MemoryMib: &mem},
	}, func(ctx context.Context, sb *sandboxes.SandboxHandle) error {
		fmt.Println("sandbox:", sb.Name())
		res, err := sb.Processes.Run(ctx, sandboxes.SandboxProcessesRunInput{
			Args: []string{"python", "-c", "print('Hello from a Docker Cloud Sandbox via the Go SDK')"},
		})
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

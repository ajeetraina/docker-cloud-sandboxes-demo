// parallel spins up several cloud sandboxes at once (one per base image), runs a
// command in each concurrently, and prints a table with a parallel-vs-sequential
// speedup. This is the kind of fan-out that is awkward with the CLI but natural
// with the SDK.
//
//	export DOCKER_USERNAME=... DOCKER_PAT=...   # or DOCKER_ACCESS_TOKEN
//	go run ./parallel
package main

import (
	"context"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/ajeetraina/docker-cloud-sandboxes-demo/sdk/go/common"
	sandboxes "github.com/docker/sandboxes-api/gen/go/sandboxes"
)

type job struct {
	label string
	image string
	args  []string
}

type result struct {
	label string
	out   string
	dur   time.Duration
	err   error
}

func main() {
	jobs := []job{
		{"python", "python:3.12", []string{"python", "-c", "import platform;print('Python '+platform.python_version())"}},
		{"node", "node:22", []string{"node", "-e", "console.log('Node '+process.version)"}},
		{"go", "golang:1.25", []string{"sh", "-c", "go version"}},
		{"ruby", "ruby:3.3", []string{"ruby", "-e", "puts 'Ruby '+RUBY_VERSION"}},
		{"alpine", "alpine:3.20", []string{"sh", "-c", "echo Alpine $(cat /etc/alpine-release)"}},
	}

	client, err := common.NewClient()
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	fmt.Printf("Spinning up %d sandboxes in parallel...\n", len(jobs))
	start := time.Now()
	results := make([]result, len(jobs))
	var wg sync.WaitGroup
	for i, j := range jobs {
		wg.Add(1)
		go func(i int, j job) {
			defer wg.Done()
			results[i] = runOne(client, j)
		}(i, j)
	}
	wg.Wait()
	wall := time.Since(start)

	fmt.Printf("\n%-8s %-9s %s\n", "KIT", "TIME", "OUTPUT")
	fmt.Println(strings.Repeat("-", 52))
	var sum time.Duration
	ok := 0
	for _, r := range results {
		sum += r.dur
		out := strings.TrimSpace(r.out)
		if r.err != nil {
			out = "ERROR: " + r.err.Error()
		} else {
			ok++
		}
		fmt.Printf("%-8s %-9s %s\n", r.label, r.dur.Round(time.Millisecond), firstLine(out))
	}
	fmt.Printf("\n%d/%d ok | wall %s vs sequential %s | %.1fx faster in parallel\n",
		ok, len(jobs), wall.Round(time.Millisecond), sum.Round(time.Millisecond),
		float64(sum)/float64(wall))
}

func runOne(client *sandboxes.SandboxesClient, j job) result {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()
	start := time.Now()
	cpus, mem := 1, "2048" // micro
	var out string
	err := client.WithSandbox(ctx, sandboxes.CreateInput{
		ImageRef:    &j.image,
		DisplayName: common.StrPtr("sdk-parallel-" + j.label),
		Resources:   &sandboxes.Resources{Cpus: &cpus, MemoryMib: &mem},
	}, func(ctx context.Context, sb *sandboxes.SandboxHandle) error {
		res, err := sb.Processes.Run(ctx, sandboxes.SandboxProcessesRunInput{Args: j.args})
		if err != nil {
			return err
		}
		out = res.Stdout
		if res.ExitCode != 0 {
			return fmt.Errorf("exit %d: %s", res.ExitCode, strings.TrimSpace(res.Stderr))
		}
		return nil
	})
	return result{j.label, out, time.Since(start), err}
}

func firstLine(s string) string {
	if i := strings.IndexByte(s, '\n'); i >= 0 {
		return s[:i]
	}
	return s
}

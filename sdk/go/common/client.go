// Package common builds an authenticated Docker Sandboxes client from the
// environment, shared by the demos in this module.
package common

import (
	"fmt"
	"os"

	sandboxes "github.com/docker/sandboxes-api/gen/go/sandboxes"
)

// NewClient authenticates from the environment, preferring unattended PAT auth:
//
//	DOCKER_USERNAME + DOCKER_PAT  -> PAT auth (exchanged for a short-lived token)
//	DOCKER_ACCESS_TOKEN           -> a ready access-token JWT
//
// The PAT is never sent to the Sandbox APIs; the SDK exchanges it for a token.
func NewClient() (*sandboxes.SandboxesClient, error) {
	if u, p := os.Getenv("DOCKER_USERNAME"), os.Getenv("DOCKER_PAT"); u != "" && p != "" {
		return sandboxes.New(sandboxes.Config{
			Auth: &sandboxes.PATAuth{Username: u, PersonalAccessToken: p},
		})
	}
	if t := os.Getenv("DOCKER_ACCESS_TOKEN"); t != "" {
		return sandboxes.New(sandboxes.Config{AccessToken: t})
	}
	return nil, fmt.Errorf("auth required: export DOCKER_USERNAME + DOCKER_PAT, or DOCKER_ACCESS_TOKEN")
}

// StrPtr returns a pointer to s (the SDK uses optional pointer fields).
func StrPtr(s string) *string { return &s }

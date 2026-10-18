// Single source of truth for every demo in this repo.
// The portal (catalog, tutorials, featured) reads from here, so nothing drifts
// from the actual shell/SDK demos. "verified" means it was run live end-to-end
// during development; "unverified" means it is scripted and compiles/validates
// but was not separately executed against the cloud.

export const REPO = "https://github.com/ajeetraina/docker-cloud-sandboxes-demo";
const tree = (p: string) => `${REPO}/tree/main/${p}`;

export type Category =
  | "AI Coding Agents"
  | "Language Runtimes"
  | "Security & Governance"
  | "Programmatic Automation";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type Status = "verified" | "unverified";

export interface Step {
  cmd: string;
  explain?: string;
}

export interface Demo {
  slug: string;
  name: string;
  tagline: string;
  category: Category;
  tech: string[];
  difficulty: Difficulty;
  minutes: number;
  prerequisites: string[];
  path: string;
  github: string;
  status: Status;
  reach: string;
  quickstart: Step[];
  expected?: string;
  cleanup: string;
  whatYouBuild: string;
  whyItMatters: string;
  securityNote: string;
}

const proxyNote =
  "The agent runs inside an isolated microVM. Its provider credential is a proxy-managed placeholder in the sandbox; the real value is injected by the cloud proxy on outbound requests to the provider and never touches the container's filesystem or environment.";

export const demos: Demo[] = [
  {
    slug: "codex",
    name: "OpenAI Codex",
    tagline: "Run the Codex terminal agent in an isolated cloud sandbox.",
    category: "AI Coding Agents",
    tech: ["Codex", "sbx CLI"],
    difficulty: "Beginner",
    minutes: 5,
    prerequisites: [
      "sbx installed and signed in (`sbx login`)",
      "An `openai` secret stored: `echo $OPENAI_API_KEY | sbx --cloud secret set openai`",
    ],
    path: "agent-cli/codex",
    github: tree("agent-cli/codex"),
    status: "verified",
    reach: "sbx --cloud attach codex-demo",
    quickstart: [
      { cmd: "cd agent-cli/codex" },
      { cmd: "./launch.sh", explain: "Create a micro cloud sandbox running Codex and print how to attach." },
      { cmd: "sbx --cloud attach codex-demo", explain: "Drop into the agent's terminal session." },
      { cmd: "./teardown.sh", explain: "Delete the sandbox when you are done." },
    ],
    expected: "==> Ready.\n\nAttach to the agent session:\n\n  sbx --cloud attach codex-demo",
    cleanup: "./teardown.sh",
    whatYouBuild: "A cloud sandbox running OpenAI Codex that you attach to and drive from a terminal.",
    whyItMatters: "Coding agents execute arbitrary code. A disposable microVM keeps that off your laptop, under a TTL and a network policy.",
    securityNote: proxyNote,
  },
  {
    slug: "claude",
    name: "Claude Code",
    tagline: "Anthropic's coding agent, sandboxed in the cloud.",
    category: "AI Coding Agents",
    tech: ["Claude Code", "sbx CLI"],
    difficulty: "Beginner",
    minutes: 5,
    prerequisites: ["sbx installed and signed in", "An `anthropic` secret: `sbx --cloud secret set anthropic --oauth`"],
    path: "agent-cli/claude",
    github: tree("agent-cli/claude"),
    status: "unverified",
    reach: "sbx --cloud attach claude-demo",
    quickstart: [
      { cmd: "cd agent-cli/claude" },
      { cmd: "./launch.sh -A", explain: "Create the sandbox and attach when it is ready." },
      { cmd: "./teardown.sh" },
    ],
    cleanup: "./teardown.sh",
    whatYouBuild: "A cloud sandbox running Claude Code, attached to a live terminal session.",
    whyItMatters: "The same isolation and lifecycle benefits as any agent demo, for teams standardizing on Claude Code.",
    securityNote: proxyNote,
  },
  {
    slug: "gemini",
    name: "Gemini CLI",
    tagline: "Google's Gemini coding agent in a cloud sandbox.",
    category: "AI Coding Agents",
    tech: ["Gemini CLI", "sbx CLI"],
    difficulty: "Beginner",
    minutes: 5,
    prerequisites: ["sbx signed in", "A `google` secret: `echo $GEMINI_API_KEY | sbx --cloud secret set google`"],
    path: "agent-cli/gemini",
    github: tree("agent-cli/gemini"),
    status: "unverified",
    reach: "sbx --cloud attach gemini-demo",
    quickstart: [
      { cmd: "cd agent-cli/gemini" },
      { cmd: "./launch.sh -A" },
      { cmd: "./teardown.sh" },
    ],
    cleanup: "./teardown.sh",
    whatYouBuild: "A cloud sandbox running the Gemini CLI, attached to a live terminal.",
    whyItMatters: "Try Google's agent with the same disposable, policy-bounded workflow as the others.",
    securityNote: proxyNote,
  },
  {
    slug: "opencode",
    name: "OpenCode",
    tagline: "The open-source terminal coding agent, sandboxed.",
    category: "AI Coding Agents",
    tech: ["OpenCode", "sbx CLI"],
    difficulty: "Beginner",
    minutes: 5,
    prerequisites: ["sbx signed in", "A provider secret (e.g. `anthropic` or `openai`)"],
    path: "agent-cli/opencode",
    github: tree("agent-cli/opencode"),
    status: "unverified",
    reach: "sbx --cloud attach opencode-demo",
    quickstart: [
      { cmd: "cd agent-cli/opencode" },
      { cmd: "./launch.sh -A" },
      { cmd: "./teardown.sh" },
    ],
    cleanup: "./teardown.sh",
    whatYouBuild: "A cloud sandbox running OpenCode, the open-source terminal coding agent.",
    whyItMatters: "An open-source agent in the same isolated, multi-provider workflow.",
    securityNote: proxyNote,
  },
  {
    slug: "codex-dhi",
    name: "Codex + Docker Hardened Images",
    tagline: "Codex wired to the Docker DHI MCP server, steered to prefer hardened base images.",
    category: "Security & Governance",
    tech: ["Codex", "Docker DHI", "MCP", "Secrets proxy", "Network policy"],
    difficulty: "Intermediate",
    minutes: 10,
    prerequisites: ["sbx signed in", "`openai` + `github` secrets (the script sets them from env if missing)"],
    path: "agent-cli/codex-dhi",
    github: tree("agent-cli/codex-dhi"),
    status: "verified",
    reach: "sbx --cloud attach codex-dhi-demo, then /mcp in Codex",
    quickstart: [
      { cmd: "cd agent-cli/codex-dhi" },
      { cmd: "./launch.sh", explain: "Micro Codex sandbox with Balanced egress + dhi.io, the DHI MCP server wired in, and an AGENTS.md that steers Codex to DHI." },
      { cmd: "sbx --cloud attach codex-dhi-demo", explain: "Open a new Codex session, then /mcp to see the DHI tools." },
      { cmd: "./teardown.sh" },
    ],
    expected: "/mcp -> dhi_list_repositories, dhi_get_image_cves, dhi_get_image_packages, ...\nAsk for a hardened nginx -> dhi.io/nginx:1.30.6-debian13-fips",
    cleanup: "./teardown.sh",
    whatYouBuild: "A Codex sandbox wired to the Docker Hardened Images MCP server, with Balanced egress plus dhi.io, steered to recommend hardened base images.",
    whyItMatters: "Governance in practice: network egress control, proxy-injected secrets, and pushing an agent toward hardened, low-CVE images instead of whatever its training suggests.",
    securityNote: "Balanced egress is deny-all plus an allowlist. For DHI mirror tools, Docker Hub credentials are injected as X-Docker-* headers by the proxy, so the PAT never enters the sandbox. The OpenAI credential is proxy-managed the same way.",
  },
  {
    slug: "sdk-hello",
    name: "Go SDK: Hello World",
    tagline: "Create a sandbox, run code, delete it - all from a Go program.",
    category: "Programmatic Automation",
    tech: ["Go SDK", "@docker/sandboxes-api"],
    difficulty: "Beginner",
    minutes: 5,
    prerequisites: ["Go 1.25+", "DOCKER_USERNAME + DOCKER_PAT (or DOCKER_ACCESS_TOKEN)"],
    path: "sdk/go",
    github: tree("sdk/go"),
    status: "verified",
    reach: "stdout from the Go program",
    quickstart: [
      { cmd: "cd sdk/go" },
      { cmd: "export DOCKER_USERNAME=... DOCKER_PAT=...", explain: "PAT auth: the SDK exchanges it for a short-lived token; the PAT never reaches the sandbox." },
      { cmd: "go run ./hello", explain: "WithSandbox creates, waits, runs Python, and deletes - all in one call." },
    ],
    expected: "sandbox: sandboxes/sbx_001m57m9...\nHello from a Docker Cloud Sandbox via the Go SDK",
    cleanup: "WithSandbox deletes the sandbox automatically.",
    whatYouBuild: "A Go program that creates a sandbox, runs Python inside it, and deletes it.",
    whyItMatters: "Programmatic control means sandboxes can live in scripts, tests, and CI, not just an interactive terminal.",
    securityNote: "PAT auth is exchanged by the SDK for a short-lived access token; the PAT is never sent to the sandbox APIs or written to disk by the example.",
  },
  {
    slug: "sdk-parallel",
    name: "Go SDK: Parallel Fan-out",
    tagline: "Spin up five cloud sandboxes at once and collect their output.",
    category: "Programmatic Automation",
    tech: ["Go SDK", "Concurrency"],
    difficulty: "Intermediate",
    minutes: 7,
    prerequisites: ["Go 1.25+", "DOCKER_USERNAME + DOCKER_PAT"],
    path: "sdk/go",
    github: tree("sdk/go"),
    status: "verified",
    reach: "a table + parallel-vs-sequential speedup",
    quickstart: [
      { cmd: "cd sdk/go" },
      { cmd: "export DOCKER_USERNAME=... DOCKER_PAT=..." },
      { cmd: "go run ./parallel", explain: "Launch python, node, go, ruby and alpine sandboxes concurrently with goroutines." },
    ],
    expected: "5/5 ok | wall 19.989s vs sequential 1m0.771s | 3.0x faster in parallel",
    cleanup: "Each sandbox is deleted as its command finishes.",
    whatYouBuild: "A Go program that launches five sandboxes concurrently with goroutines and collects their output into a table.",
    whyItMatters: "Fan-out across environments or base images is trivial in code and awkward from the CLI - the SDK's superpower.",
    securityNote: "Same PAT exchange as the Hello demo. Each sandbox is isolated from the others and cleaned up as its command finishes.",
  },
];

const langSecurity =
  "The sandbox is an isolated microVM, so nothing it runs can touch your host. PAT auth is exchanged by the SDK for a short-lived token and is never sent to the sandbox.";

type Lang = { slug: string; name: string; image: string; run: string; out: string; verified: boolean };

const languages: Lang[] = [
  { slug: "python-sandbox", name: "Python Sandbox", image: "python:3.12", run: `python -c "print('Hello from a Python cloud sandbox')"`, out: "Hello from a Python cloud sandbox", verified: true },
  { slug: "nodejs-sandbox", name: "Node.js Sandbox", image: "node:22", run: `node -e "console.log('Hello from a Node.js cloud sandbox')"`, out: "Hello from a Node.js cloud sandbox", verified: true },
  { slug: "go-sandbox", name: "Go Sandbox", image: "golang:1.25", run: "go version", out: "go version go1.25.x linux/amd64", verified: true },
  { slug: "ruby-sandbox", name: "Ruby Sandbox", image: "ruby:3.3", run: `ruby -e "puts 'Hello from a Ruby cloud sandbox'"`, out: "Hello from a Ruby cloud sandbox", verified: true },
  { slug: "rust-sandbox", name: "Rust Sandbox", image: "rust:1", run: "rustc --version", out: "rustc 1.x.0", verified: false },
];

function languageSandboxes(): Demo[] {
  return languages.map((l) => ({
    slug: l.slug,
    name: l.name,
    tagline: `Spin up an isolated cloud sandbox with the ${l.name.replace(" Sandbox", "")} runtime and run code in seconds.`,
    category: "Language Runtimes" as Category,
    tech: [l.name.replace(" Sandbox", ""), "Go SDK", l.image],
    difficulty: "Beginner" as Difficulty,
    minutes: 3,
    prerequisites: ["Go 1.25+", "DOCKER_USERNAME + DOCKER_PAT (or DOCKER_ACCESS_TOKEN)"],
    path: "sdk/go/run",
    github: tree("sdk/go/run"),
    status: (l.verified ? "verified" : "unverified") as Status,
    reach: "program stdout",
    quickstart: [
      { cmd: "cd sdk/go" },
      { cmd: "export DOCKER_USERNAME=... DOCKER_PAT=..." },
      { cmd: `go run ./run ${l.image} ${l.run}`, explain: `Create a sandbox from ${l.image}, run the command, print output, and delete it.` },
    ],
    expected: `sandbox: sandboxes/sbx_...  (${l.image})\n${l.out}`,
    cleanup: "The sandbox is deleted automatically when the command finishes.",
    whatYouBuild: `A disposable cloud sandbox running the ${l.image} image, driven by the generic Go SDK runner.`,
    whyItMatters: "A clean, isolated runtime for throwaway experiments, reproducible snippets, or per-language CI jobs - no local toolchain required.",
    securityNote: langSecurity,
  }));
}

demos.push(...languageSandboxes());

export const categories: Category[] = [
  "AI Coding Agents",
  "Language Runtimes",
  "Security & Governance",
  "Programmatic Automation",
];

export const stats = {
  demos: demos.length,
  verified: demos.filter((d) => d.status === "verified").length,
  agents: 4,
  languages: 5,
};

export function getDemo(slug: string) {
  return demos.find((d) => d.slug === slug);
}

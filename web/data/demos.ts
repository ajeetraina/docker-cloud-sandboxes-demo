// Single source of truth for every demo in this repo.
// The portal (catalog, tutorials, featured) reads from here, so nothing drifts
// from the actual shell/SDK demos. "verified" means it was run live end-to-end
// during development; "unverified" means it is scripted and compiles/validates
// but was not separately executed against the cloud.

export const REPO = "https://github.com/ajeetraina/docker-cloud-sandboxes-demo";
const tree = (p: string) => `${REPO}/tree/main/${p}`;

export type Category = "AI Coding Agents" | "Security & Governance" | "Programmatic Automation";
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
}

export const demos: Demo[] = [
  {
    slug: "codex",
    name: "OpenAI Codex",
    tagline: "Run the Codex terminal agent in an isolated cloud sandbox.",
    category: "AI Coding Agents",
    tech: ["Codex", "sbx CLI"],
    difficulty: "Beginner",
    minutes: 5,
    prerequisites: ["sbx installed and signed in (`sbx login`)", "An `openai` secret stored: `echo $OPENAI_API_KEY | sbx --cloud secret set openai`"],
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
      { cmd: "./launch.sh", explain: "Micro Codex sandbox with Balanced egress + dhi.io, DHI MCP wired, and an AGENTS.md that steers Codex to DHI." },
      { cmd: "sbx --cloud attach codex-dhi-demo", explain: "Open a new Codex session, then /mcp to see the DHI tools." },
      { cmd: "./teardown.sh" },
    ],
    expected: "/mcp -> dhi_list_repositories, dhi_get_image_cves, dhi_get_image_packages, ...\nAsk for a hardened nginx -> dhi.io/nginx:1.30.6-debian13-fips",
    cleanup: "./teardown.sh",
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
  },
];

export const categories: Category[] = [
  "AI Coding Agents",
  "Security & Governance",
  "Programmatic Automation",
];

export const stats = {
  demos: demos.length,
  verified: demos.filter((d) => d.status === "verified").length,
  agents: 4,
  languages: 5,
};

# Mercury Extensions

Official extensions for [Mercury](https://github.com/Michaelliv/mercury) — a personal AI assistant for chat platforms.

## Packages

| Package | Description |
|---------|-------------|
| [`@mercuryai/knowledge`](packages/knowledge) | Obsidian-based knowledge vault with automatic KB distillation |
| [`@mercuryai/web-browser`](packages/web-browser) | Web browsing via Playwright/Chromium |
| [`@mercuryai/charts`](packages/charts) | Chart generation |
| [`@mercuryai/github`](packages/github) | GitHub CLI integration |
| [`@mercuryai/google-workspace`](packages/google-workspace) | Google Workspace (Gmail, Calendar, Drive, etc.) |
| [`@mercuryai/pdf-tools`](packages/pdf-tools) | PDF processing, OCR, and form filling |

## Installing extensions

```bash
cd your-mercury-project
mercury add @mercuryai/knowledge
mercury add @mercuryai/web-browser
```

After adding extensions, restart Mercury to rebuild the container image:

```bash
mercury service install
```

## What are extensions?

Extensions add capabilities to your Mercury agent — CLIs, skills, background jobs, lifecycle hooks, config keys, and dashboard widgets. Each extension is a TypeScript module that declares what it provides through the `MercuryExtensionAPI`.

For example, the `knowledge` extension:
- Installs `napkin` CLI in the agent container
- Creates a napkin vault at `knowledge/.napkin` per space
- Runs hourly KB distillation to extract knowledge from conversations
- Provides a dashboard widget showing distillation status

See the full [Extension System docs](https://github.com/Michaelliv/mercury/blob/main/docs/extensions.md) for details on the API, lifecycle events, permissions, and more.

## Development

```bash
bun install          # Install all dependencies
bun run build        # Build all packages
bun run check        # Typecheck + lint
bun run check:fix    # Typecheck + auto-fix lint
bun test             # Run all tests
```

## Creating a new extension

1. Create `packages/<name>/` with `src/index.ts`, `package.json`, and `tsconfig.json`
2. Default-export a setup function that takes `MercuryExtensionAPI`
3. Optionally include a `skill/SKILL.md` for agent instructions

```typescript
import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";

export default function (mercury: MercuryExtensionAPI) {
  // Install a CLI tool in the agent container
  mercury.cli({ name: "my-tool", install: "npm install -g my-tool" });

  // Set which roles can use this extension
  mercury.permission({ defaultRoles: ["admin", "member"] });

  // Register a skill so the agent knows how to use the CLI
  mercury.skill("./skill");

  // Inject env vars into the container (only for permitted callers)
  mercury.env({ from: "MERCURY_MY_TOOL_API_KEY" });

  // Run setup when a space workspace is created
  mercury.on("workspace_init", async ({ workspace }, ctx) => {
    mkdirSync(join(workspace, "my-data"), { recursive: true });
  });

  // Inject extra context before the agent runs
  mercury.on("before_container", async ({ containerWorkspace }, ctx) => {
    return {
      systemPrompt: "Additional instructions for the agent...",
      env: { MY_DATA_DIR: join(containerWorkspace, "my-data") },
    };
  });

  // Run a background job on the host
  mercury.job("sync", {
    interval: 3600_000,
    run: async (ctx) => { /* ... */ },
  });

  // Register per-space config
  mercury.config("enabled", {
    description: "Enable this extension for the space",
    default: "true",
  });

  // Add a dashboard widget
  mercury.widget({
    label: "My Tool",
    render: () => `<p>Status: OK</p>`,
  });

  // Persist extension state
  mercury.store.set("last-sync", new Date().toISOString());
}
```

### Extension API summary

| Method | Description |
|--------|-------------|
| `cli(opts)` | Install a CLI in the container image |
| `permission(opts)` | Register RBAC permission with default roles |
| `env(def)` | Declare env vars (injected only for permitted callers) |
| `skill(path)` | Register a skill directory with `SKILL.md` |
| `on(event, handler)` | Subscribe to lifecycle events (`startup`, `shutdown`, `workspace_init`, `before_container`, `after_container`) |
| `job(name, def)` | Background job (interval or cron) |
| `config(key, def)` | Per-space config key |
| `store` | Scoped key-value persistence |

Full API docs: [extensions.md](https://github.com/Michaelliv/mercury/blob/main/docs/extensions.md)

## Publishing

Packages are published to npm automatically via CI when pushed to `main`. To publish manually:

```bash
cd packages/<name>
bun run build
npm publish --access public
```

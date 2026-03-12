# Mercury Extensions

Official extensions for [Mercury](https://github.com/Michaelliv/mercury).

## Packages

| Package | Description |
|---------|-------------|
| [`@mercuryai/knowledge`](packages/knowledge) | Obsidian-based knowledge vault with KB distillation |
| [`@mercuryai/web-browser`](packages/web-browser) | Web browsing via Playwright/Chromium |
| [`@mercuryai/charts`](packages/charts) | Chart generation |
| [`@mercuryai/github`](packages/github) | GitHub CLI integration |
| [`@mercuryai/google-workspace`](packages/google-workspace) | Google Workspace CLI |
| [`@mercuryai/pdf-tools`](packages/pdf-tools) | PDF processing, OCR, and form filling |

## Installing in a Mercury project

```bash
cd your-mercury-project
mercury add @mercuryai/knowledge
```

## Development

```bash
bun install          # Install all dependencies
bun run build        # Build all packages
bun run check        # Typecheck + lint
bun run check:fix    # Typecheck + auto-fix lint
bun test             # Run all tests
```

## Adding a new extension

1. Create `packages/<name>/`
2. Add `package.json` with name `@mercuryai/<name>`
3. Add `src/index.ts` — default export a function that takes `MercuryExtensionAPI`
4. Add `tsconfig.json` extending the root
5. Optionally include a `skill/SKILL.md` for agent instructions

```typescript
import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";

export default function (mercury: MercuryExtensionAPI) {
  mercury.cli({ name: "my-tool", install: "npm install -g my-tool" });
  mercury.permission({ defaultRoles: ["admin", "member"] });
  mercury.skill("./skill");
}
```

## Publishing

Packages are published to npm automatically on release via CI. To publish manually:

```bash
cd packages/<name>
bun run build
npm publish --access public
```

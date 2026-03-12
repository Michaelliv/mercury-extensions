# Mercury Extensions

Official extensions for [Mercury](https://github.com/badlogic/mercury).

## Packages

| Package | Description |
|---------|-------------|
| [`@mercury/napkin-memory`](packages/napkin-memory) | Obsidian-based knowledge vault with KB distillation |

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
2. Add `package.json` with name `@mercury/<name>`
3. Add `src/index.ts` as the extension entry point
4. Add `tsconfig.json` extending the root
5. Include a `skill/SKILL.md` if the extension provides agent skills

## Publishing

```bash
cd packages/<name>
bun run build
npm publish --access public
```

## Installing in a Mercury project

```bash
cd your-mercury-project
mercury add @mercury/napkin-memory
```

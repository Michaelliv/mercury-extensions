---
name: gws
description: Use Google Workspace CLI (gws) for Gmail, Drive, Calendar, Docs, Sheets, and other Google Workspace APIs.
allowed-tools: Bash
---

# Google Workspace CLI (`gws`)

Use `gws` directly from bash.

## Authentication

Mercury passes `MERCURY_*` env vars into the container with the prefix stripped.

So set this in your Mercury `.env` on the host:

```bash
MERCURY_GOOGLE_WORKSPACE_CLI_TOKEN=<oauth-access-token>
```

Inside the container, `gws` receives it as:

```bash
GOOGLE_WORKSPACE_CLI_TOKEN
```

## Quick checks

```bash
gws --version
gws --help
```

## Example calls

```bash
# Drive
gws drive files list --params '{"pageSize": 5}'

# Calendar
gws calendar calendar-list list

# Gmail
gws gmail users labels list --params '{"userId":"me"}'
```

## Notes

- Prefer `--params` and `--json` inputs with valid JSON.
- Keep calls focused and return concise summaries.

---
name: gws
description: Use Google Workspace CLI (gws) for Gmail, Drive, Calendar, Docs, Sheets, and other Google Workspace APIs.
allowed-tools: Bash
---

# Google Workspace CLI (`gws`)

## Setup (Mercury operator — run on host before deploying)

### 1. Install gws locally

```bash
npm install -g @googleworkspace/cli
```

### 2. Configure GCP project + OAuth client

```bash
gws auth setup            # interactive — creates OAuth client via gcloud
gws auth setup --project my-project  # use a specific GCP project
```

Requires `gcloud` CLI installed and authenticated. This creates an OAuth consent screen and client credentials in your GCP project.

### 3. Authenticate

```bash
gws auth login                    # opens browser, requests default scopes
gws auth login --readonly         # read-only scopes
gws auth login -s drive,gmail     # only specific services
gws auth login --full             # all scopes (may need verified app)
```

### 4. Export token to .env

```bash
gws auth export    # prints credentials to stdout
```

Copy the token and add to your Mercury project `.env`:

```bash
MERCURY_GOOGLE_WORKSPACE_CLI_TOKEN=<paste token here>
```

Then restart Mercury: `mercury service install`

### 5. Check status

```bash
gws auth status    # verify auth state
```

The token auto-refreshes. If it expires, re-run `gws auth login` and `gws auth export` on the host.

---

## Agent usage

Mercury passes `MERCURY_*` env vars into the container with the prefix stripped. Inside the container, `gws` receives the token as `GOOGLE_WORKSPACE_CLI_TOKEN`.

### Quick checks

```bash
gws --version
gws --help
```

### Example calls

```bash
# Drive
gws drive files list --params '{"pageSize": 5}'

# Calendar
gws calendar calendar-list list
gws calendar events list --params '{"calendarId":"primary","maxResults":5}'

# Gmail
gws gmail users labels list --params '{"userId":"me"}'
gws gmail users messages list --params '{"userId":"me","maxResults":5}'

# Sheets
gws sheets spreadsheets get --params '{"spreadsheetId":"SHEET_ID"}'

# Docs
gws docs documents get --params '{"documentId":"DOC_ID"}'
```

### Notes

- Prefer `--params` and `--json` inputs with valid JSON.
- Keep calls focused and return concise summaries.
- If auth errors occur, tell the user to re-run `gws auth login` and update `.env` on the host.

---
name: napkin
description: Read, create, search, and manage notes in the Mercury knowledge vault using the napkin CLI. Works directly on markdown files and canvas files — no Obsidian app required. Use when the user asks to interact with their knowledge vault, manage notes, search vault content, work with tasks, tags, properties, daily notes, templates, bases, bookmarks, aliases, or canvas files from the command line.
---

# napkin

CLI for Obsidian vaults. Operates directly on markdown files — no Obsidian app, no Electron, no Catalyst license.

Install: `npm install -g napkin-ai`

**IMPORTANT**: Always pass `--vault $NAPKIN_VAULT` to every napkin command. In Mercury, the vault lives at `knowledge/.napkin`, not the workspace root.

## Vault Structure

`.napkin/` is the vault root — all content lives inside it:

```
workspace/
  knowledge/
    .napkin/                # The vault
      NAPKIN.md             # Context note (Level 0)
      config.json           # Unified config (syncs to .obsidian/)
      people/
      projects/
      references/
      daily/
      Templates/
      .obsidian/            # Obsidian compatibility (auto-generated)
```

## Progressive Disclosure

napkin reveals information gradually — overview first, then search, then read:

| Level | Command | What it does |
|-------|---------|-------------|
| L0 | `NAPKIN.md` | Project context note |
| L1 | `napkin overview` | L0 + vault map with TF-IDF keywords per folder |
| L2 | `napkin search <query>` | BM25 + backlinks + recency ranked results with snippets |
| L3 | `napkin read <file>` | Full file content |

**Workflow: overview → search → read**

## Config

```bash
napkin --vault "$NAPKIN_VAULT" config show
napkin --vault "$NAPKIN_VAULT" config get --key search.limit
napkin --vault "$NAPKIN_VAULT" config set --key search.limit --value 50
```

## Syntax

napkin uses standard CLI flags. Quote values with spaces:

```bash
napkin --vault "$NAPKIN_VAULT" create --name "My Note" --content "Hello world"
```

### Global flags

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON (use this for programmatic access) |
| `-q, --quiet` | Suppress output |
| `--vault <path>` | Vault path (default: auto-detect by walking up from cwd looking for `.napkin/`) |
| `--copy` | Copy output to clipboard |

### File targeting

- `--file <name>` — resolves like a wikilink (name only, no path or extension needed)
- `--path <path>` — exact path from vault root, e.g. `projects/note.md`

## Commands

### Vault

```bash
napkin --vault "$NAPKIN_VAULT" vault
napkin --vault "$NAPKIN_VAULT" version
```

### Overview & graph

```bash
napkin --vault "$NAPKIN_VAULT" overview
napkin --vault "$NAPKIN_VAULT" overview --depth 3
napkin --vault "$NAPKIN_VAULT" overview --keywords 5
napkin --vault "$NAPKIN_VAULT" graph
```

### Files & folders — `napkin file`

```bash
napkin --vault "$NAPKIN_VAULT" file info <name>
napkin --vault "$NAPKIN_VAULT" file list
napkin --vault "$NAPKIN_VAULT" file list --ext md
napkin --vault "$NAPKIN_VAULT" file list --folder projects
napkin --vault "$NAPKIN_VAULT" file list --total
napkin --vault "$NAPKIN_VAULT" file folder <path>
napkin --vault "$NAPKIN_VAULT" file folder <path> --info files
napkin --vault "$NAPKIN_VAULT" file folders
napkin --vault "$NAPKIN_VAULT" file folders --total
```

### Read & write

```bash
napkin --vault "$NAPKIN_VAULT" read <file>
napkin --vault "$NAPKIN_VAULT" create --name "Note" --content "# Hello"
napkin --vault "$NAPKIN_VAULT" create --name "Note" --path "projects" --template "Daily Note"
napkin --vault "$NAPKIN_VAULT" append --file "Note" --content "New line at end"
napkin --vault "$NAPKIN_VAULT" prepend --file "Note" --content "New line after frontmatter"
napkin --vault "$NAPKIN_VAULT" move --file "Note" --to Archive
napkin --vault "$NAPKIN_VAULT" rename --file "Note" --name "Renamed Note"
napkin --vault "$NAPKIN_VAULT" delete --file "Note"
napkin --vault "$NAPKIN_VAULT" delete --file "Note" --permanent
```

### Daily notes — `napkin daily`

Reads config from `.napkin/.obsidian/daily-notes.json`.

```bash
napkin --vault "$NAPKIN_VAULT" daily today
napkin --vault "$NAPKIN_VAULT" daily path
napkin --vault "$NAPKIN_VAULT" daily read
napkin --vault "$NAPKIN_VAULT" daily append --content "- [ ] Buy groceries"
napkin --vault "$NAPKIN_VAULT" daily prepend --content "## Morning"
```

### Search

```bash
napkin --vault "$NAPKIN_VAULT" search "meeting"
napkin --vault "$NAPKIN_VAULT" search --query "meeting"
napkin --vault "$NAPKIN_VAULT" search "TODO" --path projects
napkin --vault "$NAPKIN_VAULT" search "bug" --total
napkin --vault "$NAPKIN_VAULT" search "deploy" --limit 5
napkin --vault "$NAPKIN_VAULT" search "TODO" --no-snippets
napkin --vault "$NAPKIN_VAULT" search "deploy" --snippet-lines 3
napkin --vault "$NAPKIN_VAULT" search "auth" --score
```

### Tasks — `napkin task`

```bash
napkin --vault "$NAPKIN_VAULT" task list
napkin --vault "$NAPKIN_VAULT" task list --todo
napkin --vault "$NAPKIN_VAULT" task list --done
napkin --vault "$NAPKIN_VAULT" task list --daily
napkin --vault "$NAPKIN_VAULT" task list --file "Project A"
napkin --vault "$NAPKIN_VAULT" task list --verbose
napkin --vault "$NAPKIN_VAULT" task list --total
napkin --vault "$NAPKIN_VAULT" task show --file "note" --line 3
napkin --vault "$NAPKIN_VAULT" task show --file "note" --line 3 --toggle
napkin --vault "$NAPKIN_VAULT" task show --file "note" --line 3 --done
napkin --vault "$NAPKIN_VAULT" task show --ref "note.md:3" --todo
```

### Tags — `napkin tag`

```bash
napkin --vault "$NAPKIN_VAULT" tag list
napkin --vault "$NAPKIN_VAULT" tag list --counts
napkin --vault "$NAPKIN_VAULT" tag list --sort count
napkin --vault "$NAPKIN_VAULT" tag info --name "project"
napkin --vault "$NAPKIN_VAULT" tag info --name "project" --verbose
napkin --vault "$NAPKIN_VAULT" tag aliases
napkin --vault "$NAPKIN_VAULT" tag aliases --file "note"
napkin --vault "$NAPKIN_VAULT" tag aliases --total
```

### Properties — `napkin property`

```bash
napkin --vault "$NAPKIN_VAULT" property list
napkin --vault "$NAPKIN_VAULT" property list --file "note"
napkin --vault "$NAPKIN_VAULT" property list --counts
napkin --vault "$NAPKIN_VAULT" property read --file "note" --name title
napkin --vault "$NAPKIN_VAULT" property set --file "note" --name status --value done
napkin --vault "$NAPKIN_VAULT" property remove --file "note" --name status
```

### Links — `napkin link`

```bash
napkin --vault "$NAPKIN_VAULT" link back --file "note"
napkin --vault "$NAPKIN_VAULT" link out --file "note"
napkin --vault "$NAPKIN_VAULT" link unresolved
napkin --vault "$NAPKIN_VAULT" link orphans
napkin --vault "$NAPKIN_VAULT" link deadends
```

### Outline

```bash
napkin --vault "$NAPKIN_VAULT" outline --file "note"
napkin --vault "$NAPKIN_VAULT" outline --file "note" --format md
napkin --vault "$NAPKIN_VAULT" outline --file "note" --format json
```

### Templates — `napkin template`

```bash
napkin --vault "$NAPKIN_VAULT" template list
napkin --vault "$NAPKIN_VAULT" template read --name "Daily Note"
napkin --vault "$NAPKIN_VAULT" template read --name "Meeting" --resolve --title "Standup"
napkin --vault "$NAPKIN_VAULT" template insert --file "note" --name "Template"
```

### Bookmarks — `napkin bookmark`

```bash
napkin --vault "$NAPKIN_VAULT" bookmark list
napkin --vault "$NAPKIN_VAULT" bookmark list --total
napkin --vault "$NAPKIN_VAULT" bookmark add --file "note"
napkin --vault "$NAPKIN_VAULT" bookmark add --folder "projects"
napkin --vault "$NAPKIN_VAULT" bookmark add --search "TODO"
napkin --vault "$NAPKIN_VAULT" bookmark add --url "https://example.com" --title "Example"
```

### Bases — `napkin base`

```bash
napkin --vault "$NAPKIN_VAULT" base list
napkin --vault "$NAPKIN_VAULT" base views --file "projects"
napkin --vault "$NAPKIN_VAULT" base query --file "projects"
napkin --vault "$NAPKIN_VAULT" base query --file "projects" --view "Active"
napkin --vault "$NAPKIN_VAULT" base query --file "projects" --format paths
napkin --vault "$NAPKIN_VAULT" base query --file "projects" --format csv
napkin --vault "$NAPKIN_VAULT" base create --file "projects" --name "New Item"
```

### Canvas — `napkin canvas`

```bash
napkin --vault "$NAPKIN_VAULT" canvas list
napkin --vault "$NAPKIN_VAULT" canvas list --total
napkin --vault "$NAPKIN_VAULT" canvas read --file "Board"
napkin --vault "$NAPKIN_VAULT" canvas nodes --file "Board"
napkin --vault "$NAPKIN_VAULT" canvas nodes --file "Board" --type text
napkin --vault "$NAPKIN_VAULT" canvas create --file "Board"
napkin --vault "$NAPKIN_VAULT" canvas create --file "Board" --path "projects"
napkin --vault "$NAPKIN_VAULT" canvas add-node --file "Board" --type text --text "# Hello"
napkin --vault "$NAPKIN_VAULT" canvas add-node --file "Board" --type file --note-file "Notes/note.md"
napkin --vault "$NAPKIN_VAULT" canvas add-node --file "Board" --type link --url "https://example.com"
napkin --vault "$NAPKIN_VAULT" canvas add-node --file "Board" --type group --label "My Group"
napkin --vault "$NAPKIN_VAULT" canvas add-node --file "Board" --type text --text "Positioned" --x 100 --y 200
napkin --vault "$NAPKIN_VAULT" canvas add-edge --file "Board" --from abc1 --to def2 --label "relates to"
napkin --vault "$NAPKIN_VAULT" canvas remove-node --file "Board" --id abc1
```

### Word count

```bash
napkin --vault "$NAPKIN_VAULT" wordcount --file "note"
napkin --vault "$NAPKIN_VAULT" wordcount --file "note" --words
napkin --vault "$NAPKIN_VAULT" wordcount --file "note" --characters
```

### Agent onboarding

```bash
napkin --vault "$NAPKIN_VAULT" onboard
```

## JSON output

Every command supports `--json`. Always use `--json` for programmatic access:

```bash
napkin --vault "$NAPKIN_VAULT" task list --todo --json
napkin --vault "$NAPKIN_VAULT" search "deploy" --json
napkin --vault "$NAPKIN_VAULT" property read --file "note" --name status --json
```

## Common workflows

### Morning standup prep

```bash
napkin --vault "$NAPKIN_VAULT" daily read --json
napkin --vault "$NAPKIN_VAULT" task list --todo --json
napkin --vault "$NAPKIN_VAULT" search "blocker" --json
```

### Project overview

```bash
napkin --vault "$NAPKIN_VAULT" file list --folder projects --json
napkin --vault "$NAPKIN_VAULT" tag list --counts --json
napkin --vault "$NAPKIN_VAULT" link orphans --json
napkin --vault "$NAPKIN_VAULT" link unresolved --json
```

### Note management

```bash
napkin --vault "$NAPKIN_VAULT" create --name "Meeting Notes" --template "Meeting Note" --path "projects"
napkin --vault "$NAPKIN_VAULT" property set --file "Meeting Notes" --name attendees --value "Alice, Bob"
napkin --vault "$NAPKIN_VAULT" append --file "Meeting Notes" --content "- [ ] Follow up on deployment"
```

---
name: napkin
description: Read, create, search, and manage notes in Obsidian vaults using the napkin CLI. Works directly on markdown files and canvas files — no Obsidian app required. Use when the user asks to interact with their Obsidian vault, manage notes, search vault content, work with tasks, tags, properties, daily notes, templates, bases, bookmarks, aliases, or canvas files from the command line.
---

# napkin

CLI for Obsidian vaults. Operates directly on markdown files — no Obsidian app, no Electron, no Catalyst license.

Install: `npm install -g napkin-ai`

**IMPORTANT**: Always pass `--vault $NAPKIN_VAULT` to every napkin command. The vault lives in the `knowledge/` subdirectory, not the workspace root.

## Syntax

napkin uses standard CLI flags. Quote values with spaces:

```bash
napkin --vault $NAPKIN_VAULT create --name "My Note" --content "Hello world"
```

### Global flags

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON (use this for programmatic access) |
| `-q, --quiet` | Suppress output |
| `--vault <path>` | Vault path (default: auto-detect by walking up from cwd looking for `.obsidian/`) |
| `--copy` | Copy output to clipboard |

### File targeting

- `--file <name>` — resolves like a wikilink (name only, no path or extension needed)
- `--path <path>` — exact path from vault root, e.g. `Projects/note.md`

## Commands

### Vault

```bash
napkin --vault $NAPKIN_VAULT vault                                # Vault info (name, path, files, folders, size)
napkin --vault $NAPKIN_VAULT version                              # CLI version
```

### Files & folders — `napkin file`

```bash
napkin --vault $NAPKIN_VAULT file info <name>                     # File info (path, size, dates)
napkin --vault $NAPKIN_VAULT file list                            # List all files
napkin --vault $NAPKIN_VAULT file list --ext md                   # Filter by extension
napkin --vault $NAPKIN_VAULT file list --folder Projects          # Filter by folder
napkin --vault $NAPKIN_VAULT file list --total                    # Count files
napkin --vault $NAPKIN_VAULT file folder <path>                   # Folder info (files, folders, size)
napkin --vault $NAPKIN_VAULT file folder <path> --info files      # Just the file count
napkin --vault $NAPKIN_VAULT file folders                         # List all folders
napkin --vault $NAPKIN_VAULT file folders --total                 # Count folders
```

### Read & write

```bash
napkin --vault $NAPKIN_VAULT read <file>                          # Read file contents
napkin --vault $NAPKIN_VAULT create --name "Note" --content "# Hello"
napkin --vault $NAPKIN_VAULT create --name "Note" --path "Projects" --template "Meeting Note"
napkin --vault $NAPKIN_VAULT append --file "Note" --content "New line at end"
napkin --vault $NAPKIN_VAULT prepend --file "Note" --content "New line after frontmatter"
napkin --vault $NAPKIN_VAULT move --file "Note" --to Archive
napkin --vault $NAPKIN_VAULT rename --file "Note" --name "Renamed Note"
napkin --vault $NAPKIN_VAULT delete --file "Note"                 # Move to .trash
napkin --vault $NAPKIN_VAULT delete --file "Note" --permanent     # Delete permanently
```

### Daily notes — `napkin daily`

Reads config from `.obsidian/daily-notes.json` (folder, format, template).

```bash
napkin --vault $NAPKIN_VAULT daily today                          # Create today's daily note (from template if configured)
napkin --vault $NAPKIN_VAULT daily path                           # Print daily note path
napkin --vault $NAPKIN_VAULT daily read                           # Print daily note contents
napkin --vault $NAPKIN_VAULT daily append --content "- [ ] Buy groceries"
napkin --vault $NAPKIN_VAULT daily prepend --content "## Morning"
```

### Search

Full-text search with relevance ranking (fuzzy matching, prefix search, filename boosting).

```bash
napkin --vault $NAPKIN_VAULT search "meeting"                     # Find files matching text
napkin --vault $NAPKIN_VAULT search --query "meeting"             # Same, using flag
napkin --vault $NAPKIN_VAULT search "TODO" --path Projects        # Limit to folder
napkin --vault $NAPKIN_VAULT search "bug" --total                 # Count matches
napkin --vault $NAPKIN_VAULT search "deploy" --limit 5            # Top 5 results
napkin --vault $NAPKIN_VAULT search "TODO" --context              # Grep-style file:line:text output
```

### Tasks — `napkin task`

```bash
napkin --vault $NAPKIN_VAULT task list                            # List all tasks
napkin --vault $NAPKIN_VAULT task list --todo                     # Incomplete only
napkin --vault $NAPKIN_VAULT task list --done                     # Completed only
napkin --vault $NAPKIN_VAULT task list --daily                    # Today's daily note tasks
napkin --vault $NAPKIN_VAULT task list --file "Project A"         # Tasks in specific file
napkin --vault $NAPKIN_VAULT task list --verbose                  # Group by file with line numbers
napkin --vault $NAPKIN_VAULT task list --total                    # Count tasks
napkin --vault $NAPKIN_VAULT task show --file "note" --line 3     # Show task info
napkin --vault $NAPKIN_VAULT task show --file "note" --line 3 --toggle  # Toggle ✓/○
napkin --vault $NAPKIN_VAULT task show --file "note" --line 3 --done    # Mark done
napkin --vault $NAPKIN_VAULT task show --ref "note.md:3" --todo         # Mark todo (file:line shorthand)
```

### Tags — `napkin tag`

```bash
napkin --vault $NAPKIN_VAULT tag list                             # List all tags
napkin --vault $NAPKIN_VAULT tag list --counts                    # With occurrence counts
napkin --vault $NAPKIN_VAULT tag list --sort count                # Sort by frequency
napkin --vault $NAPKIN_VAULT tag info --name "project"            # Tag info (count)
napkin --vault $NAPKIN_VAULT tag info --name "project" --verbose  # With file list
napkin --vault $NAPKIN_VAULT tag aliases                          # List all aliases in vault
napkin --vault $NAPKIN_VAULT tag aliases --file "note"            # Aliases for a file
napkin --vault $NAPKIN_VAULT tag aliases --total                  # Count aliases
```

### Properties — `napkin property`

```bash
napkin --vault $NAPKIN_VAULT property list                        # List all property names in vault
napkin --vault $NAPKIN_VAULT property list --file "note"          # Properties for a specific file
napkin --vault $NAPKIN_VAULT property list --counts               # With occurrence counts
napkin --vault $NAPKIN_VAULT property read --file "note" --name title
napkin --vault $NAPKIN_VAULT property set --file "note" --name status --value done
napkin --vault $NAPKIN_VAULT property remove --file "note" --name status
```

### Links — `napkin link`

```bash
napkin --vault $NAPKIN_VAULT link back --file "note"              # Files linking TO this file
napkin --vault $NAPKIN_VAULT link out --file "note"               # Outgoing links FROM this file
napkin --vault $NAPKIN_VAULT link unresolved                      # Broken links (target doesn't exist)
napkin --vault $NAPKIN_VAULT link orphans                         # Files with no incoming links
napkin --vault $NAPKIN_VAULT link deadends                        # Files with no outgoing links
```

### Outline

```bash
napkin --vault $NAPKIN_VAULT outline --file "note"                # Heading tree
napkin --vault $NAPKIN_VAULT outline --file "note" --format md    # Markdown list
napkin --vault $NAPKIN_VAULT outline --file "note" --format json  # JSON array
```

### Templates — `napkin template`

```bash
napkin --vault $NAPKIN_VAULT template list                        # List templates
napkin --vault $NAPKIN_VAULT template read --name "Daily Note"    # Read template content
napkin --vault $NAPKIN_VAULT template read --name "Meeting" --resolve --title "Standup"  # Resolve variables
napkin --vault $NAPKIN_VAULT template insert --file "note" --name "Template"  # Insert template into file
```

### Bookmarks — `napkin bookmark`

```bash
napkin --vault $NAPKIN_VAULT bookmark list                        # List bookmarks
napkin --vault $NAPKIN_VAULT bookmark list --total                # Count bookmarks
napkin --vault $NAPKIN_VAULT bookmark add --file "note"           # Bookmark a file
napkin --vault $NAPKIN_VAULT bookmark add --folder "Projects"     # Bookmark a folder
napkin --vault $NAPKIN_VAULT bookmark add --search "TODO"         # Bookmark a search
napkin --vault $NAPKIN_VAULT bookmark add --url "https://example.com" --title "Example"
```

### Bases — `napkin base`

Query vault files using Obsidian Bases `.base` files (YAML-defined filters over frontmatter properties, powered by SQLite in-memory).

```bash
napkin --vault $NAPKIN_VAULT base list                            # List .base files
napkin --vault $NAPKIN_VAULT base views --file "projects"         # List views in a base
napkin --vault $NAPKIN_VAULT base query --file "projects"         # Query default view
napkin --vault $NAPKIN_VAULT base query --file "projects" --view "Active"  # Query named view
napkin --vault $NAPKIN_VAULT base query --file "projects" --format paths   # Just file paths
napkin --vault $NAPKIN_VAULT base query --file "projects" --format csv     # CSV output
napkin --vault $NAPKIN_VAULT base create --file "projects" --name "New Item"  # Create item in base
```

### Canvas — `napkin canvas`

Read and write JSON Canvas files (`.canvas`) — nodes, edges, groups.

```bash
napkin --vault $NAPKIN_VAULT canvas list                          # List .canvas files
napkin --vault $NAPKIN_VAULT canvas list --total                  # Count canvases
napkin --vault $NAPKIN_VAULT canvas read --file "Board"           # Dump canvas (nodes + edges)
napkin --vault $NAPKIN_VAULT canvas nodes --file "Board"          # List all nodes
napkin --vault $NAPKIN_VAULT canvas nodes --file "Board" --type text  # Filter by type
napkin --vault $NAPKIN_VAULT canvas create --file "Board"         # Create empty canvas
napkin --vault $NAPKIN_VAULT canvas create --file "Board" --path "Projects"
napkin --vault $NAPKIN_VAULT canvas add-node --file "Board" --type text --text "# Hello"
napkin --vault $NAPKIN_VAULT canvas add-node --file "Board" --type file --note-file "Notes/note.md"
napkin --vault $NAPKIN_VAULT canvas add-node --file "Board" --type link --url "https://example.com"
napkin --vault $NAPKIN_VAULT canvas add-node --file "Board" --type group --label "My Group"
napkin --vault $NAPKIN_VAULT canvas add-node --file "Board" --type text --text "Positioned" --x 100 --y 200
napkin --vault $NAPKIN_VAULT canvas add-edge --file "Board" --from abc1 --to def2 --label "relates to"
napkin --vault $NAPKIN_VAULT canvas remove-node --file "Board" --id abc1  # Removes node + connected edges
```

Node IDs are 16-char hex. `--from`/`--to`/`--id` accept ID prefixes for convenience.
Node types: `text`, `file`, `link`, `group`. Colors: `1`-`6` or hex.
New nodes auto-position to the right of existing content.

### Word count

```bash
napkin --vault $NAPKIN_VAULT wordcount --file "note"              # Words + characters
napkin --vault $NAPKIN_VAULT wordcount --file "note" --words      # Words only
napkin --vault $NAPKIN_VAULT wordcount --file "note" --characters # Characters only
```

### Agent onboarding

```bash
napkin --vault $NAPKIN_VAULT onboard                              # Print instructions for CLAUDE.md/AGENTS.md
```

## JSON output

Every command supports `--json`. Always use `--json` for programmatic access:

```bash
napkin --vault $NAPKIN_VAULT task list --todo --json
# {"tasks": [{"text": "Buy groceries", "done": false, "file": "Daily/2024-01-15.md", "line": 5}, ...]}

napkin --vault $NAPKIN_VAULT search "deploy" --json
# {"files": ["Projects/Deploy Guide.md", "Notes/CI-CD.md"]}

napkin --vault $NAPKIN_VAULT property read --file "note" --name status --json
# {"value": "done"}
```

## Common workflows

### Morning standup prep

```bash
napkin --vault $NAPKIN_VAULT daily read --json                    # What did I write yesterday?
napkin --vault $NAPKIN_VAULT task list --todo --json              # What's pending?
napkin --vault $NAPKIN_VAULT search "blocker" --json              # Any blockers?
```

### Project overview

```bash
napkin --vault $NAPKIN_VAULT file list --folder Projects --json   # List project files
napkin --vault $NAPKIN_VAULT tag list --counts --json             # Tag distribution
napkin --vault $NAPKIN_VAULT link orphans --json                  # Forgotten files
napkin --vault $NAPKIN_VAULT link unresolved --json               # Broken links to fix
```

### Note management

```bash
napkin --vault $NAPKIN_VAULT create --name "Meeting Notes" --template "Meeting Note" --path "Meetings"
napkin --vault $NAPKIN_VAULT property set --file "Meeting Notes" --name attendees --value "Alice, Bob"
napkin --vault $NAPKIN_VAULT append --file "Meeting Notes" --content "- [ ] Follow up on deployment"
```

---

# Obsidian Markdown Reference

napkin operates on Obsidian Flavored Markdown files. This section covers the syntax for creating valid content.

## Properties (frontmatter)

YAML frontmatter at the start of a note:

```yaml
---
title: My Note
date: 2024-01-15
tags:
  - project
  - important
aliases:
  - My Note
  - Alternative Name
cssclasses:
  - custom-class
status: in-progress
rating: 4.5
completed: false
---
```

### Property types

| Type | Example |
|------|---------|
| Text | `title: My Title` |
| Number | `rating: 4.5` |
| Checkbox | `completed: true` |
| Date | `date: 2024-01-15` |
| Date & Time | `due: 2024-01-15T14:30:00` |
| List | `tags: [one, two]` or YAML list |
| Links | `related: "[[Other Note]]"` |

Default properties: `tags`, `aliases`, `cssclasses`

## Internal links (wikilinks)

```markdown
[[Note Name]]                    Link to note
[[Note Name|Display Text]]       Custom display text
[[Note Name#Heading]]            Link to heading
[[Note Name#^block-id]]          Link to block
[[#Heading in same note]]        Same-file heading link
```

## Embeds

```markdown
![[Note Name]]                   Embed entire note
![[Note Name#Heading]]           Embed section
![[image.png]]                   Embed image
![[image.png|300]]               Image with width
![[document.pdf]]                Embed PDF
![[document.pdf#page=3]]         PDF at page
```

## Tags

```markdown
#tag
#nested/tag
#tag-with-dashes

# In frontmatter:
tags:
  - tag1
  - nested/tag2
```

Tags can contain letters, numbers (not first), underscores, hyphens, forward slashes.

## Task lists

```markdown
- [ ] Incomplete task
- [x] Completed task
- [ ] Parent task
  - [ ] Subtask
  - [x] Done subtask
```

## Callouts

```markdown
> [!note]
> This is a note callout.

> [!warning] Custom Title
> Warning with custom title.

> [!faq]- Collapsed by default
> Hidden until expanded.

> [!tip]+ Expanded by default
> Visible but collapsible.
```

Callout types: `note`, `abstract`/`summary`/`tldr`, `info`, `todo`, `tip`/`hint`/`important`, `success`/`check`/`done`, `question`/`help`/`faq`, `warning`/`caution`/`attention`, `failure`/`fail`/`missing`, `danger`/`error`, `bug`, `example`, `quote`/`cite`

## Text formatting

| Style | Syntax |
|-------|--------|
| Bold | `**text**` |
| Italic | `*text*` |
| Bold + Italic | `***text***` |
| Strikethrough | `~~text~~` |
| Highlight | `==text==` |
| Inline code | `` `code` `` |

## Code blocks

````markdown
```javascript
function hello() {
  console.log("Hello");
}
```
````

## Math (LaTeX)

```markdown
Inline: $e^{i\pi} + 1 = 0$

Block:
$$
\sum_{i=1}^{n} x_i
$$
```

## Block references

```markdown
This paragraph can be linked to. ^my-block-id

Link to it: [[Note#^my-block-id]]
Embed it: ![[Note#^my-block-id]]
```

## Comments

```markdown
This is visible %%but this is hidden%% text.

%%
This entire block is hidden.
%%
```

---

# Bases Reference

Bases are YAML-defined views that query vault files using their frontmatter properties. Saved as `.base` files.

## Structure

```yaml
filters:
  and:
    - file.hasTag("project")
    - 'status != "done"'
formulas:
  days_left: '(date(due) - today()).days'
properties:
  status:
    displayName: Status
views:
  - type: table
    name: "Active"
    order:
      - file.name
      - status
    limit: 20
```

## Filters

```yaml
# Single filter
filters:
  file.hasTag("project")

# AND
filters:
  and:
    - file.hasTag("project")
    - 'status != "done"'

# OR
filters:
  or:
    - file.hasTag("book")
    - file.hasTag("article")

# NOT
filters:
  not:
    - file.hasTag("archived")

# Nested
filters:
  or:
    - file.hasTag("urgent")
    - and:
        - file.hasTag("project")
        - 'priority >= 3'
```

### Filter operators

| Operator | Description |
|----------|-------------|
| `==` | equals |
| `!=` | not equal |
| `>` | greater than |
| `<` | less than |
| `>=` | greater than or equal |
| `<=` | less than or equal |

### File functions for filters

| Function | Description |
|----------|-------------|
| `file.hasTag("tag1", "tag2")` | Has any of the tags (includes nested) |
| `file.hasLink("Note")` | Has link to note |
| `file.hasProperty("name")` | Has frontmatter property |
| `file.inFolder("Projects")` | In folder or subfolder |

### File properties

| Property | Type | Description |
|----------|------|-------------|
| `file.name` | String | File name |
| `file.basename` | String | Name without extension |
| `file.path` | String | Full path from vault root |
| `file.folder` | String | Parent folder path |
| `file.ext` | String | File extension |
| `file.size` | Number | Size in bytes |
| `file.ctime` | Date | Created time |
| `file.mtime` | Date | Modified time |
| `file.tags` | List | All tags |
| `file.links` | List | Internal links |

### Note properties

Frontmatter properties accessed as `note.property` or just `property`:

```yaml
filters:
  and:
    - 'status == "active"'        # shorthand
    - 'note.priority >= 3'        # explicit
```

## Formulas

```yaml
formulas:
  total: "price * quantity"
  status_icon: 'if(done, "✅", "⏳")'
  formatted_price: 'if(price, price.toFixed(2) + " dollars")'
  created: 'file.ctime.format("YYYY-MM-DD")'
  days_old: '(now() - file.ctime).days'
  days_until_due: 'if(due_date, (date(due_date) - today()).days, "")'
```

### Global functions

| Function | Description |
|----------|-------------|
| `date(string)` | Parse date (`YYYY-MM-DD HH:mm:ss`) |
| `now()` | Current datetime |
| `today()` | Current date (time = 00:00:00) |
| `if(cond, true, false?)` | Conditional |
| `min(n1, n2, ...)` | Smallest number |
| `max(n1, n2, ...)` | Largest number |
| `number(any)` | Convert to number |
| `link(path, display?)` | Create link |
| `list(element)` | Wrap in list |

### Date arithmetic

```yaml
"date + \"1M\""              # Add 1 month
"now() + \"1 day\""          # Tomorrow
"today() + \"7d\""           # Week from today
"(now() - file.ctime).days"  # Days since created
```

Duration units: `y`/`year`/`years`, `M`/`month`/`months`, `d`/`day`/`days`, `w`/`week`/`weeks`, `h`/`hour`/`hours`, `m`/`minute`/`minutes`, `s`/`second`/`seconds`

### String functions

`contains()`, `startsWith()`, `endsWith()`, `lower()`, `trim()`, `replace()`, `split()`, `slice()`, `isEmpty()`, `.length`

### Number functions

`abs()`, `ceil()`, `floor()`, `round(digits?)`, `toFixed(precision)`

### List functions

`contains()`, `filter()`, `map()`, `join()`, `sort()`, `unique()`, `flat()`, `isEmpty()`, `.length`

## Views

```yaml
views:
  - type: table           # table, list, cards, map
    name: "My View"
    limit: 10
    order:
      - file.name
      - status
      - due_date
    filters:              # View-level filters (AND'd with global)
      'status != "done"'
    groupBy:
      property: status
      direction: ASC      # or DESC
    summaries:
      price: Sum
      count: Average
```

### Summary functions

| Name | Input | Description |
|------|-------|-------------|
| `Average` | Number | Mean |
| `Min` | Number | Smallest |
| `Max` | Number | Largest |
| `Sum` | Number | Sum |
| `Range` | Number | Max - Min |
| `Median` | Number | Median |
| `Earliest` | Date | Earliest date |
| `Latest` | Date | Latest date |
| `Empty` | Any | Count of empty values |
| `Filled` | Any | Count of non-empty values |
| `Unique` | Any | Count of unique values |

## Example: Task tracker

```yaml
filters:
  and:
    - file.hasTag("task")
    - 'file.ext == "md"'
formulas:
  days_until_due: 'if(due, (date(due) - today()).days, "")'
  priority_label: 'if(priority == 1, "🔴 High", if(priority == 2, "🟡 Medium", "🟢 Low"))'
views:
  - type: table
    name: "Active Tasks"
    filters:
      and:
        - 'status != "done"'
    order:
      - file.name
      - status
      - formula.priority_label
      - due
      - formula.days_until_due
    groupBy:
      property: status
      direction: ASC
```

---

# JSON Canvas Reference

Canvas files (`.canvas`) are JSON following the [JSON Canvas Spec 1.0](https://jsoncanvas.org/spec/1.0/).

```json
{
  "nodes": [
    {"id": "aabb11223344", "type": "text", "x": 0, "y": 0, "width": 300, "height": 150, "text": "# Hello\nMarkdown content"},
    {"id": "ccdd55667788", "type": "file", "x": 400, "y": 0, "width": 300, "height": 200, "file": "Notes/note.md"},
    {"id": "eeff99001122", "type": "link", "x": 0, "y": 300, "width": 300, "height": 100, "url": "https://example.com"},
    {"id": "1122334455667788", "type": "group", "x": -50, "y": -50, "width": 800, "height": 500, "label": "My Group", "color": "4"}
  ],
  "edges": [
    {"id": "aabbccddeeff0011", "fromNode": "aabb11223344", "fromSide": "right", "toNode": "ccdd55667788", "toSide": "left", "label": "links to"}
  ]
}
```

### Node types

| Type | Required fields | Description |
|------|----------------|-------------|
| `text` | `text` | Markdown content |
| `file` | `file`, optional `subpath` | Reference to vault file |
| `link` | `url` | External URL |
| `group` | optional `label`, `background`, `backgroundStyle` | Visual container |

### Common fields

All nodes: `id` (16-char hex), `type`, `x`, `y`, `width`, `height`, optional `color` (1-6 or hex).
Edges: `id`, `fromNode`, `toNode`, optional `fromSide`/`toSide` (top/right/bottom/left), `fromEnd`/`toEnd` (none/arrow), `label`, `color`.

---

## Example: Project notes

```yaml
filters:
  and:
    - file.inFolder("Projects")
    - 'file.ext == "md"'
formulas:
  last_updated: 'file.mtime.relative()'
  link_count: 'file.links.length'
views:
  - type: table
    name: "All Projects"
    order:
      - file.name
      - status
      - formula.last_updated
      - formula.link_count
    groupBy:
      property: status
      direction: ASC
```

import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";
import { Database } from "bun:sqlite";
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const KNOWLEDGE_DIR = "knowledge";
const VAULT_DIRS = ["people", "projects", "references", "daily", "templates"];

// ---------------------------------------------------------------------------
// Obsidian configs
// ---------------------------------------------------------------------------

const DAILY_NOTES_CONFIG = JSON.stringify(
  { folder: "daily", format: "YYYY-MM-DD", template: "templates/Daily Note" },
  null,
  2,
);

const TEMPLATES_CONFIG = JSON.stringify({ folder: "templates" }, null, 2);

const DAILY_TEMPLATE = `---
tags:
  - daily
---

## Conversations

## Learned

## Tasks

- [ ] 
`;

// ---------------------------------------------------------------------------
// KB Distillation prompt — adapted for new knowledge structure
// ---------------------------------------------------------------------------

const KB_DISTILLER_PROMPT = `You are a KB distillation agent. Extract lasting knowledge from conversations and save to an Obsidian vault.

## Input

You receive a path to a JSONL file. Each line is:
\`\`\`json
{"ts":1709123456,"role":"ambient|user|assistant","content":"..."}
\`\`\`

**Roles:**
- \`ambient\` = Chat message. Format: \`Name: message content\`
- \`user\` = Message that triggered the assistant
- \`assistant\` = Assistant's response

## Vault

Current directory is the vault. Use \`--vault .\` with napkin.

## Incremental Updates

Check before creating:
1. \`napkin search --vault . "name"\`
2. Exists → \`napkin append\`
3. New → \`napkin create\`

## Extract

### PEOPLE (3+ messages OR shared resource OR clear position)
\`\`\`markdown
# [Person Name]

## Expertise
- [topics]

## Positions
- [opinions]

## Resources Shared
- [[resource]]
\`\`\`

### RESOURCES (tools, repos, URLs → references/)
\`\`\`markdown
# [Resource Name]

Type: tool | repo | article
URL: [if shared]
Shared by: [[person]] on [date]

## What it does
## Why shared
\`\`\`

### PROJECTS (decisions, architecture, status updates)
\`\`\`markdown
# [Project Name]

## Status
## Key Decisions
- [date]: [decision] — [rationale]

## Participants
- [[person-a]], [[person-b]]
\`\`\`

## Skip

- Thin interactions (greetings, acknowledgments)
- Encyclopedia definitions
- Transient chatter
- \`<reply_to>\` blocks
- Tool outputs

## Napkin Commands

\`\`\`bash
# Search vault
napkin search --vault . "query"

# Read file
napkin read --vault . "path/to/file.md"

# Create new file — use the correct directory:
#   people/     — person entities
#   projects/   — project knowledge
#   references/ — tools, repos, articles, URLs
#   daily/      — daily notes
napkin create --vault . --name "name" --path "people" --content "..."
napkin create --vault . --name "name" --path "projects" --content "..."
napkin create --vault . --name "name" --path "references" --content "..."

# Append to existing
napkin append --vault . --file "name" --content "..."

# Daily note
napkin daily append --vault . --content "..."
\`\`\`

## Conventions

- Files: \`kebab-case.md\`
- Links: \`[[lowercase]]\`
- Paths: \`people/\`, \`projects/\`, \`references/\`

## Output

\`\`\`
## Files Created/Updated
- path - description

## Skipped
- reason
\`\`\`
`;

// ---------------------------------------------------------------------------
// Distillation helpers
// ---------------------------------------------------------------------------

interface MessageRow {
  role: string;
  content: string;
  createdAt: number;
}

function formatDate(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function todayDate(): string {
  return formatDate(Date.now());
}

function md5(content: string): string {
  return new Bun.CryptoHasher("md5").update(content).digest("hex");
}

function exportMessages(
  db: Database,
  spaceId: string,
  messagesDir: string,
): Set<string> {
  mkdirSync(messagesDir, { recursive: true });

  const rows = db
    .query(
      `SELECT role, content, created_at as createdAt
       FROM messages
       WHERE space_id = ?
       ORDER BY id ASC`,
    )
    .all(spaceId) as MessageRow[];

  const byDate = new Map<string, Array<{ ts: number; role: string; content: string }>>();
  for (const row of rows) {
    const date = formatDate(row.createdAt);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push({ ts: row.createdAt, role: row.role, content: row.content });
  }

  const changed = new Set<string>();
  for (const [date, messages] of byDate) {
    const filePath = join(messagesDir, `${date}.jsonl`);
    const newContent = `${messages.map((m) => JSON.stringify(m)).join("\n")}\n`;

    const oldHash = existsSync(filePath) ? md5(readFileSync(filePath, "utf-8")) : "";
    writeFileSync(filePath, newContent);
    const newHash = md5(newContent);

    if (oldHash !== newHash) {
      changed.add(date);
    }
  }

  return changed;
}

function runDistiller(vaultDir: string, dateFile: string): Promise<boolean> {
  const promptFile = join(tmpdir(), `kb-distiller-${process.pid}.md`);
  writeFileSync(promptFile, KB_DISTILLER_PROMPT);

  return new Promise((resolve) => {
    const child = spawn(
      "pi",
      [
        "--print",
        "--no-session",
        "--tools",
        "read,bash,write",
        "--append-system-prompt",
        promptFile,
        `Distill knowledge from: ${dateFile}`,
      ],
      { cwd: vaultDir, env: process.env, stdio: "inherit" },
    );

    child.on("close", (code) => {
      try { unlinkSync(promptFile); } catch {}
      resolve(code === 0);
    });
    child.on("error", () => {
      try { unlinkSync(promptFile); } catch {}
      resolve(false);
    });
  });
}

// ---------------------------------------------------------------------------
// Extension setup
// ---------------------------------------------------------------------------

export default function (mercury: MercuryExtensionAPI) {
  mercury.cli({ name: "napkin", install: "bun add -g napkin-ai" });
  mercury.permission({ defaultRoles: ["admin", "member"] });
  mercury.skill("./skill");

  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  mercury.on("workspace_init", async ({ workspace }) => {
    const knowledgeDir = join(workspace, KNOWLEDGE_DIR);
    const obsidianDir = join(knowledgeDir, ".obsidian");
    const napkinDir = join(knowledgeDir, ".napkin");

    mkdirSync(obsidianDir, { recursive: true });
    mkdirSync(napkinDir, { recursive: true });
    for (const dir of VAULT_DIRS) {
      mkdirSync(join(knowledgeDir, dir), { recursive: true });
    }

    const dailyNotesConfig = join(obsidianDir, "daily-notes.json");
    if (!existsSync(dailyNotesConfig)) {
      writeFileSync(dailyNotesConfig, DAILY_NOTES_CONFIG, "utf8");
    }

    const templatesConfig = join(obsidianDir, "templates.json");
    if (!existsSync(templatesConfig)) {
      writeFileSync(templatesConfig, TEMPLATES_CONFIG, "utf8");
    }

    const dailyTemplatePath = join(knowledgeDir, "templates", "Daily Note.md");
    if (!existsSync(dailyTemplatePath)) {
      writeFileSync(dailyTemplatePath, DAILY_TEMPLATE, "utf8");
    }

    return undefined;
  });

  mercury.on("before_container", async ({ containerWorkspace }) => {
    return {
      env: { NAPKIN_VAULT: join(containerWorkspace, KNOWLEDGE_DIR) },
    };
  });

  // ---------------------------------------------------------------------------
  // KB Distillation job
  // ---------------------------------------------------------------------------

  mercury.job("distill", {
    interval: 3600_000,
    async run(ctx) {
      ctx.log.info("Running KB distillation");

      try {
        const dbPath = join(ctx.config.dataDir, "state.db");
        const spacesDir = join(ctx.config.dataDir, "spaces");

        if (!existsSync(dbPath)) {
          ctx.log.error("Database not found", { dbPath });
          return;
        }

        const db = new Database(dbPath, { readonly: true });

        const spaces = db
          .query("SELECT DISTINCT space_id as spaceId FROM messages")
          .all() as { spaceId: string }[];

        for (const { spaceId } of spaces) {
          const spaceWorkspace = join(spacesDir, spaceId);
          const knowledgeDir = join(spaceWorkspace, KNOWLEDGE_DIR);
          const messagesDir = join(spaceWorkspace, ".messages");

          if (!existsSync(spaceWorkspace)) continue;

          // Ensure knowledge dir exists
          if (!existsSync(knowledgeDir)) continue;

          const changed = exportMessages(db, spaceId, messagesDir);
          const dates = changed.has(todayDate()) ? [todayDate()] : [];

          if (dates.length === 0) {
            ctx.log.debug("No changes to distill", { spaceId });
            continue;
          }

          ctx.log.info("Distilling space", { spaceId, dates });

          for (const date of dates) {
            const dateFile = join(messagesDir, `${date}.jsonl`);
            const success = await runDistiller(knowledgeDir, dateFile);
            if (success) {
              ctx.log.info("Distillation complete", { spaceId, date });
            } else {
              ctx.log.error("Distillation failed", { spaceId, date });
            }
          }
        }

        db.close();

        mercury.store.set("last-distill", new Date().toISOString());
        mercury.store.set("last-distill-status", "success");
        ctx.log.info("KB distillation complete");
      } catch (err) {
        mercury.store.set("last-distill", new Date().toISOString());
        mercury.store.set("last-distill-status", "failed");
        ctx.log.error(
          "KB distillation failed",
          err instanceof Error ? err : undefined,
        );
      }
    },
  });

  // ---------------------------------------------------------------------------
  // Dashboard widget
  // ---------------------------------------------------------------------------

  mercury.widget({
    label: "Knowledge Vault",
    render: () => {
      const lastDistill = mercury.store.get("last-distill") ?? "never";
      const lastStatus = mercury.store.get("last-distill-status") ?? "—";
      return `<div><strong>Last distill:</strong> ${lastDistill}<br><strong>Status:</strong> ${lastStatus}</div>`;
    },
  });
}

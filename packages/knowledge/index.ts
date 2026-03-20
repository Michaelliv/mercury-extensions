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
import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";

const KNOWLEDGE_DIR = "knowledge";
const VAULT_DIR = ".napkin";
const VAULT_DIRS = ["people", "projects", "references", "daily", "Templates"];

// ---------------------------------------------------------------------------
// napkin vault defaults
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG = JSON.stringify(
  {
    overview: { depth: 3, keywords: 8 },
    search: { limit: 30, snippetLines: 0 },
    daily: { folder: "daily", format: "YYYY-MM-DD" },
    templates: { folder: "Templates" },
    distill: {
      enabled: true,
      intervalMinutes: 60,
      model: { provider: "anthropic", id: "claude-sonnet-4-6" },
      templates: [],
    },
    graph: { renderer: "auto" },
  },
  null,
  2,
);

const DAILY_NOTES_CONFIG = JSON.stringify(
  { folder: "daily", format: "YYYY-MM-DD", template: "Templates/Daily Note" },
  null,
  2,
);

const TEMPLATES_CONFIG = JSON.stringify({ folder: "Templates" }, null, 2);
const APP_CONFIG = JSON.stringify({ alwaysUpdateLinks: true }, null, 2);

const NAPKIN_MD = `# Mercury Knowledge Vault

This vault stores distilled knowledge from Mercury conversations.

## Purpose
- Capture durable knowledge about people, projects, and references
- Maintain daily notes for conversation-derived learnings
- Serve as structured memory for future sessions
`;

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

function exportMessages(db: Database, messagesDir: string): Set<string> {
  mkdirSync(messagesDir, { recursive: true });

  const rows = db
    .query(
      `SELECT role, content, created_at as createdAt
       FROM messages
       ORDER BY id ASC`,
    )
    .all() as MessageRow[];

  const byDate = new Map<string, Array<{ ts: number; role: string; content: string }>>();
  for (const row of rows) {
    const date = formatDate(row.createdAt);
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)?.push({ ts: row.createdAt, role: row.role, content: row.content });
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
      try {
        unlinkSync(promptFile);
      } catch {}
      resolve(code === 0);
    });
    child.on("error", () => {
      try {
        unlinkSync(promptFile);
      } catch {}
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
    const vaultDir = join(knowledgeDir, VAULT_DIR);
    const obsidianDir = join(vaultDir, ".obsidian");

    mkdirSync(obsidianDir, { recursive: true });
    for (const dir of VAULT_DIRS) {
      mkdirSync(join(vaultDir, dir), { recursive: true });
    }

    const configPath = join(vaultDir, "config.json");
    if (!existsSync(configPath)) {
      writeFileSync(configPath, DEFAULT_CONFIG, "utf8");
    }

    const napkinMdPath = join(vaultDir, "NAPKIN.md");
    if (!existsSync(napkinMdPath)) {
      writeFileSync(napkinMdPath, NAPKIN_MD, "utf8");
    }

    const dailyNotesConfig = join(obsidianDir, "daily-notes.json");
    if (!existsSync(dailyNotesConfig)) {
      writeFileSync(dailyNotesConfig, DAILY_NOTES_CONFIG, "utf8");
    }

    const templatesConfig = join(obsidianDir, "templates.json");
    if (!existsSync(templatesConfig)) {
      writeFileSync(templatesConfig, TEMPLATES_CONFIG, "utf8");
    }

    const appConfig = join(obsidianDir, "app.json");
    if (!existsSync(appConfig)) {
      writeFileSync(appConfig, APP_CONFIG, "utf8");
    }

    const dailyTemplatePath = join(vaultDir, "Templates", "Daily Note.md");
    if (!existsSync(dailyTemplatePath)) {
      writeFileSync(dailyTemplatePath, DAILY_TEMPLATE, "utf8");
    }

    // Install napkin-context pi extension for vault awareness
    const piExtDir = join(workspace, ".pi", "extensions", "napkin-context");
    mkdirSync(piExtDir, { recursive: true });
    const srcDir = join(import.meta.dir, "napkin-context");
    for (const file of ["index.ts", "package.json"]) {
      const src = join(srcDir, file);
      if (existsSync(src)) {
        writeFileSync(join(piExtDir, file), readFileSync(src, "utf-8"), "utf-8");
      }
    }

    return undefined;
  });

  mercury.on("before_container", async ({ workspace }) => {
    return {
      env: { NAPKIN_VAULT: join(workspace, KNOWLEDGE_DIR, VAULT_DIR) },
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
        const workspace = join(ctx.config.dataDir, "workspace");

        if (!existsSync(dbPath)) {
          ctx.log.error("Database not found", { dbPath });
          return;
        }

        const knowledgeDir = join(workspace, KNOWLEDGE_DIR);
        const vaultDir = join(knowledgeDir, VAULT_DIR);
        const messagesDir = join(workspace, ".messages");

        if (!existsSync(vaultDir)) {
          ctx.log.debug("No napkin vault, skipping distillation");
          return;
        }

        const db = new Database(dbPath, { readonly: true });
        const changed = exportMessages(db, messagesDir);
        db.close();

        const dates = changed.has(todayDate()) ? [todayDate()] : [];

        if (dates.length === 0) {
          ctx.log.debug("No changes to distill");
          return;
        }

        ctx.log.info("Distilling", { dates });

        for (const date of dates) {
          const dateFile = join(messagesDir, `${date}.jsonl`);
          const success = await runDistiller(vaultDir, dateFile);
          if (success) {
            ctx.log.info("Distillation complete", { date });
          } else {
            ctx.log.error("Distillation failed", { date });
          }
        }

        mercury.store.set("last-distill", new Date().toISOString());
        mercury.store.set("last-distill-status", "success");
        ctx.log.info("KB distillation complete");
      } catch (err) {
        mercury.store.set("last-distill", new Date().toISOString());
        mercury.store.set("last-distill-status", "failed");
        ctx.log.error("KB distillation failed", err instanceof Error ? err : undefined);
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

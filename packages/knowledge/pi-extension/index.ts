import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

function findVaultPath(cwd: string): string | null {
  let dir = cwd;
  while (dir !== path.dirname(dir)) {
    const napkinDir = path.join(dir, ".napkin");
    if (fs.existsSync(napkinDir)) {
      return napkinDir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

function getOverview(vaultPath: string): string | null {
  try {
    const output = execSync(`napkin overview --vault "${vaultPath}"`, {
      encoding: "utf-8",
      timeout: 10000,
    }).trim();
    return output || null;
  } catch {
    // Fallback to reading NAPKIN.md directly
    const napkinPath = path.join(vaultPath, "NAPKIN.md");
    if (!fs.existsSync(napkinPath)) return null;
    return fs.readFileSync(napkinPath, "utf-8").trim();
  }
}

export default function (pi: ExtensionAPI) {
  let hasVault = false;

  pi.on("session_start", async (_event, ctx) => {
    const vaultPath = findVaultPath(ctx.cwd);
    if (!vaultPath) return;

    const overview = getOverview(vaultPath);
    hasVault = !!overview;

    if (overview) {
      // Check if we already injected context in this session
      const alreadyInjected = ctx.sessionManager
        .getEntries()
        .some(
          (e) =>
            e.type === "message" &&
            e.message.role === "custom" &&
            (e.message as any).customType === "napkin-context",
        );

      if (!alreadyInjected) {
        ctx.sessionManager.appendCustomMessageEntry(
          "napkin-context",
          "## Napkin vault context\n" +
            "You have access to a napkin vault (Obsidian-compatible knowledge base). " +
            "Here is the vault overview. Use `napkin search <query>` to find specific content, " +
            "`napkin read <file>` to open files.\n\n" +
            overview,
          true,
        );
      }
    }

    if (ctx.hasUI) {
      const theme = ctx.ui.theme;
      if (hasVault) {
        ctx.ui.setStatus("napkin", "🧻" + theme.fg("dim", " napkin"));
      } else {
        ctx.ui.setStatus(
          "napkin",
          theme.fg("dim", "napkin: no NAPKIN.md"),
        );
      }
    }
  });
}

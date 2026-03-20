import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

function findVaultPath(cwd: string): string | null {
  const envVault = process.env.NAPKIN_VAULT;
  if (envVault && fs.existsSync(envVault)) return envVault;

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
    const napkinPath = path.join(vaultPath, "NAPKIN.md");
    if (!fs.existsSync(napkinPath)) return null;
    return fs.readFileSync(napkinPath, "utf-8").trim();
  }
}

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    const vaultPath = findVaultPath(ctx.cwd);
    if (!vaultPath) return;

    const alreadyInjected = ctx.sessionManager
      .getEntries()
      .some(
        (e) =>
          e.type === "custom_message" &&
          (e as any).customType === "napkin-context",
      );
    if (alreadyInjected) return;

    const overview = getOverview(vaultPath);
    if (!overview) return;

    ctx.sessionManager.appendCustomMessageEntry(
      "napkin-context",
      "## Knowledge vault\n" +
        "You have access to a napkin vault (Obsidian-compatible knowledge base). " +
        "Here is the vault overview. Use `napkin search <query>` to find specific content, " +
        "`napkin read <file>` to open files.\n\n" +
        overview,
      true,
    );
  });
}

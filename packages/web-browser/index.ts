import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";
export default function (mercury: MercuryExtensionAPI) {
  mercury.cli({
    name: "agent-browser",
    install: "npm install -g agent-browser",
  });
  mercury.permission({ defaultRoles: ["admin", "member"] });
  mercury.skill("./skill");

  // Env vars for browser config — set MERCURY_AGENT_BROWSER_USER_AGENT and
  // MERCURY_AGENT_BROWSER_ARGS in .env. Only injected when caller has permission.
  mercury.env({ from: "MERCURY_AGENT_BROWSER_USER_AGENT" });
  mercury.env({ from: "MERCURY_AGENT_BROWSER_ARGS" });

  mercury.on("before_container", async () => {
    return {
      systemPrompt: `When searching the web, always use Brave Search. Never use Google.

Web search pattern:
1. agent-browser open "https://search.brave.com/search?q=your+query+here"
2. agent-browser wait 3000
3. agent-browser snapshot -i

Do NOT use "get text body" on search result pages — it returns raw JS noise.
Use "snapshot -i" instead, which captures clean interactive elements including
weather widgets, search result links, and other structured data.`,
    };
  });
}

import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";

export default function (mercury: {
  cli(opts: { name: string; install: string }): void;
  permission(opts: { defaultRoles: string[] }): void;
  skill(relativePath: string): void;
}) {
  mercury.cli({
    name: "mmdc",
    install: "npm install -g @mermaid-js/mermaid-cli",
  });

  mercury.permission({ defaultRoles: ["admin", "member"] });
  mercury.skill("./skill");
}

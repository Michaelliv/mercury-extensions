import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";
export default function (mercury: {
  cli(opts: { name: string; install: string }): void;
  permission(opts: { defaultRoles: string[] }): void;
  skill(relativePath: string): void;
}) {
  mercury.cli({
    name: "gws",
    install: "npm install -g @googleworkspace/cli",
  });

  mercury.permission({ defaultRoles: ["admin"] });
  mercury.skill("./skill");
}

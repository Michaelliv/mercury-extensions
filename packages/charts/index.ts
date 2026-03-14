import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";
export default function (mercury: MercuryExtensionAPI) {
  mercury.cli({
    name: "charts",
    install: "npm install -g charts-cli",
  });

  mercury.permission({ defaultRoles: ["admin", "member"] });
  mercury.skill("./skill");
}

import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";
export default function (mercury: MercuryExtensionAPI) {
  mercury.cli({
    name: "gws",
    install: "npm install -g @googleworkspace/cli",
  });

  mercury.permission({ defaultRoles: ["admin"] });
  mercury.skill("./skill");
}

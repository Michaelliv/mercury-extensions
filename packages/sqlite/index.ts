import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";

export default function (mercury: MercuryExtensionAPI) {
  mercury.cli({
    name: "sqlite3",
    install:
      "apt-get update && apt-get install -y --no-install-recommends sqlite3 && rm -rf /var/lib/apt/lists/*",
  });

  mercury.permission({ defaultRoles: ["admin", "member"] });
  mercury.skill("./skill");
}

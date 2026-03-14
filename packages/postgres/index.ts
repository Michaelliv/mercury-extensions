import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";

export default function (mercury: MercuryExtensionAPI) {
  mercury.cli({
    name: "psql",
    install:
      "apt-get update && apt-get install -y --no-install-recommends postgresql-client && rm -rf /var/lib/apt/lists/*",
  });

  mercury.permission({ defaultRoles: ["admin"] });
  mercury.skill("./skill");

  mercury.env({ from: "MERCURY_PGHOST" });
  mercury.env({ from: "MERCURY_PGPORT" });
  mercury.env({ from: "MERCURY_PGUSER" });
  mercury.env({ from: "MERCURY_PGPASSWORD" });
  mercury.env({ from: "MERCURY_PGDATABASE" });
}

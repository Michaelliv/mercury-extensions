import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";

export default function (mercury: {
  cli(opts: { name: string; install: string }): void;
  permission(opts: { defaultRoles: string[] }): void;
  skill(relativePath: string): void;
  env(def: { from: string }): void;
}) {
  mercury.cli({
    name: "mysql",
    install:
      "apt-get update && apt-get install -y --no-install-recommends default-mysql-client && rm -rf /var/lib/apt/lists/*",
  });

  mercury.permission({ defaultRoles: ["admin"] });
  mercury.skill("./skill");

  mercury.env({ from: "MERCURY_MYSQL_HOST" });
  mercury.env({ from: "MERCURY_MYSQL_PORT" });
  mercury.env({ from: "MERCURY_MYSQL_USER" });
  mercury.env({ from: "MERCURY_MYSQL_PASSWORD" });
  mercury.env({ from: "MERCURY_MYSQL_DATABASE" });
}

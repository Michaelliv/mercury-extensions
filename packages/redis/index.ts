import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";

export default function (mercury: {
  cli(opts: { name: string; install: string }): void;
  permission(opts: { defaultRoles: string[] }): void;
  skill(relativePath: string): void;
  env(def: { from: string }): void;
}) {
  mercury.cli({
    name: "redis-cli",
    install:
      "apt-get update && apt-get install -y --no-install-recommends redis-tools && rm -rf /var/lib/apt/lists/*",
  });

  mercury.permission({ defaultRoles: ["admin"] });
  mercury.skill("./skill");

  mercury.env({ from: "MERCURY_REDIS_URL" });
}

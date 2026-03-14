import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";
export default function (mercury: {
  cli(opts: { name: string; install: string }): void;
  permission(opts: { defaultRoles: string[] }): void;
  env(def: { from: string; as?: string }): void;
}) {
  mercury.cli({
    name: "gh",
    install:
      "apt-get update && apt-get install -y --no-install-recommends gh git && rm -rf /var/lib/apt/lists/*",
  });

  mercury.permission({ defaultRoles: ["admin"] });
  mercury.env({ from: "MERCURY_GH_TOKEN" });
}

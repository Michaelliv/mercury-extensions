import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";

export default function (mercury: MercuryExtensionAPI) {
  mercury.cli({
    name: "mongosh",
    install:
      "apt-get update && apt-get install -y --no-install-recommends gnupg && " +
      "curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb.gpg && " +
      "echo 'deb [signed-by=/usr/share/keyrings/mongodb.gpg arch=amd64,arm64] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse' > /etc/apt/sources.list.d/mongodb.list && " +
      "apt-get update && apt-get install -y --no-install-recommends mongodb-mongosh mongodb-database-tools && " +
      "rm -rf /var/lib/apt/lists/*",
  });

  mercury.permission({ defaultRoles: ["admin"] });
  mercury.skill("./skill");

  mercury.env({ from: "MERCURY_MONGODB_URI" });
}

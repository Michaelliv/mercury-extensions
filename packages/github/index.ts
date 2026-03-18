import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";
export default function (mercury: MercuryExtensionAPI) {
  mercury.cli({
    name: "gh",
    install:
      "curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg && echo 'deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main' > /etc/apt/sources.list.d/github-cli.list && apt-get update && apt-get install -y --no-install-recommends gh && rm -rf /var/lib/apt/lists/*",
  });

  mercury.permission({ defaultRoles: ["admin"] });
  mercury.env({ from: "MERCURY_GH_TOKEN" });
}

import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";

export default function (mercury: {
  cli(opts: { name: string; install: string }): void;
  permission(opts: { defaultRoles: string[] }): void;
  skill(relativePath: string): void;
}) {
  mercury.cli({
    name: "ffmpeg",
    install:
      "apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*",
  });

  mercury.cli({
    name: "convert",
    install:
      "apt-get update && apt-get install -y --no-install-recommends imagemagick && rm -rf /var/lib/apt/lists/*",
  });

  mercury.cli({
    name: "yt-dlp",
    install: "pip install --break-system-packages yt-dlp",
  });

  mercury.permission({ defaultRoles: ["admin", "member"] });
  mercury.skill("./skill");
}

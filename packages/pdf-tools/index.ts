import type { MercuryExtensionAPI } from "mercury-ai/extensions/types";
export default function (mercury: MercuryExtensionAPI) {
  mercury.cli({
    name: "pdf",
    install:
      "apt-get update && apt-get install -y --no-install-recommends poppler-utils qpdf tesseract-ocr && python3 -m pip install --break-system-packages pypdf pdfplumber pdf2image Pillow reportlab pytesseract pypdfium2 && echo '#!/bin/sh' > /usr/local/bin/pdf && echo 'echo \"pdf extension dependencies installed. Use the pdf skill from the agent.\"' >> /usr/local/bin/pdf && chmod +x /usr/local/bin/pdf && rm -rf /var/lib/apt/lists/*",
  });
  mercury.permission({ defaultRoles: ["admin", "member"] });
  mercury.skill("./skill");
}

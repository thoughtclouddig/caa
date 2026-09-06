#!/usr/bin/env bash
# Build the CAA Brand & Website Overview PDF from pages/tech-spec.html.
# Chrome's headless print does not support CSS repeating footers (@bottom-center),
# so the credit line is stamped onto pages 2..N afterwards (title page skipped).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
cp "$ROOT/pages/tech-spec.html" "$WORK/index.html"

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$WORK/raw.pdf" "file://$WORK/index.html" 2>/dev/null

python3 - "$WORK/raw.pdf" "$ROOT/CAA-Brand-Website-Overview.pdf" <<'PY'
import sys, fitz
TEXT = "Prepared by Andy Renk, ThoughtCloud Digital for Catholic Aviation Association."
src, dst = sys.argv[1], sys.argv[2]
doc = fitz.open(src)
FONT, SIZE, COLOR = "helv", 7.6, (0.29, 0.33, 0.39)
tw = fitz.get_text_length(TEXT, fontname=FONT, fontsize=SIZE)
for i in range(1, doc.page_count):          # page 1 is the title page
    p = doc[i]
    p.insert_text(((p.rect.width - tw) / 2, p.rect.height - 26),
                  TEXT, fontname=FONT, fontsize=SIZE, color=COLOR)
doc.save(dst)
print(f"wrote {dst} ({doc.page_count} pages)")
PY
rm -rf "$WORK"

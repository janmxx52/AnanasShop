# Font & Encoding Audit

> Date: 2026-05-20  
> Scope: Fix mojibake/encoding display only, no business logic changes.

## Files detected with encoding issues

1. `.ai/business/business-rules.md`
   - Issue type: Vietnamese mojibake text (e.g. `khÃ´ng`, `chá»‰`, `hoáº·c`, `quyáº¿t`).
   - Fix: Converted garbled UTF-8/Windows-1252 display text back to proper UTF-8 Vietnamese.

2. `.ai/api/api-documentation.md`
   - Issue type: Mixed mojibake text fragments.
   - Fix: Converted mojibake lines and corrected remaining term `giÃ¡` -> `giá`.

3. `ananas-fashion-frontend/src/styles/index.css`
   - Issue type: Font stack not optimized for Vietnamese consistency.
   - Fix: Updated `body` font stack to a Vietnamese-safe system stack:
     - `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`

## Charset checks

- `ananas-fashion-frontend/index.html` already has:
  - `<meta charset="UTF-8" />`
  - and it is placed early in `<head>`.

## Remaining suspicious mojibake

- After scan with mojibake markers (`Ã`, `Â`, `Ä`, `â€`, `áº`, `á»`, `�`) in scoped files:
  - **0 files** remaining.

## Notes

- Kept valid English text unchanged where it is semantically correct.
- Did not change API endpoints, route names, enums, DB fields, business rules, or logic.

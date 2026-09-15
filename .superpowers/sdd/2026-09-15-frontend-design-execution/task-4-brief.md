# Task 4 brief — USER upload and validation vertical slice

Implement the smallest production-shaped USER upload-to-validation flow from the Stitch `Upload Berkas Wisuda XLSX` and `Validasi File Wisuda & Pemetaan Kolom` screens.

## Contract source of truth

Read-only sync completed against `C:\Users\LENOVO\Documents\ITCC\magang.worktrees\backend\docs\api\openapi.yaml` on 2026-09-15. Use these paths exactly:

- `POST /api/graduation-uploads` (`multipart/form-data`, required `file`) returns `202` with `GraduationUpload` (`id`, `status`, `sheetCount`, optional `studentCount`).
- `GET /api/graduation-uploads/{uploadId}/validation` returns `ValidationReport` (`status`, `sheets`, `errors`).
- `GET /api/me` remains the auth boundary; no client-side identity or token fabrication.

Do not use the older plan aliases `/api/graduation-batches` or `/api/graduation-batches/{id}/validation`; they are not present in the backend OpenAPI currently published.

## Scope

- Add focused failing tests first in `tests/frontend/graduation-upload.test.tsx` for `.xlsx` acceptance, rejected type, upload failure, `202` validating state, and rendering a server-provided 14-sheet validation summary.
- Add a typed feature boundary under `features/graduation/` for upload/validation response shapes and request functions. Reuse `request` from `lib/api-client.ts`; do not duplicate fetch/error parsing.
- Add routes `app/(protected)/user/graduation-upload/page.tsx` and `app/(protected)/user/file-validation/page.tsx` (query `uploadId`). The pages must render usable loading, error, empty/missing-id, and success states with the tactile primitives.
- Implement drag-and-drop as progressive enhancement over a labelled native file input. Accept only `.xlsx` by MIME or extension; show selected filename and size before submit. Submit button must be disabled/loading while the request is pending.
- Render sheet names, row counts, detected columns, and validation errors only from the server response. Do not add fixture student rows or invented field names.
- Keep the shell links limited to routes that exist after this task; do not add links to future screens.

## UX and accessibility

- Preserve Stitch tactile surface, raised/recessed/pressed depth, Plus Jakarta Sans/JetBrains Mono token usage, and Indonesian copy.
- Keyboard path must work without drag-and-drop. Drop target must expose instructions and a visible focus ring via the file input.
- Status uses text plus semantic tone. Upload errors and validation errors use `role=alert`; async progress uses `aria-live`.
- No gradients, fake metrics, decorative icons, or client-side workbook parsing.

## Verification and handoff

Run focused tests RED before implementation, then GREEN; run full tests, lint, strict typecheck, production build, and `git diff --check`. Write `task-4-report.md`, create a review diff, and commit as `feat(frontend): add graduation upload validation flow` only after reviewer approval. Do not edit backend files or OpenAPI.

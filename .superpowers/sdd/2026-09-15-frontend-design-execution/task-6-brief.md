# Task 6 brief — Preview, review, output

Implement vertical slice USER untuk preview hasil, review row, dan output berdasarkan backend OpenAPI tersinkron 2026-09-15.

## Endpoint resmi

- `GET /api/sync-jobs/{jobId}/rows` dengan query `status`, `search`, `page`, `pageSize`.
- `GET /api/sync-jobs/{jobId}/preview` mengembalikan manifest `changes` berisi `SyncRow`.
- `POST /api/sync-rows/{rowId}/review` payload `{ decision: CONFIRMED|REJECTED|SKIPPED, note? }`.
- `POST /api/sync-jobs/{jobId}/generate-output`.
- `GET /api/outputs/{outputId}/download` mengembalikan `{ url, expiresAt }`.

## Scope/TDD

- Tulis RED tests `tests/frontend/sync-results.test.tsx` untuk status filter, search submit, pagination state, review success/failure, output generation, dan download error.
- Tambahkan typed API + components under `features/synchronization/`; gunakan exact `SyncRow` fields (`sheetName`, `sourceRow`, `nim`, `nama`, `resultStatus`, `mosValue`, `titleValue`, `reasonCodes`). Jangan invent matching evidence.
- Tambahkan routes `/user/synchronization/[id]/preview`, `/review`, `/output`, update Sidebar registry only for real pages.
- Table harus punya horizontal overflow region di mobile/tablet; review action berupa dialog/drawer keyboard-operable dengan focus restoration. Status selalu text + tone.
- Render loading/empty/error/permission states. Review POST and output/download actions must work through typed functions, with authorized URL treated as short-lived and not persisted.

## Verification

Catat RED/GREEN/report, review diff, focused/full tests, lint, strict typecheck, build, and `git diff --check`. Commit `feat(frontend): add sync preview review output` after reviewer approval. Jangan edit backend/OpenAPI atau membuat data produksi sintetis.

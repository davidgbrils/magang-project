# Task 6 report — Preview, review, output

Status: complete

## RED

`npm test -- --run tests/frontend/sync-results.test.tsx` initially failed during collection because `features/synchronization/SyncResults` and the Task 6 API functions did not exist.

## Implemented

- Added typed `SyncRow`, row statuses, review payload, paginated rows, preview, generated output, and short-lived download response types/functions in `features/synchronization/synchronization-api.ts`.
- Added server-backed row filters (`status`, `search`, `page`, `pageSize`), preview manifest loading, review submission, output generation, and authorized download URL handling.
- Added `SyncRowsTable`, `SyncPreviewManifestPanel`, `SyncPreviewPanel`, `SyncReviewDialog`, and `SyncOutputPanel` under `features/synchronization/SyncResults.tsx`.
- Added loading, empty, error, and forbidden states. The table has a keyboard-focusable horizontal overflow region for narrow screens.
- Review uses a modal dialog with native controls, initial focus, and focus restoration. Review and output actions call the documented endpoints; no row or output data is fabricated and temporary URLs are not persisted.
- Added routes `/user/synchronization/[id]/preview`, `/review`, and `/output`.
- Updated the implemented protected route registry for the three real pages.
- Added tactile, responsive styles and tokenized spacing for the new result/review/output surfaces.

## Backend contract sync

The frontend was checked against the current read-only backend contract at `C:\Users\LENOVO\Documents\ITCC\magang.worktrees\backend\docs\api\openapi.yaml`. No backend, OpenAPI, Supabase, or processor files were edited.

## GREEN / verification

- `npm run typecheck` — pass
- `npm run lint` — pass
- `npm test -- --run tests/frontend/sync-results.test.tsx` — 8/8 pass
- `git diff --check` — pass (only unrelated CRLF conversion warnings from existing shared files)

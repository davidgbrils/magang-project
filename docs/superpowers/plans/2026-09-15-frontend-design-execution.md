# ITCC Wisuda Sync Frontend Design Execution Plan

Implement the role-aware Next.js frontend from Stitch project `ITCC Wisuda Sync` (`12724873765600380458`) while preserving backend/API boundaries. Frontend owns `app/`, `components/`, `features/`, client `lib/`, `styles/`, `public/`, and frontend tests; do not edit backend, Supabase, processor/tester, or backend OpenAPI.

## Design baseline

Use Stitch tactile neumorphic tokens: surface `#E0E0E0`, light/shadow `#FFFFFF`/`#BEBEBE`, main text `#27313A`, secondary `#66717A` with an accessible derived value for normal text where needed, primary `#356AE6`, Plus Jakarta Sans, JetBrains Mono, raised/recessed/pressed depth, visible focus ring, textual status semantics, responsive 12/8/4-column reflow. No gradients, glass, fabricated metrics, decorative emoji, or dead controls. Antislop mode: DURING.

## Current backend contract (read-only sync 2026-09-15)

Backend publishes `docs/api/openapi.yaml`. Follow exact paths: `GET /api/me`; `POST /api/graduation-uploads`; `GET /api/graduation-uploads/{uploadId}/validation`; `GET /api/reference-batches/active`; `POST /api/sync-jobs`; `GET /api/sync-jobs/{jobId}`; `GET /api/sync-jobs/{jobId}/rows`; `GET /api/sync-jobs/{jobId}/preview`; `POST /api/sync-jobs/{jobId}/generate-output`; `POST /api/sync-rows/{rowId}/review`; `GET /api/outputs/{outputId}/download`; and admin reference-batch import/activation paths. Do not use older aliases such as `/api/graduation-batches` or `/api/sync-runs`.

Contract-pending surfaces (history, dashboards, selectable inactive batches, archive, matching rules update, user/role update, audit-log payloads) must show explicit unavailable/loading/error states or use a named development adapter excluded from production. Never fabricate production data.

## Ordered execution

1. Typed frontend baseline: strict TypeScript, lint/test/build scripts, `lib/api-client.ts`, common error envelope tests, request-time bearer token injection only.
2. Tactile primitives: tokens/globals, `Button`, `TextField`, `StatusBadge`, `AsyncState`, focused accessibility/contrast/reduced-motion tests.
3. Role-aware shell/auth: protected layout, `AppShell`, `Sidebar`, `Topbar`, `/api/me` adapter, direct-path role guard, no links to pages not implemented, labelled mobile menu, safe sign-out errors.
4. USER upload/validation: typed `features/graduation`, accessible XLSX input/drop enhancement, upload and server validation summary using confirmed paths.
5. Reference selection/sync progress: active batches, typed `sync-jobs` polling, unavailable state for uncontracted list, cancellation and live progress.
6. Preview/review/output: typed rows, filter/search/pagination, keyboard review dialog, review decision, output generation and authorized download.
7. ADMIN imports/batches: SITASI/Certiport multipart uploads, period, validating/completed states, list/activate; archive unavailable until contracted.
8. Contract-pending ADMIN screens: hierarchy plus permission/loading/empty/error states; synthetic fixtures only in test/development adapters.
9. Visual/contract QA: compare all Stitch screens desktop/tablet/mobile; check keyboard/focus, 200% zoom, reduced motion, business rules; run tests/lint/typecheck/build/browser smoke and record unrun checks. Do not claim production integration until backend OpenAPI is final.

## Working rules

Use TDD for every task (RED test, smallest implementation, GREEN). Each task requires a report, review diff, reviewer approval, focused/full verification, and scoped commit before the next. Do not push or merge. Re-check backend OpenAPI before adding API calls and report drift.

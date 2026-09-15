# Task 3 Brief: Role-aware shell and authentication states

Work only in `C:\Users\LENOVO\Documents\ITCC\magang.worktrees\frontend`. Read copied `docs/PRD.md`, `docs/TECH-SPEC.md`, and Task 3 in the design execution plan. Existing commits through `958716b` are authority.

Implement a reusable app shell and auth state boundary without inventing a Supabase contract or storing tokens insecurely:

- `components/layout/AppShell.tsx`: typed `role` (`USER`/`ADMIN`), active route label, sidebar and topbar composition. Use actual route destinations only.
- `components/layout/Sidebar.tsx`: role-specific nav arrays. USER routes: `/user/dashboard`, `/user/graduation-upload`, `/user/reference-selection`. ADMIN routes: `/admin/dashboard`, `/admin/import/sitasi`, `/admin/import/certiport`, `/admin/reference-batches`, `/admin/matching-rules`, `/admin/users`, `/admin/audit-logs`. Include a labelled mobile menu button and keyboard-operable navigation.
- `components/layout/Topbar.tsx`: current role display, sign-out callback, and compact mobile header.
- `features/auth/auth-types.ts` and `features/auth/AuthState.tsx`: typed `AuthUser`, auth states `loading`, `authenticated`, `unauthenticated`, `forbidden`, `error`; accept injected `onSignOut`/children. No service-role token, no fake user identity in production components.
- `app/(protected)/layout.tsx`: render a protected shell boundary with an explicit loading/unauthenticated/error state. It may use a client-side boundary with an injected auth adapter; do not call undocumented endpoints beyond `GET /api/me`.
- Update `app/login/page.tsx` with labelled fields, submit disabled/loading/error states, and an explicit adapter callback boundary; do not pretend login succeeded without a provider.
- Keep `app/page.tsx` linked only to `/login`.
- Use tactile primitives from Task 2. No generic dashboard stat cards or invented numbers.

TDD:

1. Add failing tests in `tests/frontend/auth-navigation.test.tsx` for USER/ADMIN nav destinations, forbidden admin exclusion, visible role state, and keyboard/mobile menu semantics. Run and capture RED.
2. Implement minimum shell/auth boundary; run focused GREEN.
3. Run full test suite, lint, strict typecheck, and production build.
4. Write report to `.superpowers/sdd/2026-09-15-frontend-design-execution/task-3-report.md` with exact command evidence. Commit only Task 3 files with `feat(frontend): add role aware app shell`.

Do not edit backend, supabase, OpenAPI, processor, or other agent files. Do not spawn agents.

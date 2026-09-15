# ITCC Wisuda Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an internal application that validates graduation rows against SITASI and Certiport, reviews ambiguous matches, and generates a preserved 14-sheet workbook with only two ITCC columns updated.

**Architecture:** Next.js provides role-aware UI, upload workflow, preview, review, and download. Supabase provides Auth, PostgreSQL, Storage, RLS, and audit metadata. A Python FastAPI processor imports source files, applies deterministic matching rules, and generates the XLSX output.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL/Storage, Python 3.11+, FastAPI, openpyxl, Vitest or Jest, pytest, and Playwright.

**Spec:** `docs/PRD.md` and `docs/TECH-SPEC.md`

## Global Constraints

- Graduation workbook is the primary student list.
- Process all 14 graduation sheets.
- Modify only `Sertifikasi MOS (Diisi ITCC)` and `Title Microsoft (ITCC)`.
- SITASI qualifies a student only when at least one row for the NIM has `Status = LULUS`.
- Certiport qualifies a certification only when `Result = Pass`.
- MCF requires `Program Name = Microsoft Certified Fundamentals` and program code 31 or 32.
- Multiple passed MOS records produce one selected credential, preferring the latest `Exam Date`.
- Name-only Certiport matches require manual review.
- Do not commit real source workbooks or secrets.
- RLS must protect exposed Supabase tables and Storage paths.

---

### Task 1: Repository baseline and contracts

**Files:**
- Create: `docs/api/openapi.yaml`
- Create: `docs/architecture/data-contracts.md`
- Modify: `README.md`
- Test: `tests/contracts/contract_shape.test.ts`

**Interfaces:**
- Produces the endpoint names, enum values, and error shape consumed by frontend, backend, and testing tasks.

- [ ] Inspect the repository, package manager, existing app structure, and current tests.
- [ ] Record the baseline commands and failures in `docs/architecture/baseline.md`.
- [ ] Add the API contract from `docs/TECH-SPEC.md` to `docs/api/openapi.yaml`.
- [ ] Define shared enums: `USER`, `ADMIN`, `SITASI`, `CERTIPORT`, `READY`, `REVIEW_REQUIRED`, `NOT_FOUND_IN_SITASI`, `SITASI_NOT_GRADUATED`, `CERTIPORT_NOT_FOUND`, `DUPLICATE_NIM`, `EXCLUDED_MCF_PROGRAM`, and `FAILED`.
- [ ] Define the common error response with `code`, `message`, `fields`, and `requestId`.
- [ ] Add a contract test that parses the OpenAPI document and checks required paths and enum values.
- [ ] Run the contract test and commit with `docs(api): establish shared contracts`.

### Task 2: Supabase schema, roles, RLS, and Storage policies

**Files:**
- Create: `supabase/migrations/20260915000100_create_core_tables.sql`
- Create: `supabase/migrations/20260915000200_create_rls_policies.sql`
- Create: `supabase/seed.sql`
- Test: `backend/tests/test_database_policies.py`

**Interfaces:**
- Produces tables and policies for `profiles`, `reference_imports`, `sitasi_records`, `certiport_records`, `graduation_batches`, `graduation_records`, `sync_runs`, `sync_results`, and `audit_logs`.

- [ ] Generate migration filenames with the Supabase CLI.
- [ ] Create tables and foreign keys from `docs/TECH-SPEC.md`.
- [ ] Add indexes for batch/NIM and Certiport ID/name lookups.
- [ ] Enable RLS on all exposed tables.
- [ ] Add policies so User reads and mutates only permitted own batches and sync runs, while Admin manages reference imports, rules, users, and audit views.
- [ ] Add Storage policies for separate source and output paths.
- [ ] Seed only synthetic development users and records.
- [ ] Run migration reset and policy tests against a local Supabase instance.
- [ ] Commit with `feat(db): add protected synchronization schema`.

### Task 3: Source import validation

**Files:**
- Create: `backend/app/domain/imports/models.py`
- Create: `backend/app/services/imports/sitasi_importer.py`
- Create: `backend/app/services/imports/certiport_importer.py`
- Create: `backend/app/services/imports/validation.py`
- Test: `backend/tests/test_sitasi_importer.py`
- Test: `backend/tests/test_certiport_importer.py`

**Interfaces:**
- `parse_sitasi(file_path: str) -> ImportReport`
- `parse_certiport(file_path: str) -> ImportReport`
- `ImportReport` contains `status`, `headers`, `record_count`, `errors`, and normalized records.

- [ ] Write failing tests for SITASI headers and accepted statuses.
- [ ] Write failing tests for Certiport header row 4, required fields, and `Pass`, `Fail`, `Inco` values.
- [ ] Implement NIM and name normalization without changing stored raw values.
- [ ] Preserve duplicate SITASI rows.
- [ ] Reject missing required headers with row/column errors.
- [ ] Ensure invalid or empty Certiport Student / Employee ID remains reviewable.
- [ ] Run focused pytest tests.
- [ ] Commit with `feat(imports): validate SITASI and Certiport files`.

### Task 4: Graduation workbook parser and preservation adapter

**Files:**
- Create: `backend/app/services/excel/graduation_parser.py`
- Create: `backend/app/services/excel/output_writer.py`
- Create: `backend/app/domain/excel_models.py`
- Test: `backend/tests/test_graduation_workbook.py`
- Create: `tests/fixtures/graduation_14_sheets.xlsx`

**Interfaces:**
- `parse_graduation_workbook(path: str) -> GraduationWorkbookReport`
- `generate_output(source_path: str, result_map: dict[tuple[str, int], OutputValues], destination_path: str) -> OutputReport`
- `OutputValues` contains `mos_value: str | None` and `title_value: str | None`.

- [ ] Create a synthetic workbook containing all 14 sheet names and the eight target headers.
- [ ] Test that all sheets and source rows are detected.
- [ ] Test missing NIM/Nama headers and invalid workbook errors.
- [ ] Implement parser preserving sheet name and source row.
- [ ] Implement writer that changes only the two ITCC columns.
- [ ] Compare source and output values for all non-target cells and formulas.
- [ ] Open the generated workbook with openpyxl to verify package validity.
- [ ] Run focused workbook tests.
- [ ] Commit with `feat(excel): preserve graduation workbook structure`.

### Task 5: Deterministic matching domain

**Files:**
- Create: `backend/app/domain/matching/rules.py`
- Create: `backend/app/domain/matching/normalization.py`
- Create: `backend/app/domain/matching/engine.py`
- Test: `backend/tests/test_matching_rules.py`
- Test: `backend/tests/test_matching_engine.py`

**Interfaces:**
- `normalize_nim(value: object) -> str`
- `normalize_name(value: str) -> str`
- `select_mos(records: list[CertiportRecord]) -> MosDecision`
- `select_mcf(records: list[CertiportRecord], program_code: str) -> McfDecision`
- `evaluate_record(graduation, sitasi_records, certiport_records) -> SyncDecision`

- [ ] Add failing tests for SITASI LULUS aggregation, MOS latest-pass selection, MCF eligibility, Pass-only filtering, and name-only review.
- [ ] Implement normalization while preserving original display values.
- [ ] Implement MOS selection for Word, Excel, and PowerPoint credential names.
- [ ] Implement all MCF credentials by Program Name, limited to program code 31/32.
- [ ] Produce explicit reason codes for every non-ready decision.
- [ ] Ensure no fuzzy or AI matching silently approves a record.
- [ ] Run focused tests and inspect decision fixtures.
- [ ] Commit with `feat(matching): apply deterministic MOS and MCF rules`.

### Task 6: Backend API and processing workflow

**Files:**
- Create: `backend/app/main.py`
- Create: `backend/app/api/routes/imports.py`
- Create: `backend/app/api/routes/graduation.py`
- Create: `backend/app/api/routes/synchronization.py`
- Create: `backend/app/api/routes/admin.py`
- Create: `backend/app/services/synchronization_service.py`
- Test: `backend/tests/test_api_workflow.py`

**Interfaces:**
- Implements endpoints in `docs/TECH-SPEC.md`.
- Produces sync progress and result response shapes consumed by frontend.

- [ ] Write API tests for authentication and role permissions.
- [ ] Implement upload validation and batch persistence.
- [ ] Implement sync-run creation using exactly one graduation, SITASI, and Certiport batch.
- [ ] Execute the parser, matching engine, and output writer through the service layer.
- [ ] Persist progress after each stage and expose it through `GET /api/sync-runs/{id}`.
- [ ] Persist review decisions and audit events.
- [ ] Implement authorized output download.
- [ ] Return structured errors without secrets or raw sensitive rows.
- [ ] Run API and integration tests.
- [ ] Commit with `feat(api): add synchronization workflow`.

### Task 7: Frontend application shell and authentication

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/(protected)/layout.tsx`
- Create: `components/layout/AppShell.tsx`
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/Topbar.tsx`
- Create: `lib/api-client.ts`
- Test: `tests/frontend/auth-navigation.test.tsx`

**Interfaces:**
- Consumes `GET /api/me` and role-aware navigation.
- Produces route guards and typed API client used by later UI tasks.

- [ ] Implement login, logout, expired session, and unauthorized states.
- [ ] Add User and Admin navigation with no dead links.
- [ ] Add neumorphic tokens from the approved Figma design.
- [ ] Keep service-role operations out of the browser.
- [ ] Test role navigation and protected routes.
- [ ] Run lint, typecheck, and focused tests.
- [ ] Commit with `feat(frontend): add auth and app shell`.

### Task 8: Frontend User synchronization workflow

**Files:**
- Create: `app/(protected)/user/dashboard/page.tsx`
- Create: `app/(protected)/user/graduation-upload/page.tsx`
- Create: `app/(protected)/user/file-validation/page.tsx`
- Create: `app/(protected)/user/reference-selection/page.tsx`
- Create: `app/(protected)/user/synchronization/[id]/progress/page.tsx`
- Create: `app/(protected)/user/synchronization/[id]/preview/page.tsx`
- Create: `app/(protected)/user/synchronization/[id]/review/page.tsx`
- Create: `app/(protected)/user/synchronization/[id]/output/page.tsx`
- Create: `features/synchronization/components/ResultTable.tsx`
- Create: `features/synchronization/components/ReviewDrawer.tsx`
- Test: `tests/frontend/user-workflow.test.tsx`

**Interfaces:**
- Consumes graduation, reference-batch, sync, review, and download endpoints.
- Produces accessible upload, preview, review, and output interactions.

- [ ] Implement upload drag/drop, file validation, and 14-sheet display.
- [ ] Implement active batch selection.
- [ ] Implement progress polling with loading and failure states.
- [ ] Implement result filters and NIM/name search.
- [ ] Implement review confirmation, rejection, and skip.
- [ ] Implement output download and review report action where available.
- [ ] Add mobile layouts for upload, table, and review drawer.
- [ ] Run frontend tests and browser smoke tests.
- [ ] Commit with `feat(frontend): add user synchronization flow`.

### Task 9: Frontend Admin workflow

**Files:**
- Create: `app/(protected)/admin/dashboard/page.tsx`
- Create: `app/(protected)/admin/import/sitasi/page.tsx`
- Create: `app/(protected)/admin/import/certiport/page.tsx`
- Create: `app/(protected)/admin/reference-batches/page.tsx`
- Create: `app/(protected)/admin/matching-rules/page.tsx`
- Create: `app/(protected)/admin/users/page.tsx`
- Create: `app/(protected)/admin/audit-logs/page.tsx`
- Test: `tests/frontend/admin-workflow.test.tsx`

**Interfaces:**
- Consumes admin endpoints and renders admin-only actions.

- [ ] Implement SITASI and Certiport upload mapping and validation views.
- [ ] Show Certiport header row 4 and invalid Student / Employee ID warning.
- [ ] Implement batch activate/archive actions with confirmation.
- [ ] Implement MOS/MCF rule display and unsaved-changes state.
- [ ] Implement User/Admin management and audit filtering.
- [ ] Test that User cannot see or invoke Admin navigation.
- [ ] Run lint, typecheck, and focused tests.
- [ ] Commit with `feat(frontend): add admin operations`.

### Task 10: Integration, E2E, and release gate

**Files:**
- Create: `tests/e2e/synchronization.spec.ts`
- Create: `tests/e2e/admin-imports.spec.ts`
- Create: `docs/quality-report.md`
- Modify: `README.md`

**Interfaces:**
- Consumes the complete frontend/backend system and synthetic fixture set.
- Produces release evidence and a list of remaining limitations.

- [ ] Run database migration and RLS tests.
- [ ] Run matching unit tests with all business rule cases.
- [ ] Run workbook preservation tests on the 14-sheet fixture.
- [ ] Run User E2E from upload through output download.
- [ ] Run Admin E2E for both imports, batch activation, and rules.
- [ ] Test empty, loading, warning, error, unauthorized, and success states.
- [ ] Run lint, typecheck, build, backend tests, and E2E tests.
- [ ] Record command output and any unrun checks in `docs/quality-report.md`.
- [ ] Commit with `test: verify end-to-end synchronization workflow`.

## Integration order

1. Task 1 establishes contracts.
2. Tasks 2 through 5 can proceed in backend and testing worktrees after the contract exists.
3. Task 6 integrates backend workflow.
4. Tasks 7 through 9 implement the UI against the contract.
5. Task 10 is the final integration gate.

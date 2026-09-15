# Setup and Development Guide

## 1. Prerequisites

- Git.
- Node.js 20 LTS or newer compatible with the repository.
- pnpm or npm according to the repository lockfile.
- Python 3.11 or newer.
- A Supabase project for hosted development, or Supabase CLI and Docker Desktop for local development.
- LibreOffice is optional for additional visual workbook inspection.

Check versions:

```powershell
node --version
pnpm --version
python --version
supabase --version
```

## 2. Local installation

```powershell
# Jalankan dari root repository yang sudah di-clone
Set-Location itcc-wisuda-sync
pnpm install
py -3.11 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e "backend[dev]"
Copy-Item .env.example .env.local
```

If the repository uses npm, replace `pnpm install` with `npm install` and use the matching scripts.

## 3. Supabase local setup

```powershell
supabase start
supabase db reset
```

Apply migrations through the repository's documented Supabase workflow. Never paste arbitrary uploaded SQL into the browser.

Create a local development user through the seed script or Supabase dashboard. Do not place real credentials in source control.

## 4. Environment variables

Frontend:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Backend:

```text
SUPABASE_URL=
SUPABASE_JWT_AUDIENCE=authenticated
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STORAGE_BUCKET_SOURCE_FILES=source-files
STORAGE_BUCKET_OUTPUT_FILES=output-files
MAX_UPLOAD_BYTES=52428800
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. It must never use a `NEXT_PUBLIC_` prefix and must never appear in browser code, logs, screenshots, or commits.

## 5. Run locally

Terminal 1:

```powershell
pnpm dev
```

Terminal 2:

```powershell
.venv\Scripts\Activate.ps1
uvicorn backend.app.main:app --reload --port 8000
```

Expected local addresses:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8000
API docs: http://localhost:8000/docs
```

## 6. Development data

Keep real `Daftar Wisudawan.xlsx`, `data_sitasi.xlsx`, and `data_certiport.xlsx` outside Git. Store only synthetic fixtures under `tests/fixtures/`.

Synthetic fixtures must cover:

- all 14 sheet names;
- duplicate SITASI rows per NIM;
- MOS Word, Excel, and PowerPoint;
- MCF AI-900 and SC-900;
- empty Certiport Student / Employee ID;
- name-only ambiguity;
- program codes 31, 32, and an ineligible code;
- Pass, Fail, and Inco.

## 7. Testing strategy

Focused frontend checks:

```powershell
pnpm lint
pnpm typecheck
pnpm test
```

Backend checks:

```powershell
pytest backend/tests -q
```

End-to-end checks:

```powershell
pnpm test:e2e
```

Workbook verification must assert:

- 14 sheet names remain;
- NIM, Nama, Program Studi, and other non-ITCC columns remain unchanged;
- formulas outside the two target columns remain unchanged;
- only the two ITCC columns change;
- output opens successfully;
- MCF is limited to program code 31 and 32.

## 8. Pull request checklist

- [ ] Focused diff.
- [ ] No source workbook or secret added.
- [ ] Migration has RLS policies.
- [ ] API contract updated.
- [ ] Unit tests added for changed business rules.
- [ ] Workbook preservation test passed.
- [ ] Lint and typecheck passed.
- [ ] Relevant UI states verified.
- [ ] Known limitations documented.

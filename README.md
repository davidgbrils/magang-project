# ITCC Wisuda Sync

Monorepo untuk aplikasi sinkronisasi data wisuda ITCC.

## Struktur

- `frontend/` — Next.js App Router, UI operasional, dan test frontend.
- `backend/` — processor/API Python.
- `supabase/` — konfigurasi dan migration database.
- `docs/` — PRD, technical spec, ADR, dan execution plan.

## Menjalankan frontend

```powershell
cd frontend
npm install
npm run dev
```

Verifikasi lokal:

```powershell
npm run typecheck
npm test
npm run build
```

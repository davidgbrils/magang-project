# Task 5 brief — Reference selection dan sync progress

Bangun vertical slice USER dari layar Stitch pemilihan batch referensi dan progres sinkronisasi dengan kontrak backend yang sedang tersedia.

## Kontrak backend tersinkron

Sumber read-only: `C:\Users\LENOVO\Documents\ITCC\magang.worktrees\backend\docs\api\openapi.yaml`, diperiksa 2026-09-15.

- `GET /api/reference-batches/active` mengembalikan batch aktif SITASI dan Certiport.
- `GET /api/reference-batches` punya parameter sourceType/page/pageSize, tetapi schema respons pagination dan field pilihan belum lengkap; jangan tampilkan pilihan fabricated.
- `POST /api/sync-jobs` membutuhkan `graduationUploadId`, `sitasiBatchId`, `certiportBatchId`, mengembalikan `202` dan `SyncJob`.
- `GET /api/sync-jobs/{jobId}` mengembalikan status/progress job.

## Scope dan TDD

- Tulis RED tests di `tests/frontend/sync-run.test.tsx` untuk required selection, active batches, queued/processing progress, terminal failure, dan completed state.
- Tambahkan typed API dan feature components di `features/synchronization/`; gunakan `request` yang sudah ada dan nama endpoint OpenAPI (`sync-jobs`, bukan `sync-runs`).
- Tambahkan route nyata `/user/reference-selection` dan `/user/synchronization/[id]/progress`. Update registry Sidebar hanya untuk route yang benar-benar ada.
- Tampilkan active SITASI/Certiport dari server. Untuk selectable inactive batches, render state khusus “pilihan batch belum tersedia” sampai schema list disahkan; jangan buat ID/nama dummy.
- Start sync hanya setelah tiga ID tersedia dan POST payload tepat. Poll job status dengan interval yang dapat dibatalkan saat unmount; hentikan pada `COMPLETED`/`FAILED` dan expose `aria-live` progress.
- Progress visual tetap reduced-motion-safe; status selalu teks + tone. Sertakan loading, empty, error, retry/cancel yang benar-benar bekerja.

## Verifikasi

Catat RED/GREEN di `task-5-report.md`, buat review diff, jalankan focused/full tests, lint, strict typecheck, production build bila ruang disk memungkinkan, dan `git diff --check`. Commit scoped `feat(frontend): add reference selection sync progress` setelah reviewer approve. Jangan edit backend/OpenAPI atau menambahkan data fixture ke production.

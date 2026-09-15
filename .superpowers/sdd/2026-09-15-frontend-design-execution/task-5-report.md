# Task 5 report — Reference selection dan sync progress

## Hasil

- Menambahkan typed client untuk `GET /api/reference-batches/active`, `POST /api/sync-jobs`, dan `GET /api/sync-jobs/{jobId}`.
- Menambahkan route nyata `/user/reference-selection?uploadId=...` dan `/user/synchronization/{id}/progress`.
- Menampilkan hanya batch aktif yang dikirim server. Batch inactive/list batch belum dirender sebagai pilihan dan diberi state eksplisit `Pilihan batch belum tersedia`.
- POST dikunci sampai `graduationUploadId`, `sitasiBatchId`, dan `certiportBatchId` tersedia, dengan payload persis sesuai OpenAPI.
- Progress memakai polling 1,5 detik yang dibatalkan lewat `AbortController` dan `clearInterval` saat unmount atau tombol `Hentikan pemantauan`. Polling berhenti pada `COMPLETED` atau `FAILED`.
- State loading, error + retry, empty/unavailable, queued/processing, failed, completed, live progress text, dan reduced-motion-safe native `<progress>` tersedia.
- Sidebar registry hanya menambahkan route yang sudah ada.

## TDD dan verifikasi

RED: `npm test -- --run tests/frontend/sync-run.test.tsx` gagal saat feature belum tersedia (`Cannot find module .../features/synchronization`).

GREEN: focused suite lulus 9/9.

- `npm test -- --run tests/frontend/sync-run.test.tsx` — PASS (9/9)
- `npm run typecheck` — PASS
- `npm run lint` — PASS
- `git diff --check` — PASS sebelum commit
- `npm run build` — terblokir `ENOSPC: no space left on device` saat Next.js menulis cache webpack; bukan error compile yang terobservasi.

## Review follow-up

- `ReferenceBatch.isActive` sekarang opsional sesuai schema OpenAPI; active endpoint tetap dipercaya aktif, sementara nilai eksplisit `false` tetap ditolak.
- Retry pada status `FAILED` sekarang berupa button yang mereset state, membatalkan siklus lama, dan memulai GET status ulang melalui polling.
- Regression suite setelah perbaikan: 10/10.

## Batasan kontrak

Endpoint daftar batch inactive tidak digunakan karena schema pagination/field pilihan pada OpenAPI backend belum lengkap. Tidak ada fixture atau ID dummy yang ditambahkan ke production UI.

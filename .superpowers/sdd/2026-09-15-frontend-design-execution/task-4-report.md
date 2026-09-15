# Task 4 Report — USER upload dan validation

## Hasil

- Menambahkan typed API boundary `features/graduation/graduation-api.ts` untuk `POST /api/graduation-uploads` dan `GET /api/graduation-uploads/{uploadId}/validation` sesuai OpenAPI backend.
- Menambahkan `GraduationUploadPanel` dengan native file input, drag-and-drop enhancement, validasi `.xlsx`, ringkasan file, loading/error state, dan tautan hasil validasi.
- Menambahkan `ValidationSummary` dan `FileValidationView` yang hanya merender sheet, row count, kolom, status, dan error dari respons server.
- Menambahkan route nyata `/user/graduation-upload` dan `/user/file-validation`; registry sidebar kini hanya mengaktifkan route upload yang sudah ada.

## Bukti TDD

Focused test `tests/frontend/graduation-upload.test.tsx` mencakup penerimaan/rejection file, error HTTP, status `202 VALIDATING`, ringkasan 14 sheet, dan path validation. Test suite akhir lulus 6/6.

## Verifikasi

- Focused upload/validation: PASS, 6/6
- Full Vitest: PASS (31 test setelah Task 4)
- ESLint: PASS
- TypeScript strict: PASS
- `git diff --check`: PASS
- Production build: PASS pada review fresh; Next routes `/user/file-validation` dan `/user/graduation-upload` terdeteksi.

## Batasan

Kontrak `ValidationReport.sheets[*]` masih longgar di backend OpenAPI, jadi field opsional dipertahankan tanpa client-side workbook parsing. Provider Supabase tetap di-inject melalui auth adapter; tidak ada token atau fixture produksi yang dibuat.

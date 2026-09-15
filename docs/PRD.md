# Product Requirements Document: ITCC Wisuda Sync

**Status:** Baseline v1

## 1. Problem statement

ITCC perlu mengisi data sertifikasi Microsoft pada daftar wisudawan. Proses manual harus membandingkan daftar wisuda, data SITASI, dan hasil Certiport. Satu mahasiswa dapat memiliki banyak riwayat ujian, format nama bisa berbeda, dan data Certiport tidak selalu memiliki NIM. Kondisi ini membuat proses manual lambat dan berisiko salah isi.

## 2. Tujuan

Menyediakan web app internal yang:

- menerima upload data wisuda oleh User;
- menerima upload data SITASI dan Certiport oleh Admin;
- memakai data wisuda sebagai daftar utama;
- memvalidasi status lulus melalui SITASI;
- mencocokkan riwayat MOS dan MCF dari Certiport;
- menandai pencocokan ambigu untuk review;
- menghasilkan workbook baru dengan seluruh 14 sheet dipertahankan;
- hanya mengubah `Sertifikasi MOS (Diisi ITCC)` dan `Title Microsoft (ITCC)`.

## 3. Target user dan persona

### User: Operator wisuda

Memproses daftar wisudawan pada periode tertentu. User membutuhkan alur singkat, preview hasil, dan daftar masalah yang jelas sebelum download.

**Kebutuhan:** upload mudah, hasil dapat ditelusuri, koreksi manual, download output.

### Admin ITCC

Menyiapkan data referensi, mengaktifkan batch, mengatur aturan sertifikasi, dan mengawasi aktivitas sistem.

**Kebutuhan:** validasi import, histori batch, kontrol aturan, user management, audit log.

## 4. Aturan bisnis

### SITASI

- NIM adalah kunci utama.
- Data wisuda adalah daftar mahasiswa utama.
- Mahasiswa valid jika NIM ditemukan di SITASI dan minimal satu record memiliki `Status = LULUS`.
- Record SITASI berulang diperbolehkan karena menyimpan riwayat ujian.

### MOS

```text
Program Name = Microsoft Office Specialist
AND Result = Pass
```

Jika terdapat beberapa MOS lulus, pilih satu credential lulus terbaru berdasarkan `Exam Date`. Format output mengikuti credential, misalnya `MOS (Word 2019 - Lulus)`.

### MCF

```text
Program Name = Microsoft Certified Fundamentals
AND Result = Pass
AND Kode Prodi IN (31, 32)
```

Kode 31 adalah Informatika dan kode 32 adalah Sistem Informasi. Semua credential MCF, termasuk AI-900 dan SC-900, dihitung sebagai MCF.

### Title Microsoft

| Kondisi | Nilai |
|---|---|
| MOS lulus saja | `MOS` |
| MCF lulus, kode 31/32 | `MCF` |
| MOS dan MCF lulus | `MOS & MCF` |
| Tidak ada yang lulus | kosong |
| MCF lulus di luar kode 31/32 | MCF tidak dihitung |

## 5. Fitur utama MVP

### User

- Login dan role-based access.
- Upload XLSX data wisuda dengan drag and drop.
- Validasi seluruh 14 sheet dan kolom NIM/Nama.
- Memilih batch SITASI dan Certiport aktif.
- Menjalankan sinkronisasi.
- Melihat progress dan preview.
- Memfilter hasil berdasarkan status.
- Review pencocokan nama atau data bermasalah.
- Generate dan download Excel output.
- Melihat histori sinkronisasi miliknya.

### Admin

- Upload dan validasi SITASI XLSX/CSV.
- Upload dan validasi Certiport XLSX/CSV, termasuk header pada baris ke-4.
- Menyimpan import sebagai batch baru.
- Mengaktifkan dan mengarsipkan batch.
- Mengelola aturan MOS/MCF.
- Mengelola User dan Admin.
- Melihat audit log.

## 6. Nice-to-have

- Retensi otomatis file lama.
- Import terjadwal.
- Integrasi API SITASI atau Certiport jika tersedia secara resmi.
- Export laporan review terpisah.
- Notifikasi email.
- Dashboard agregat lintas periode.

## 7. Success metrics

Target awal yang diukur pada pilot internal:

- 100% dari 14 sheet dapat dibaca tanpa perubahan nama sheet.
- 100% output yang berhasil dibuat mempertahankan kolom non-ITCC.
- 0 hasil `Fail` atau `Inco` yang masuk sebagai lulus pada test suite.
- 0 MCF dari kode prodi selain 31 dan 32 pada test suite.
- 100% name-only match diberi status review.
- Minimal 95% record yang memiliki NIM valid dapat diproses tanpa koreksi manual pada dataset pilot.
- Operator dapat menyelesaikan satu batch tanpa mengedit workbook secara manual.

Angka pilot harus diukur dari log aplikasi, bukan diisi sebagai klaim pada UI.

## 8. Out of scope

- Mengubah atau menghapus data sumber SITASI/Certiport.
- Mengeksekusi SQL bebas dari browser.
- Integrasi API eksternal pada MVP.
- Verifikasi identitas menggunakan AI atau fuzzy matching otomatis tanpa review.
- Mengubah kolom wisuda selain dua kolom ITCC.
- Mengelola penerbitan sertifikat atau credential Certiport.
- Portal mahasiswa publik.
- Pembayaran, billing, dan multi-tenant organization.

## 9. Acceptance criteria produk

- User dan Admin melihat navigasi sesuai role.
- Admin dapat menyediakan batch SITASI dan Certiport yang tervalidasi.
- User dapat upload workbook wisuda dan melihat daftar 14 sheet.
- Sistem menolak atau menandai file yang kehilangan NIM/Nama.
- Sistem mengelompokkan histori SITASI berdasarkan NIM.
- Sistem hanya menghitung SITASI berstatus `LULUS`.
- Sistem hanya menghitung Certiport berstatus `Pass`.
- MCF hanya berlaku untuk kode prodi 31 dan 32.
- Pencocokan nama tanpa NIM masuk review.
- Output baru mempertahankan semua 14 sheet.
- Hanya dua kolom ITCC yang dapat berubah.
- Setiap record bermasalah memiliki alasan yang dapat dibaca manusia.
- File asli tidak tertimpa.


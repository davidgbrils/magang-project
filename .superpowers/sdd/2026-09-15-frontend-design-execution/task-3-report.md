# Task 3 Report: Role-aware shell and authentication states

## Hasil

- Menambahkan shell reusable dengan sidebar dan topbar yang membedakan role `USER` dan `ADMIN`.
- Menambahkan state auth bertipe `loading`, `authenticated`, `unauthenticated`, `forbidden`, dan `error`.
- Menambahkan boundary auth client-side yang hanya mengenal endpoint terdokumentasi `GET /api/me` dan menerima auth adapter melalui props.
- Login dan sign-out memakai callback adapter eksplisit. Implementasi default tidak menyimpan token dan tidak mengklaim autentikasi berhasil saat provider Supabase belum dipasang.
- Menambahkan mobile menu berlabel, native link navigation, `aria-expanded`, `aria-controls`, `aria-current`, serta target kontrol minimal 44px.
- `app/page.tsx` tidak diubah dan tetap hanya menautkan `/login`.

## Bukti TDD

### RED

Command:

```text
npm test -- tests/frontend/auth-navigation.test.tsx
```

Hasil awal: exit 1. Vitest gagal memuat `../../components/layout/AppShell` karena shell belum ada. Kegagalan sesuai alasan yang dituju oleh test-first: fitur role-aware navigation belum diimplementasikan.

### GREEN

Command:

```text
npm test -- tests/frontend/auth-navigation.test.tsx
```

Hasil akhir: exit 0, 1 file lulus, 5 test lulus. Cakupan perilaku: tujuan USER, tujuan ADMIN, admin exclusion pada forbidden state, role yang terlihat, dan semantik menu mobile/keyboard.

## Verifikasi akhir

| Command | Hasil |
|---|---|
| `npm test -- tests/frontend/auth-navigation.test.tsx` | PASS, 5/5 test |
| `npm test` | PASS, 3 file dan 21/21 test |
| `npm run lint` | PASS, tanpa error atau warning ESLint |
| `npm run typecheck` | PASS, TypeScript strict tanpa error |
| `npm run build` | PASS, Next.js production build selesai dan `/login` ter-prerender |
| `git diff --check` | PASS, tidak ada whitespace error |

Build sempat menangkap dua boundary Next.js dan keduanya diperbaiki: named export yang tidak valid dari `page.tsx`, lalu function prop dari Server Component ke Client Component. Solusi akhirnya menempatkan form injectable di `features/auth/LoginForm.tsx` dan menjadikan page login client entry dengan default export tunggal.

## Design read dan quality gate

- Direction: baseline Stitch yang sudah disetujui, tactile surface `#E0E0E0`, primary `#356AE6`, raised/recessed/pressed depth.
- Dials: ENERGY 2, RHYTHM 2, MOTION 1. Fokus visual berada pada active navigation dan judul route; motion hanya feedback kontrol singkat.
- Hard gate PASS pada source/test: tidak ada gradient, glass, em dash, fabricated metric/testimonial/claim, dead button, token storage, atau service-role secret.
- Accessibility PASS pada struktur otomatis: label input, live error, native links/buttons, menu label, expanded state, active-page state, visible global focus ring, dan 44px control minimum.
- Responsive PASS pada source: menu mobile terpisah dari sidebar desktop, breakpoint tablet/desktop berbasis reflow, `minmax(0, 1fr)`, serta tidak ada fixed bottom navigation yang menutupi konten.

Browser click-through dan visual comparison lintas viewport belum dijalankan karena Task 3 tidak menyediakan Playwright/browser harness; pemeriksaan visual penuh tetap menjadi gate Task 9. Karena route feature Task 4-8 belum dibuat, link shell mengikuti exact route map Task 3 tetapi halaman tujuan akan tersedia pada task berikutnya.

## Batas integrasi auth

Kontrak SDK Supabase browser belum tersedia pada dependency atau dokumen saat Task 3. Karena itu callback default login dan sign-out mengembalikan error konfigurasi yang terlihat, bukan membuat identitas/token palsu. Integrator berikutnya perlu menginjeksi adapter Supabase yang mengambil access token pada saat request, memanggil `GET /api/me`, dan menjalankan sign-out provider tanpa menyimpan token di local storage buatan sendiri.

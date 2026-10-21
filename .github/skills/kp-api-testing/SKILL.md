---
name: kp-api-testing
description: "Gunakan saat menambah, memperbaiki, atau memverifikasi test untuk route API, schema validation, authentication, authorization, pagination, error response, health check, dan kontrak backend KP."
argument-hint: "Sebutkan endpoint, domain, atau skenario API yang akan diuji."
user-invocable: true
---

# KP API Testing

Skill ini menjaga pengujian backend KP tetap fokus pada kontrak HTTP dan aturan
domain, bukan pada detail implementasi Prisma yang tidak perlu diekspos.

## Referensi wajib

1. Baca [`arsitektur.md`](../../../docs/arsitektur.md).
2. Baca [`backend.md`](../../../docs/backend.md).
3. Periksa pola test yang ada di [`tests/`](../../../tests/).
4. Periksa route dan schema domain yang sedang diuji.

## Prosedur

1. Tentukan kontrak endpoint: method, path, input, role, status, dan envelope.
2. Buat test untuk happy path terlebih dahulu.
3. Tambahkan test input invalid untuk field wajib, enum, angka, tanggal, dan id.
4. Tambahkan test authentication dan authorization sesuai role.
5. Tambahkan test not found, conflict, dan error domain bila relevan.
6. Untuk list, uji pagination default, batas maksimum, filter, dan metadata.
7. Pastikan error memiliki `code` dan `message`; pertahankan `requestId` jika
   tersedia.
8. Mock service/repository bila menguji route boundary; jangan membuat test
   bergantung pada database sungguhan jika pola suite tidak memerlukannya.
9. Jalankan test terarah, lalu seluruh suite.
10. Jalankan type-check dan lint setelah perubahan test atau implementasi.

## Skenario minimum endpoint

### Endpoint publik atau health

- status normal;
- konfigurasi tidak tersedia;
- dependency database tidak siap.

### Endpoint terproteksi

- tidak ada session;
- session valid dengan role yang benar;
- session valid dengan role yang salah;
- input valid;
- input tidak valid;
- resource tidak ditemukan.

### Endpoint mutasi

- body bukan JSON;
- origin mutasi tidak sesuai;
- response `201` untuk create/action yang membuat resource;
- data tidak berubah ketika validasi gagal.

## Aturan implementasi test

- Gunakan assertion terhadap status HTTP dan bentuk response.
- Jangan hanya menguji `status === 200`; uji field `data`, `meta`, atau `error`.
- Jangan menghapus test existing untuk membuat suite lulus.
- Jangan menelan exception dengan catch kosong.
- Gunakan fixture kecil dan deterministik.
- Isolasi state antar-test.
- Jika bug ditemukan, tambahkan regression test sebelum memperbaiki bug.

## Perintah validasi

```bash
# Test terarah
npx vitest run tests/api-routes.test.ts

# Semua test
npm test

# Validasi tipe dan lint
npx tsc --noEmit
npm run lint
```

## Checklist selesai

- [ ] Happy path diuji.
- [ ] Validation error diuji.
- [ ] Authentication/authorization diuji.
- [ ] Not found/conflict diuji bila relevan.
- [ ] Pagination dan envelope diuji bila relevan.
- [ ] Regression test ditambahkan untuk bug.
- [ ] Test terarah dan suite penuh berhasil.

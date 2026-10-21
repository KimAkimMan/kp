# Instruksi Pengembangan Backend

Dokumen ini digunakan saat menambah atau mengubah backend modular. Ikuti
urutan dan batas tanggung jawab berikut agar arsitektur tetap konsisten dengan
[`arsitektur.md`](./arsitektur.md).

## 1. Pilih domain

Sebelum membuat file, tentukan domain bisnis (`programs`, `surveys`, `advice`,
dan seterusnya). Jangan menaruh aturan domain baru di `page.tsx`, komponen UI,
atau route domain lain.

Struktur minimum domain:

```text
modules/<domain>/
  <domain>.schema.ts
  <domain>.service.ts
  <domain>.repository.ts
  <domain>.types.ts
app/api/<domain>/
  route.ts
  [id]/route.ts
```

## 2. Buat tipe dan schema input

- Definisikan tipe input di `<domain>.types.ts`.
- Gunakan helper dari `lib/validation.ts`.
- Tolak input tidak valid dengan `ApiError("VALIDATION_ERROR", ..., 400)`.
- Validasi enum secara eksplisit.
- Validasi tanggal, angka positif/non-negatif, dan field wajib di boundary.
- Untuk PATCH, tolak payload kosong.

Schema parser hanya memvalidasi dan membentuk input. Ia tidak boleh memanggil
Prisma atau melakukan side effect.

## 3. Implementasikan repository

Repository adalah lapisan yang boleh mengakses `prisma` dari `lib/prisma.ts`.

- Gunakan query Prisma terparameterisasi; jangan membangun SQL dari string input.
- Letakkan filter database dan `include/select` di repository.
- Gunakan soft delete bila model memiliki `deletedAt`.
- Kembalikan data yang diperlukan service, bukan response HTTP.
- Untuk list, kembalikan `{ items, total }` agar route dapat membentuk metadata.

## 4. Implementasikan service

Service berisi aturan bisnis dan orkestrasi repository.

- Cek resource dengan method `get` sebelum update/delete jika diperlukan.
- Lempar `ApiError` untuk kondisi bisnis seperti not found atau forbidden.
- Jangan mengimpor `NextRequest`, `NextResponse`, `cookies`, atau `headers` ke
  service.
- Jangan mengembalikan `NextResponse` dari service.
- Gunakan transaction bila beberapa perubahan database harus atomik.

## 5. Buat route handler tipis

Route handler harus mengikuti pola:

```ts
return handleRoute(async () => {
  const user = await requireUser();
  const input = parseCreateInput(await parseRequestBody(request));
  return successResponse(await domainService.create(input), 201);
});
```

Gunakan:

- `handleRoute` untuk error response dan `x-request-id`.
- `requireUser`/`requireRole` untuk authorization.
- `parseRequestBody` untuk JSON.
- `parsePagination` untuk endpoint list.
- `successResponse` atau `paginatedResponse` untuk response.
- `parsePositiveId` untuk id numerik.

Route handler tidak boleh menggandakan aturan bisnis service atau mengakses
Prisma secara langsung.

## 6. Endpoint dan status

Gunakan konvensi berikut:

| Operasi | Method | Response |
|---|---:|---|
| List | `GET /api/<domain>` | `200`, paginated bila list |
| Create | `POST /api/<domain>` | `201` |
| Detail | `GET /api/<domain>/:id` | `200` |
| Update | `PATCH /api/<domain>/:id` | `200` |
| Delete | `DELETE /api/<domain>/:id` | `200` |
| Action | `POST /api/<domain>/:id/<action>` | `200`/`201` |

Tambahkan endpoint action hanya jika operasi tersebut memang merupakan
transisi bisnis yang jelas, seperti `claim`, `complete`, `verify`, atau
`convert`.

## 7. Database dan konfigurasi

1. Ubah `prisma/schema.prisma`.
2. Buat migration bernama deskriptif.
3. Jalankan generate client.
4. Perbarui repository dan seed bila perlu.
5. Jangan memasukkan nilai secret ke migration, seed, atau source code.

Konfigurasi runtime wajib mencakup `DATABASE_*`, `JWT_SECRET`, dan
`APP_ORIGIN`. Endpoint `/api/health` memeriksa proses; `/api/ready` memeriksa
konfigurasi dan konektivitas database.

## 8. Dokumentasi dan pengujian

Setiap endpoint baru wajib:

- ditambahkan ke `lib/openapi.ts`;
- memiliki test route atau schema yang relevan;
- memakai envelope response standar;
- mendokumentasikan role yang dibutuhkan;
- memiliki client counterpart bila akan dipakai frontend.

Perintah validasi:

```bash
npm test
npx tsc --noEmit
npm run lint
```

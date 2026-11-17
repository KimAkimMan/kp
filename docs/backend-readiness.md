# Kesiapan Backend sebelum Migrasi Frontend

Status pemeriksaan: 13 November 2026. Dokumen ini adalah baseline migrasi dari
`app/page.tsx` yang masih monolitik dan memakai mock/localStorage ke frontend
yang hanya memakai API.

## Keputusan arsitektur

Backend telah dipisahkan secara logis tanpa harus langsung dipindahkan ke repo
atau server lain:

```text
frontend -> modules/<domain>/*.client.ts -> /api route handler
         -> service -> repository -> Prisma/MariaDB
```

Kontrak HTTP memakai `{ data }`, pagination memakai `{ data, meta }`, dan
error memakai `{ error: { code, message, requestId? } }`. Jangan beri
komponen React akses langsung ke Prisma, service, repository, atau data mock.

Untuk deploy berbeda domain, frontend memakai `NEXT_PUBLIC_API_URL`; backend
menerima cookie session atau `Authorization: Bearer <token>`. `APP_ORIGIN`
harus berisi origin frontend yang sah untuk CORS dan pemeriksaan CSRF.

## Peta alur page lama ke API

| Alur di `page.tsx` | Endpoint backend | Status |
| --- | --- | --- |
| Login/logout dan pemulihan sesi | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Siap |
| Dashboard dan laporan | `GET /reports/summary`, `GET /programs`, `GET /surveys`, `GET /advice` | Siap, pagination wajib dipakai |
| Kelola pengguna admin | `GET/POST /users`, `GET/PATCH/DELETE /users/{id}` | Siap |
| Master kegiatan | `GET/POST /programs`, `GET/PATCH/DELETE /programs/{id}` | Siap |
| Operator mengambil/ditugaskan kegiatan | `POST /programs/{id}/claim`, `GET/POST /programs/{id}/assignments`, `POST/PATCH/DELETE /programs/{id}/assignments/{assignmentId}` | Siap |
| Jadwal/target kegiatan | `PATCH /programs/{id}` | Siap |
| Progres dan penyelesaian | `GET/POST /programs/{id}/progress`, `PATCH /progress/{progressId}/verify`, `POST /programs/{id}/complete`, `GET /programs/{id}/history` | Siap |
| Biaya dan bukti dokumen | `GET/POST /programs/{id}/costs`, `PATCH /costs/{costId}`, `GET/POST /costs/{costId}`, `DELETE /costs/{costId}/documents/{documentId}` | Siap |
| Survey lapangan | `GET/POST /surveys`, `GET/PATCH/DELETE /surveys/{id}`, verifikasi/konversi/foto/review/link/status history | Siap |
| Arahan pimpinan dan balasan | `GET/POST /advice`, `GET/PATCH/DELETE /advice/{id}`, endpoints `replies` | Siap |

Catatan: ID `ProgramCostDocument` dan `SurveyPhoto` adalah string CUID, bukan
integer. Frontend tidak boleh mengubahnya menjadi angka.

## Gap yang harus ditutup sebelum layar terkait dibuat

1. **Landing publik.** Selesai melalui `GET /public/programs`; endpoint ini
   hanya mengembalikan DTO publik dan tidak membuka data operator/biaya.
2. **Master data.** Selesai melalui domain `reference-data`: kategori, satuan,
   periode aktif, kecamatan, serta desa/kelurahan berdasarkan kecamatan.
3. **Client API.** Selesai: client program, survey, dan advice telah mencakup
   endpoint lanjutan. Komponen tetap dilarang memanggil path langsung.
4. **Filter list.** Program sudah mendukung `status`, `operatorId`,
   `kecamatan`, dan `search`. Survey, advice, dan user saat ini hanya
   pagination. Tambahkan filter server-side yang diperlukan oleh tabel UI
   (minimal status, pencarian, dan rentang tanggal) sebelum datanya besar.
5. **Profil dan kredensial.** Selesai melalui `PATCH /auth/profile`,
   `POST /auth/change-password`, dan reset password oleh admin di
   `POST /users/{id}/reset-password`. Reset mandiri melalui email tidak dibuat
   karena membutuhkan provider email di luar scope backend ini.
6. **Audit operasional.** Schema `AuditLog` tersedia, tetapi pencatatan belum
   mencakup semua mutasi penting. Tentukan event minimum: login, perubahan
   program, assignment, verifikasi progres/biaya/survey, upload, dan delete.

## Urutan migrasi frontend yang aman

1. Buat endpoint master data dan client method yang disebutkan di atas.
2. Ganti login dengan `authApi`, lalu bootstrap pengguna lewat `authApi.me`.
3. Migrasikan daftar program dan detail program; hapus `initialPrograms` serta
   localStorage program hanya setelah alur CRUD/progres tervalidasi.
4. Migrasikan survey dan upload foto, lalu biaya/dokumen dan assignment.
5. Migrasikan advice, dashboard, dan laporan terakhir karena semuanya membaca
   data lintas domain.

Pada setiap layar, tangani loading, error `ApiClientError`, empty state,
pagination, refresh setelah mutasi, serta penolakan role dari backend.

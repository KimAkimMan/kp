# Dokumentasi Pengujian API

Dokumen ini digunakan untuk menguji backend API menggunakan Thunder Client.

## 1. Menjalankan Backend

Dari root project jalankan:

```bash
npm run dev
```

Base URL:

```text
http://localhost:3000/api
```

Application health:

```http
GET http://localhost:3000/api/health
```

Database/configuration readiness:

```http
GET http://localhost:3000/api/ready
```

Kedua endpoint tersebut tidak membutuhkan login. Response sukses `health` berisi
`status: "ok"`, sedangkan `ready` berisi `status: "ready"` dan
`database: "up"`. Semua response API menyertakan header `x-request-id`.
Response error juga menyertakan nilai yang sama pada `error.requestId`.

Untuk request dengan body JSON, gunakan header:

```http
Content-Type: application/json
```

Endpoint mutasi yang dikirim dari browser juga dapat membutuhkan:

```http
Origin: http://localhost:3000
```

## 2. Database Seed

Jika database masih kosong atau ingin mengulang seed:

```bash
npm run db:seed
```

Seed bersifat idempotent dan membuat data berikut:

| Data | Nilai |
|---|---|
| Admin email | `admin@kp.local` |
| Operator email | `operator@kp.local` |
| Pimpinan email | `pimpinan@kp.local` |
| Password semua akun | `Password123!` |
| Program seed | ID `1`, kode `SEED-P-001` |
| Survey seed | ID `seed-survey-001` |
| Advice seed | ID `seed-advice-001` |

Credential seed hanya untuk development. Jangan gunakan di production.

## 3. Authentication dan Cookie JWT

### Login

```http
POST http://localhost:3000/api/auth/login
```

Body:

```json
{
  "email": "admin@kp.local",
  "password": "Password123!"
}
```

Login operator:

```json
{
  "email": "operator@kp.local",
  "password": "Password123!"
}
```

Login pimpinan:

```json
{
  "email": "pimpinan@kp.local",
  "password": "Password123!"
}
```

Response sukses mengandung `data.accessToken` dan response cookie `kp_session`.
Pastikan Thunder Client menyimpan cookie tersebut. Jika tidak tersimpan otomatis,
tambahkan header berikut pada endpoint protected:

```http
Cookie: kp_session=TOKEN_DARI_RESPONSE_LOGIN
```

### Skenario Login Error

Payload kosong:

```json
{}
```

Credential salah:

```json
{
  "email": "admin@kp.local",
  "password": "PasswordSalah123!"
}
```

Email tidak valid:

```json
{
  "email": "email-tidak-valid",
  "password": "Password123!"
}
```

Ekspektasi:

| Skenario | Status |
|---|---:|
| Payload valid | `200` |
| Payload kosong/tidak valid | `400` |
| Credential salah | `401` |
| Terlalu banyak login gagal | `429` |

### User Aktif

```http
GET http://localhost:3000/api/auth/me
```

### Logout

```http
POST http://localhost:3000/api/auth/logout
```

Kedua endpoint tidak membutuhkan body. Setelah logout, endpoint protected harus
menghasilkan `401`.

## 4. Aturan Umum Authorization

| Kondisi | Status |
|---|---:|
| Tidak ada cookie | `401 Unauthorized` |
| Cookie invalid/expired/revoked | `401 Unauthorized` |
| Role tidak memiliki akses | `403 Forbidden` |
| Payload tidak lengkap | `400 Bad Request` |
| Resource tidak ditemukan | `404 Not Found` |
| Conflict data atau state bisnis tidak sesuai | `409 Conflict` |
| Request berhasil membuat data | `201 Created` |
| Request berhasil membaca/mengubah/menghapus data | `200 OK` |

## 5. Pagination Global

Endpoint list mendukung:

```text
?page=1&pageSize=25
```

Aturan:

- Default `page`: `1`
- Default `pageSize`: `25`
- Maksimum `pageSize`: `100`

Contoh response list:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "skip": 0,
    "total": 0,
    "totalPages": 0
  }
}
```

## 6. Users API

### List Users

```http
GET http://localhost:3000/api/users?page=1&pageSize=25
```

Role: Admin.

### Create User

```http
POST http://localhost:3000/api/users
```

Body:

```json
{
  "nama": "Operator Baru",
  "email": "operator.baru@kp.local",
  "role": "Operator",
  "password": "Password123!"
}
```

Role yang valid: `Admin`, `Operator`, `Pimpinan`.

Payload invalid:

```json
{
  "nama": "User Tidak Lengkap",
  "email": "user@kp.local"
}
```

```json
{
  "nama": "Role Salah",
  "email": "role.salah@kp.local",
  "role": "SUPERADMIN",
  "password": "Password123!"
}
```

### Detail User

```http
GET http://localhost:3000/api/users/2
```

### Update User

```http
PATCH http://localhost:3000/api/users/2
```

Body:

```json
{
  "nama": "Operator KP Updated",
  "email": "operator.updated@kp.local"
}
```

Update password:

```json
{
  "password": "PasswordBaru123!"
}
```

### Delete User

```http
DELETE http://localhost:3000/api/users/2
```

Tidak membutuhkan body. Role: Admin.

## 7. Programs API

### List Programs

```http
GET http://localhost:3000/api/programs?page=1&pageSize=25
```

Dengan filter:

```http
GET http://localhost:3000/api/programs?status=SEDANG_DIKERJAKAN
GET http://localhost:3000/api/programs?search=Jalan
GET http://localhost:3000/api/programs?kecamatan=Kuningan
GET http://localhost:3000/api/programs?operatorId=2
```

### Create Program

```http
POST http://localhost:3000/api/programs
```

Body minimal:

```json
{
  "kode": "TEST-P-001",
  "nama": "Pembangunan Jalan Test",
  "kategori": "Infrastruktur Jalan",
  "lokasi": "Desa Test, Kecamatan Kuningan",
  "pj": "Operator KP",
  "periode": "2026",
  "satuan": "KM",
  "target": 5,
  "pagu": 500000000
}
```

Body lengkap:

```json
{
  "kode": "TEST-P-002",
  "nama": "Rehabilitasi Jalan Desa",
  "namaKegiatan": "Rehabilitasi Jalan Desa Test",
  "kategori": "Infrastruktur Jalan",
  "lokasi": "Desa Cisantana",
  "kecamatan": "Kuningan",
  "desaKelurahan": "Cisantana",
  "detailLokasi": "Ruas jalan utama desa",
  "pj": "Operator KP",
  "operatorPengelola": "Operator KP",
  "operatorPengelolaId": 2,
  "penanggungJawabDinas": "Admin KP",
  "periode": "2026",
  "jadwal": "Januari - Desember 2026",
  "satuan": "KM",
  "targetAwal": 10,
  "target": 10,
  "targetVolume": 10,
  "realisasi": 0,
  "realisasiVolume": 0,
  "status": "BELUM_DIKERJAKAN",
  "update": "Belum dimulai",
  "sumber": "APBD",
  "catatan": "Program untuk pengujian API",
  "pagu": 1000000000,
  "penggunaan": 0
}
```

Payload invalid:

```json
{}
```

```json
{
  "kode": "TEST-P-003",
  "nama": "Program Tidak Lengkap"
}
```

### Detail Program

```http
GET http://localhost:3000/api/programs/1
```

### Update Program

```http
PATCH http://localhost:3000/api/programs/1
```

Body:

```json
{
  "nama": "Peningkatan Jalan Desa Seed Updated",
  "status": "SEDANG_DIKERJAKAN",
  "realisasi": 3
}
```

Status valid:

- `BELUM_DIKERJAKAN`
- `SEDANG_DIKERJAKAN`
- `SELESAI_DIKERJAKAN`

### Claim Program

Role: Operator atau Admin.

```http
POST http://localhost:3000/api/programs/1/claim
```

Tidak membutuhkan body.

### Tambah Progress

Role: Operator pemilik program atau Admin.

```http
POST http://localhost:3000/api/programs/1/progress
```

Body:

```json
{
  "tanggal": "2026-03-01",
  "tahap": "Pelaksanaan tahap pertama",
  "nilai": 3,
  "satuan": "KM",
  "keterangan": "Pengerjaan badan jalan selesai sebagian.",
  "foto": true,
  "status": "SEDANG_DIKERJAKAN"
}
```

### Tambah Cost

Role: Operator pemilik program atau Admin.

```http
POST http://localhost:3000/api/programs/1/costs
```

Body:

```json
{
  "tanggal": "2026-03-05",
  "uraian": "Pembelian material konstruksi",
  "nominal": 75000000,
  "bukti": true
}
```

### Complete Program

Role: Operator pemilik program atau Admin.

```http
POST http://localhost:3000/api/programs/1/complete
```

Body:

```json
{
  "foto": "true"
}
```

Nilai `foto` yang valid adalah string `"true"` atau `"false"`.

### Soft Delete Program

Role: Admin.

```http
DELETE http://localhost:3000/api/programs/1
```

Tidak membutuhkan body. Program di-soft-delete dan tidak muncul pada list normal.
Untuk pengujian, gunakan program hasil create agar program seed tetap tersedia.

## 8. Surveys API

### List Surveys

```http
GET http://localhost:3000/api/surveys?page=1&pageSize=25
```

### Create Survey

```http
POST http://localhost:3000/api/surveys
```

Body:

```json
{
  "kodeSurvey": "TEST-S-001",
  "tanggal": "2026-03-10",
  "surveyor": "Operator KP",
  "surveyorId": 2,
  "namaKegiatan": "Survey Jalan Test",
  "kategori": "Infrastruktur Jalan",
  "kecamatan": "Kuningan",
  "desaKelurahan": "Cisantana",
  "detailLokasi": "Ruas jalan desa sisi utara",
  "koordinat": "-6.9821,108.4832",
  "kondisi": "RUSAK_RINGAN",
  "panjang": 2,
  "lebar": 4,
  "luasVolume": 8,
  "satuan": "KM",
  "tipeKonstruksi": "Aspal",
  "estimasiBiaya": 250000000,
  "tingkatUrgensi": "SEDANG",
  "uraianTemuan": "Permukaan jalan mengalami kerusakan ringan.",
  "rekomendasi": "Perlu dilakukan pemeliharaan berkala.",
  "kontakPendamping": "081234567890",
  "foto": false,
  "status": "DRAFT"
}
```

Payload invalid:

```json
{}
```

```json
{
  "kodeSurvey": "TEST-S-002",
  "tanggal": "2026-03-10",
  "surveyor": "Operator KP",
  "namaKegiatan": "Survey Test",
  "kategori": "Infrastruktur Jalan",
  "kecamatan": "Kuningan",
  "desaKelurahan": "Cisantana",
  "detailLokasi": "Ruas jalan desa",
  "kondisi": "KONDISI_SALAH",
  "tingkatUrgensi": "SEDANG",
  "uraianTemuan": "Temuan survey",
  "rekomendasi": "Rekomendasi",
  "status": "DRAFT"
}
```

### Detail Survey

```http
GET http://localhost:3000/api/surveys/seed-survey-001
```

### Update Survey

```http
PATCH http://localhost:3000/api/surveys/seed-survey-001
```

Body:

```json
{
  "status": "SELESAI_SURVEY",
  "uraianTemuan": "Hasil survey sudah diperbarui.",
  "rekomendasi": "Segera masukkan ke daftar prioritas."
}
```

### Verify Survey

Role: Admin.

```http
POST http://localhost:3000/api/surveys/seed-survey-001/verify
```

Body kosong:

```json
{}
```

Dengan program:

```json
{
  "programId": 1
}
```

### Convert Survey Menjadi Program

Role: Admin. Gunakan survey yang belum pernah dikonversi.

```http
POST http://localhost:3000/api/surveys/seed-survey-001/convert
```

Body:

```json
{
  "kode": "CONVERT-P-001",
  "nama": "Program Hasil Konversi Survey",
  "pj": "Operator KP",
  "periode": "2026",
  "satuan": "KM",
  "target": 3,
  "pagu": 300000000
}
```

### Detail, Update, Delete Survey

```http
GET http://localhost:3000/api/surveys/seed-survey-001
PATCH http://localhost:3000/api/surveys/seed-survey-001
DELETE http://localhost:3000/api/surveys/seed-survey-001
```

Request `PATCH` membutuhkan body JSON, sedangkan `GET` dan `DELETE` tidak.

## 9. Advice API

### List Advice

```http
GET http://localhost:3000/api/advice?page=1&pageSize=25
```

### Create Advice

```http
POST http://localhost:3000/api/advice
```

Body:

```json
{
  "idKegiatan": 1,
  "namaKegiatan": "Peningkatan Jalan Desa Seed",
  "identitasPimpinan": "Pimpinan KP",
  "pimpinanId": 3,
  "operatorPenerima": "Operator KP",
  "operatorId": 2,
  "isi": "Pastikan dokumentasi progres diperbarui setiap tahap."
}
```

Payload invalid:

```json
{
  "idKegiatan": 1,
  "namaKegiatan": "Advice Tidak Lengkap"
}
```

### Detail Advice

```http
GET http://localhost:3000/api/advice/seed-advice-001
```

### Update Advice

```http
PATCH http://localhost:3000/api/advice/seed-advice-001
```

Update status:

```json
{
  "status": "Sudah ditindaklanjuti"
}
```

Update isi:

```json
{
  "isi": "Arahan sudah dilaksanakan dan dokumentasi telah diperbarui."
}
```

### Delete Advice

```http
DELETE http://localhost:3000/api/advice/seed-advice-001
```

Tidak membutuhkan body.

## 10. Reports API

### Summary

```http
GET http://localhost:3000/api/reports/summary
```

Dengan query filter:

```http
GET http://localhost:3000/api/reports/summary?periode=2026
```

Tidak membutuhkan body.

## 11. OpenAPI dan Swagger

OpenAPI JSON:

```http
GET http://localhost:3000/api/openapi
```

Swagger UI:

```text
http://localhost:3000/api/docs
```

## 12. Urutan Smoke Test yang Disarankan

1. Login sebagai Admin.
2. Panggil `GET /api/auth/me`.
3. Panggil `GET /api/users`.
4. Buat program baru dan catat ID-nya.
5. Login sebagai Operator.
6. Claim program baru.
7. Tambahkan progress.
8. Tambahkan cost.
9. Complete program.
10. Login sebagai Admin.
11. Buat survey baru.
12. Verify survey.
13. Convert survey menjadi program.
14. Login sebagai Pimpinan.
15. Buat advice.
16. Update status advice.
17. Panggil report summary.
18. Login sebagai Admin dan soft-delete program hasil create.
19. Panggil list programs dan pastikan program soft-delete tidak muncul.

## 13. Checklist Skenario Error

Untuk setiap endpoint protected, lakukan pengujian berikut:

- Tanpa cookie: harus `401`.
- Cookie invalid: harus `401`.
- Role salah: harus `403`.
- Body `{}` pada endpoint yang membutuhkan input: harus `400`.
- Field wajib dihilangkan: harus `400`.
- Enum/status salah: harus `400`.
- ID tidak ada: harus `404`.
- Data duplikat: harus `409` jika terkena unique constraint.
- `page=0`, `pageSize=0`, atau `pageSize=101`: harus `400`.

## 14. Catatan Thunder Client

Disarankan membuat environment Thunder Client:

```text
baseUrl = http://localhost:3000/api
programId = 1
surveyId = seed-survey-001
adviceId = seed-advice-001
```

Dengan environment tersebut, URL dapat ditulis seperti:

```text
{{baseUrl}}/programs/{{programId}}
```

Setelah membuat data baru, ubah variabel ID sesuai response endpoint create.

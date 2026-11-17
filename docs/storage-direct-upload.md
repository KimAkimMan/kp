# Direct Upload Object Storage

Workflow file private di production:

```text
POST presign -> PUT langsung ke R2 -> POST complete -> simpan metadata DB
GET download -> presigned GET URL -> browser membaca dari R2
```

Binary tidak disimpan di MariaDB. Tabel `SurveyPhoto` dan
`ProgramCostDocument` hanya menyimpan metadata dan `storageKey`.

## Foto survey

1. `POST /api/surveys/{surveyId}/photos/presign`

```json
{
  "originalName": "jalan.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 837896
}
```

2. Browser mengirim `PUT` ke `data.uploadUrl` dengan body binary dan header
   `Content-Type` yang sama dengan `mimeType`.

3. `POST /api/surveys/{surveyId}/photos/complete`:

```json
{
  "storageKey": "surveys/<surveyId>/photos/<generated-key>.jpg",
  "originalName": "jalan.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 837896,
  "caption": "Kondisi jalan"
}
```

Backend melakukan `HEAD` ke R2, mencocokkan ukuran dan MIME type, lalu baru
membuat row `SurveyPhoto`.

## Preview/download

`GET /api/surveys/photos/{photoId}/download` dan
`GET /api/costs/{costId}/documents/{documentId}/download` mengembalikan URL
presigned yang berlaku 15 menit. Endpoint tetap memeriksa autentikasi dan role.

## Konfigurasi lokal

Deployment tidak wajib. Backend lokal dapat membuat presigned URL selama
`STORAGE_PROVIDER=r2`, kredensial R2 valid, dan server memiliki akses internet.
Browser perlu CORS R2 jika melakukan `PUT` langsung dari `localhost:3000`.

Contoh policy development:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Jangan menaruh Access Key atau Secret Access Key di frontend.

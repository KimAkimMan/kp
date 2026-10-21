# Arsitektur Global SIMP Kuningan

Dokumen ini adalah kontrak arsitektur untuk pengembangan backend dan frontend
secara modular. Implementasi baru harus mengikuti batas tanggung jawab,
kontrak API, dan alur data di bawah ini.

## 1. Prinsip utama

1. **Domain-first**: kode dikelompokkan berdasarkan domain bisnis, bukan hanya
   berdasarkan jenis file.
2. **Dependency direction**: route/UI bergantung pada service/client; service
   bergantung pada repository; repository adalah satu-satunya lapisan yang
   mengakses Prisma.
3. **Kontrak API stabil**: frontend tidak mengakses Prisma atau detail internal
   backend. Frontend hanya memakai API client dan DTO.
4. **Validasi di boundary**: input divalidasi ketika masuk melalui route API;
   error domain dikembalikan dalam bentuk terstruktur.
5. **Perubahan terisolasi**: refactor frontend tidak boleh mengubah kontrak
   backend tanpa pembaruan tipe, dokumentasi, dan test yang bersamaan.

## 2. Bentuk sistem

```text
Browser / Frontend
        |
        v
lib/api/* + modules/*/*.client.ts
        |
        v
HTTP API (/api/*)
        |
        v
Next.js Route Handler
        |
        v
Auth context + schema parser + route-handler
        |
        v
Domain service
        |
        v
Domain repository
        |
        v
Prisma 7 adapter -> MariaDB
```

Saat backend dipisah ke deployment berbeda, hanya koneksi HTTP dan konfigurasi
`NEXT_PUBLIC_API_URL` yang berubah. Kontrak endpoint, envelope response, DTO,
dan client per domain tetap menjadi batas komunikasi.

## 3. Struktur folder

```text
app/
  api/<domain>/                 # route handler HTTP
  components/                   # komponen UI dan view
  page.tsx                      # entry UI lama; jangan diubah saat scaffolding
lib/
  api/                          # HTTP client, DTO, public API entry point
  http/                         # response, request, route error handling
  validation.ts                 # primitive validation
  prisma.ts                     # Prisma client dan adapter
modules/
  <domain>/
    *.client.ts                 # adapter pemanggilan API dari frontend
    *.schema.ts                 # validasi input backend
    *.service.ts                # aturan bisnis
    *.repository.ts             # akses database
    *.types.ts                  # tipe domain
docs/                           # dokumentasi arsitektur dan instruksi kerja
.github/skills/                 # skill Copilot workspace
prisma/                         # schema dan migration database
tests/                          # test route, schema, auth, dan health
```

Domain yang sudah tersedia adalah `auth`, `users`, `programs`, `surveys`,
`advice`, `reports`, dan `system`.

## 4. Kontrak HTTP

### Response sukses

```ts
type ApiResponse<T> = { data: T };
type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    skip: number;
    total: number;
    totalPages: number;
  };
};
```

### Response error

```ts
{
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  }
}
```

Frontend harus menangani `ApiClientError`, bukan membaca response mentah.
Pagination menggunakan `page` dan `pageSize`, dengan `pageSize` maksimum 100.

## 5. Authentication dan keamanan

- Session browser menggunakan cookie HTTP-only `kp_session`.
- Client frontend mengirim cookie melalui `credentials: "include"`.
- Integrasi backend terpisah dapat menggunakan `ApiClient({ accessToken })`.
- Endpoint mutasi memeriksa `Origin` melalui `proxy.ts`.
- `JWT_SECRET` minimal 32 karakter.
- Jangan menaruh secret database atau JWT di kode frontend atau variable
  `NEXT_PUBLIC_*`.
- `requestId` harus dipertahankan pada logging dan pelaporan error.

## 6. Aturan perubahan

### Menambah endpoint backend

1. Tambahkan atau ubah `schema.ts`.
2. Tambahkan method di `service.ts`.
3. Tambahkan akses di `repository.ts` bila diperlukan.
4. Buat route handler tipis di `app/api`.
5. Daftarkan kontrak OpenAPI.
6. Tambahkan atau perbarui route/schema test.
7. Tambahkan method client dan tipe DTO di frontend.
8. Perbarui dokumen domain yang relevan.

### Menambah fitur frontend

1. Gunakan client dari `lib/api`, jangan memanggil `fetch` langsung dari view.
2. Letakkan tipe request/response di `lib/api/types.ts` atau tipe domain
   terkait.
3. Tangani loading, empty state, `ApiClientError`, dan retry sesuai kebutuhan.
4. Jangan mengubah `page.tsx` ketika tugas hanya menyiapkan scaffolding.
5. Pertahankan mapping enum backend (`ADMIN`, `DRAFT`, dan seterusnya) di
   boundary client/UI, bukan di repository.

## 7. Referensi kerja

- Instruksi backend: [`backend.md`](./backend.md)
- Instruksi frontend: [`frontend.md`](./frontend.md)
- Skill arsitektur: [`../.github/skills/kp-architecture/SKILL.md`](../.github/skills/kp-architecture/SKILL.md)
- Scaffold API client: [`API_CLIENT.md`](./API_CLIENT.md)

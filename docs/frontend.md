# Instruksi Pengembangan Frontend

Dokumen ini mengatur cara membangun frontend di atas backend modular. Ikuti
kontrak global pada [`arsitektur.md`](./arsitektur.md).

## 1. Sumber data

Gunakan public entry point berikut:

```ts
import {
  adviceApi,
  authApi,
  programApi,
  reportApi,
  surveyApi,
  systemApi,
  userApi,
} from "@/lib/api";
```

Jangan memanggil `fetch` langsung dari view untuk endpoint internal. Jangan
mengakses Prisma, repository, atau service backend dari komponen client.

Contoh:

```ts
const result = await programApi.list({ page: 1, pageSize: 25 });
const programs = result.data;
const totalPages = result.meta.totalPages;
```

## 2. Pemisahan tanggung jawab

```text
View / component
  -> state loading/error/empty
  -> modules/<domain>/*.client.ts
  -> lib/api/client.ts
  -> HTTP API
```

- View mengatur presentasi dan state UI.
- Client domain mengatur endpoint dan DTO.
- `ApiClient` mengatur transport, cookie/token, query, JSON, dan error.
- Backend mengatur authorization, validasi, aturan bisnis, dan database.

Jangan memindahkan aturan authorization ke frontend. UI boleh menyembunyikan
aksi yang tidak relevan, tetapi backend tetap wajib menolak akses yang tidak
diizinkan.

## 3. Authentication

Browser memakai session cookie:

```ts
await authApi.login({ email, password });
const currentUser = await authApi.me();
await authApi.logout();
```

`ApiClient` sudah menggunakan `credentials: "include"`. Jangan menyimpan
`kp_session` secara manual di `localStorage` atau membaca cookie HTTP-only dari
JavaScript.

Untuk deployment backend terpisah:

```env
NEXT_PUBLIC_API_URL=https://api.example.test/api
```

Jika memakai token di luar cookie, buat instance terisolasi:

```ts
import { ApiClient } from "@/lib/api";

const remoteApi = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  accessToken,
});
```

Jangan menaruh secret server pada `NEXT_PUBLIC_*`.

## 4. Loading, error, dan response

Selalu sediakan state berikut untuk operasi async:

- loading;
- error;
- empty state;
- success state;
- retry atau aksi pemulihan bila relevan.

Tangani error terstruktur:

```ts
import { ApiClientError } from "@/lib/api";

try {
  await programApi.update(id, input);
} catch (error) {
  if (error instanceof ApiClientError) {
    showError(error.message, error.code, error.requestId);
  } else {
    showError("Terjadi kesalahan yang tidak diketahui.");
  }
}
```

Jangan menampilkan `details` mentah kepada pengguna jika berisi informasi
internal. `requestId` dapat ditampilkan untuk membantu support.

## 5. Pagination dan filter

List API memakai `page` dan `pageSize`:

```ts
const result = await surveyApi.list({
  page: currentPage,
  pageSize: 25,
});
```

Pertahankan filter sebagai state UI, lalu kirim hanya nilai yang dipilih.
Jangan mengandalkan filtering lokal sebagai pengganti filter backend untuk
dataset besar.

## 6. Mapping domain dan enum

Backend memakai enum machine-readable seperti `BELUM_DIKERJAKAN`, `DRAFT`,
dan `ADMIN`. Frontend boleh menampilkan label Indonesia melalui mapping
presentasi, tetapi value yang dikirim ke API harus tetap mengikuti kontrak
backend.

```ts
const programStatusLabel = {
  BELUM_DIKERJAKAN: "Belum Dikerjakan",
  SEDANG_DIKERJAKAN: "Sedang Dikerjakan",
  SELESAI_DIKERJAKAN: "Selesai Dikerjakan",
} as const;
```

## 7. Refactor `page.tsx`

Saat migrasi frontend lama:

1. Jangan menghapus data mock sebelum API client siap.
2. Migrasikan satu domain/view pada satu waktu.
3. Pindahkan pemanggilan data ke hook atau adapter UI khusus bila kebutuhan
   state mulai kompleks.
4. Pertahankan bentuk props komponen selama memungkinkan.
5. Verifikasi role, loading, error, empty state, pagination, dan refresh.
6. Hapus mock hanya setelah endpoint dan test manual tervalidasi.

Scaffolding API saat ini sengaja tidak mengubah [`../app/page.tsx`](../app/page.tsx).

## 8. Validasi frontend

Sebelum merge:

```bash
npx tsc --noEmit
npm run lint
npm test
```

Uji juga secara manual:

- login/logout dan session expired;
- forbidden response untuk role yang salah;
- list kosong dan pagination;
- error validasi form;
- koneksi backend gagal;
- URL API lokal dan URL backend terpisah.

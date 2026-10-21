# Frontend API client scaffold

Scaffold ini menyiapkan pemanggilan backend untuk refactor frontend berikutnya
tanpa mengubah `app/page.tsx` atau komponen yang sedang dipakai.

## Struktur

- `lib/api/client.ts`: HTTP client generik, serialisasi query/body, cookie session,
  dan normalisasi error API.
- `lib/api/types.ts`: DTO frontend yang mengikuti kontrak route API.
- `modules/*/*.client.ts`: client per domain (`auth`, `users`, `programs`,
  `surveys`, `advice`, `reports`, dan `system`).
- `lib/api/index.ts`: entry point publik untuk import dari UI.

## Contoh penggunaan

```ts
import { programApi } from "@/lib/api";

const response = await programApi.list({ page: 1, pageSize: 25 });
const programs = response.data;
```

Session browser otomatis dikirim melalui `credentials: "include"`. Untuk backend
terpisah, set `NEXT_PUBLIC_API_URL` ke base URL yang sudah memuat prefix API,
misalnya `https://api.example.test/api`. Client juga menerima `accessToken`
melalui `new ApiClient({ baseUrl, accessToken })` untuk kebutuhan integrasi
berikutnya.

Semua method mengembalikan envelope backend (`data` atau `data` + `meta`) dan
melempar `ApiClientError` jika respons bukan 2xx. UI nantinya dapat menangani
`error.code`, `error.status`, `error.details`, dan `error.requestId` tanpa
bergantung pada bentuk respons mentah.

Panduan arsitektur lengkap tersedia di:

- [`arsitektur.md`](./arsitektur.md)
- [`backend.md`](./backend.md)
- [`frontend.md`](./frontend.md)
- [`kp-architecture` skill](../.github/skills/kp-architecture/SKILL.md)

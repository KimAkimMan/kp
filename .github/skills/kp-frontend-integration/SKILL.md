---
name: kp-frontend-integration
description: "Gunakan saat mengintegrasikan frontend KP dengan backend API modular, memigrasikan page.tsx dari mock data, membuat state loading/error/empty, memakai API client, atau menangani authentication dan pagination."
argument-hint: "Sebutkan domain atau view frontend yang akan diintegrasikan."
user-invocable: true
---

# KP Frontend Integration

Skill ini membantu collaborator menghubungkan UI KP ke backend modular tanpa
melanggar kontrak API atau mencampur aturan bisnis ke komponen.

## Referensi wajib

1. Baca [`arsitektur.md`](../../../docs/arsitektur.md).
2. Baca [`frontend.md`](../../../docs/frontend.md).
3. Gunakan API client dari [`lib/api/index.ts`](../../../lib/api/index.ts).
4. Periksa kontrak route di `app/api` dan tipe pada `lib/api/types.ts`.

## Prosedur

1. Identifikasi view dan domain yang akan dimigrasikan.
2. Cari API client domain yang sudah tersedia sebelum membuat `fetch` baru.
3. Cocokkan request, response, enum, role, dan pagination dengan route backend.
4. Pisahkan state UI menjadi loading, error, empty, dan success.
5. Gunakan `ApiClientError` untuk error terstruktur.
6. Pertahankan session cookie dengan `credentials: "include"`.
7. Migrasikan satu alur atau view pada satu waktu.
8. Pertahankan fallback mock hanya selama migrasi belum tervalidasi.
9. Uji role, session expired, response kosong, validasi form, dan backend gagal.
10. Jalankan `npx tsc --noEmit`, `npm run lint`, dan `npm test`.

## Aturan implementasi

- Jangan mengakses Prisma, repository, atau service backend dari frontend.
- Jangan memanggil `fetch` langsung bila client domain sudah tersedia.
- Jangan menyimpan `kp_session` di `localStorage`.
- Jangan menaruh secret pada `NEXT_PUBLIC_*`.
- Jangan mengubah enum backend menjadi string berbeda saat mengirim request.
- Gunakan mapping terpisah untuk label tampilan.
- Jangan menghapus mock data sebelum alur API berhasil diverifikasi.
- Jangan melakukan refactor besar `page.tsx` bersamaan dengan perubahan kontrak
  backend yang belum didokumentasikan.

## Bentuk penggunaan

```ts
import { ApiClientError, programApi } from "@/lib/api";

try {
  const result = await programApi.list({ page: 1, pageSize: 25 });
  setPrograms(result.data);
} catch (error) {
  if (error instanceof ApiClientError) {
    setError(error.message);
  } else {
    setError("Terjadi kesalahan yang tidak diketahui.");
  }
}
```

## Checklist selesai

- [ ] View memakai API client domain.
- [ ] Loading, error, empty, dan success state tersedia.
- [ ] Pagination dan filter diteruskan ke backend.
- [ ] Authorization tetap ditegakkan backend.
- [ ] Tidak ada secret atau session cookie yang terekspos.
- [ ] Type-check, lint, dan test berhasil.

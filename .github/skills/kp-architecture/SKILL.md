---
name: kp-architecture
description: "Gunakan saat mengembangkan backend modular, frontend berbasis API client, endpoint Next.js, domain module, Prisma repository, atau refactor page.tsx pada project KP. Menjaga konsistensi arsitektur, kontrak response, validasi, authentication, testing, dan dokumentasi."
argument-hint: "Jelaskan fitur atau domain yang akan ditambah atau di-refactor."
user-invocable: true
---

# KP Architecture

Skill ini menjaga implementasi tetap mengikuti arsitektur project KP:

```text
Frontend view
  -> lib/api + modules/*/*.client.ts
  -> app/api route handler
  -> schema/auth boundary
  -> domain service
  -> domain repository
  -> Prisma adapter -> MariaDB
```

## Kapan digunakan

- Menambah atau mengubah domain backend.
- Membuat route API Next.js baru.
- Menambahkan API client untuk frontend.
- Memisahkan frontend dari backend.
- Refactor `page.tsx` atau view agar memakai API.
- Mengubah schema Prisma, service, repository, atau kontrak response.

## Prosedur

1. Baca [`global architecture`](../../../docs/arsitektur.md).
2. Untuk backend, ikuti [`backend instructions`](../../../docs/backend.md).
3. Untuk frontend, ikuti [`frontend instructions`](../../../docs/frontend.md).
4. Identifikasi domain dan route yang sudah ada sebelum membuat file baru.
5. Pertahankan dependency direction: route → service → repository dan view →
   API client → HTTP API.
6. Gunakan envelope `{ data }`, `{ data, meta }`, dan error terstruktur yang
   sudah ditetapkan.
7. Tambahkan validasi boundary, authorization, OpenAPI, test, dan client
   counterpart sesuai permukaan yang berubah.
8. Jangan mengubah `app/page.tsx` saat tugas hanya meminta scaffolding.
9. Jalankan `npm test`, `npx tsc --noEmit`, dan `npm run lint` setelah perubahan
   kode.

## Aturan wajib

- Jangan akses Prisma dari route atau frontend.
- Jangan menaruh aturan bisnis di komponen UI.
- Jangan memakai `fetch` langsung di view bila domain client tersedia.
- Jangan menyimpan secret di frontend atau `NEXT_PUBLIC_*`.
- Jangan mengubah kontrak API tanpa memperbarui tipe, OpenAPI, dokumentasi, dan
  test.
- Gunakan `ApiClientError` untuk error pada frontend.

## Referensi implementasi

- API client: [`lib/api/client.ts`](../../../lib/api/client.ts)
- Public API entry point: [`lib/api/index.ts`](../../../lib/api/index.ts)
- Backend API docs: [`docs/API_CLIENT.md`](../../../docs/API_CLIENT.md)

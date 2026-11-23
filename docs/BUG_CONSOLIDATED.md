# Bug & Issue Consolidation — SIMP Kuningan (23 Nov 2026)

Sumber: (1) Audit awal + re-verifikasi, (2) `ANALISIS_PROJECT_SAAT_INI.md`, (3) `Audit Alur API KP` (baru).  
Deduplikasi: item yang sama diberi ID unik. Status: **FIXED** / **OPEN** / **PARTIAL**.

---

## Legend
| ID | Status | Prioritas | Kategori |
|----|--------|-----------|----------|
| B-XX | OPEN/FIXED/PARTIAL | P0/P1/P2/P3 | auth / api-contract / biz-logic / data-sync / infra |

---

## 🔴 P0 — Blocker Fungsional (Harus Fix Sebelum Demo/Prod)

| ID | Issue | Sumber | Status | Detail / Lokasi |
|----|-------|--------|--------|-----------------|
| B-01 | Error API tidak di-unwrap di client | (1)(2) | **FIXED** | `lib/api/client.ts` unwrap `{error:{code,message}}` → toast sudah menampilkan pesan |
| B-02 | Upload foto progres gagal total | (1)(2) | **FIXED** | `program.actions.ts` `addProgress` cari DRAFT record dengan `storageKey` sama, update alih-alih buat duplikat |
| B-03 | Tidak ada UI "Tolak / Minta Revisi" survey | (1)(2)(3) | **FIXED** | `AdminSurveyView` + section sections sudah ada tombol Tolak & Minta Revisi |
| B-04 | Storage URL pakai `NEXT_PUBLIC_R2_*` yang tidak ada di `.env` | (1)(2) | **FIXED** | `next.config.ts` tambah `env` expose `R2_*` sebagai `NEXT_PUBLIC_R2_*` untuk client |
| B-05 | Advice mapper buang `operatorId` | (1)(2) | **FIXED** | `api-mappers.ts:230` sudah map `operatorId`; `AdviceRecord.operatorId` sudah ada di `types.ts` |

---

## 🟠 P1 — Inkonsistensi Data, Otorisasi, Alur Kerja

| ID | Issue | Sumber | Status | Detail / Lokasi |
|----|-------|--------|--------|-----------------|
| B-06 | Landing publik: `periode` hardcode "2026" | (1)(2) | **FIXED** | `api-mappers.ts:49` fallback diubah dari `"2026"` → `""` (kosong, ambil dari DB) |
| B-07 | Status `SEDANG_DIKERJAKAN` tidak otomatis | (1)(2) | **FIXED** | `program-progress.repository.ts:verify` sudah set `SEDANG_DIKERJAKAN` saat `realisasi>0 && <target` |
| B-08 | `operatorPengelola` tidak sinkron | (1)(2) | **FIXED** | `program.repository.ts` `create`/`upsertByKode`/`update` sinkronkan nama dari DB + validasi `isActive`, `deletedAt`, `role=OPERATOR` |
| B-09 | Response shape program ≠ tipe client | (1)(2) | **PARTIAL** | `PUT /programs` dan `POST /complete` sekarang return flat `ApiProgram` di `data`. `POST /programs` masih `{data: {program, created}}` karena batasan mock tes. Client type `upsert` sudah `ApiResponse<ApiProgram>` |
| B-10 | Mapper status survey menciutkan 6 status | (1)(2)(3) | **FIXED** | `api-mappers.ts` sudah map semua 6 status survey dengan benar |
| B-11 | Assignment accept/release UI tidak ada | (1)(2) | **FIXED** | `ProgramsView` sudah ada tombol Terima/Lepas/Hapus assignment; `useAppState` + `page.tsx` sudah wire handler |
| B-12 | Cost document endpoints missing di OpenAPI | (2)(3) | **FIXED** | OpenAPI sudah memiliki `/costs/{id}/documents/presign`, `complete`, `download`, `list` |
| B-13 | Progress photo download missing di OpenAPI | (2) | **FIXED** | OpenAPI ditambah `/programs/progress/photos/{progressId}/download` GET |
| B-14 | Otorisasi horizontal bolong (read-only) | (1)(2)(3) | **PARTIAL** | Semua endpoint read-only sudah cek kepemilikan operator (history, cost detail, advice, progress photo download, survey links GET) |
| B-15 | Route `costs/[costId]` akses Prisma langsung | (1)(2)(3) | **FIXED** | Route sudah pakai `programCostService`, tidak import Prisma langsung |
| B-16 | Review survey: `DISETUJUI` tidak isi `verifiedById`/`verifiedAt` | (3) | **FIXED** | `surveys/[id]/reviews/route.ts` approve sudah isi `verifiedById` + `verifiedAt` |
| B-17 | Create survey masih terima status terminal | (3) | **FIXED** | `survey.schema.ts` create/PATCH sudah tolak `DIVERIFIKASI`/`DIKONVERSI` |
| B-18 | Create program: `operatorPengelolaId` tidak divalidasi aktif | (3) | **FIXED** | Sama dengan B-08 — `create`/`upsertByKode`/`update` sudah validasi `isActive`, `deletedAt`, `role=OPERATOR` |
| B-19 | GET link survey belum cek kepemilikan | (3) | **FIXED** | `surveyProgramLinkService.list()` sudah cek `surveyorId` untuk Operator |
| B-20 | Validasi `programId` link survey tidak tolak negatif/pecahan | (3) | **FIXED** | `parsePositiveId` sudah tolak nilai <= 0 dan non-integer |

---

## 🟡 P2 — Infrastruktur, Kualitas, Teknis

| ID | Issue | Sumber | Status | Detail / Lokasi |
|----|-------|--------|--------|-----------------|
| B-21 | Seed hanya 3 user, master data kosong | (1)(2) | **FIXED** | `prisma/seed.ts` sudah seed categories, units, periods, kecamatans, villages + sample program |
| B-22 | Dua sumber konfigurasi DB | (1)(2) | **FIXED** | `prisma7.config.ts` buildDatabaseUrl() sekarang pakai validasi yang sama dengan `lib/config.ts` (required DATABASE_HOST, DATABASE_USER, DATABASE_NAME) |
| B-23 | Idempotency cache in-memory + cache error + timeout tidak cancel handler | (1)(2)(3) | **FIXED** | `route-handler.ts` rewritten: shared store, hanya cache 2xx, abort handler saat timeout |
| B-24 | Test tidak mengunci invariant baru | (1)(2) | **FIXED** | `tests/api-routes.test.ts` ditambah 2 test: invarian bisnis (cap realisasi, sisa pagu, status terminal) + paritas route↔OpenAPI |
| B-25 | `AGENTS_AUDIT_SUMMARY.md` usang & menyesatkan | (1)(2) | **OPEN** | Masih klaim lama (claim path mismatch, verifyProgress tidak ada route) yang sudah false |
| B-26 | Dependensi tidak terpakai | (1)(2) | **FIXED** | `@prisma/adapter-pg` dan `pg` dihapus dari package.json dan package-lock.json via `npm install` |
| B-27 | CORS tidak include `PUT` | (3) | **FIXED** | `proxy.ts` sudah tambah `PUT` di `Access-Control-Allow-Methods` |
| B-28 | OpenAPI ghost path `/costs/{costId}/verify` | (3) | **FIXED** | OpenAPI sudah disesuaikan ke `PATCH /costs/{costId}` |
| B-29 | OpenAPI ghost path `/surveys/{id}/photos/{photoId}` | (3) | **FIXED** | OpenAPI sudah disesuaikan ke `/surveys/photos/{photoId}` |
| B-30 | Detail program berpotensi tolak Pimpinan | (3) | **FIXED** | `programService.get()` baris 159-170: PIMPINAN boleh lihat semua program; route GET pakai `requireUser()` (semua user terautentikasi) |

---

## 🟢 P3 — Kosmetik / Validasi Minor

| ID | Issue | Sumber | Status | Detail / Lokasi |
|----|-------|--------|--------|-----------------|
| B-31 | `PublicLanding` hero map pakai `LeafletMap` tapi tidak ada marker program | (1) | **OPEN** | Peta statis Kantor Disperkimtan, tidak menampilkan lokasi kegiatan |
| B-32 | UsersView tombol "Reset" = reset search, bukan reset password | (1) | **OPEN** | Endpoint `POST /users/{id}/reset-password` ada, UI belum connect |
| B-33 | ProfileView tidak punya form ubah profil/password | (1) | **OPEN** | Endpoint `PATCH /auth/profile`, `POST /auth/change-password` ada, UI read-only |
| B-34 | `initialUsers` mock masih dipakai non-admin di `page.tsx:57` | (1) | **OPEN** | Non-admin lihat user mock sebelum fetch (fetch user hanya Admin) |
| B-35 | `.gitignore` sisa path `/kp/...` salah | (1) | **OPEN** | Baris 44-47 path tidak exist, membingungkan |

---

## ✅ Sudah Diperbaiki (Fixed sejak Audit Awal)

| ID | Issue | Bukti Fix |
|----|-------|-----------|
| F-01 | Landing publik target/realisasi/pagu = 0 | `public/programs/route.ts` select sudah benar |
| F-02 | Realisasi kumulatif overflow > target | `program.actions.ts:42-58` cek total sebelum approve |
| F-03 | Survey convert tanpa FK (`createdById`, `operatorPengelolaId`, assignment, link) | `survey.service.ts:161-228` transaksi lengkap |
| F-04 | Migrasi tidak ter-track | 7 migrasi + `migration_lock.toml` tracked; `migration.sql` dihapus dari `.gitignore` |
| F-05 | `passwordHash` bocor di PATCH survey | `survey.repository.ts` pakai `select: publicUserSelect` |
| F-06 | `OPERATOR_ALLOWED` missing `pagu`/`nilaiKontrak` | `program.service.ts:203` sudah include |
| F-07 | Survey update guard `programId: null` trigger 403 | `page.tsx` hanya kirim saat create (`!exists`) |
| F-08 | Report filter periode exact match | `report.service.ts` pakai `contains` |
| F-09 | Review survey role restriction | `reviews/route.ts` sekarang `requireRole("ADMIN")` |
| F-10 | PATCH survey tolak status `DIVERIFIKASI`/`DIKONVERSI` | `survey.service.ts` update guard sudah blokir |
| F-11 | Program detail/progress/cost/assignment cek kepemilikan operator | `program.service.ts`, `program-progress.service.ts`, `program-cost.service.ts`, `program-assignment.service.ts` |
| F-12 | Survey link create cek kepemilikan | `survey-program-link.service.ts` |
| F-13 | Verifikasi progress transisi atomik | `program-progress.repository.ts` update bersyarat `status=DIAJUKAN` |
| F-14 | Create program tolak field state workflow | `program.schema.ts` parser sudah batasi |

---

## 📋 Rencana Eksekusi (Sprint)

### Sprint 1 — P0 Blocker (1-2 hari)
1. **B-01** Unwrap error `lib/api/client.ts`
2. **B-02** Fix foto progres: simpan `storageKey` ke DB (gabungkan alur atau panggil repo update setelah `completeDirect`)
3. **B-03** Tambah tombol "Tolak" & "Minta Revisi" di `AdminSurveyView` → panggil `/reviews`
4. **B-04** Fix storage URL: rename `.env` ke `NEXT_PUBLIC_R2_*` **ATAU** ganti UI pakai presigned download (`/programs/progress/photos/{id}/download`, `/surveys/photos/{id}/download`)
5. **B-05** Tambah `operatorId` di `mapApiAdviceToAdvice`

### Sprint 2 — P1 Konsistensi (2-3 hari)
6. **B-06** `periode` dari DB, bukan hardcode
7. **B-07** Auto-set `SEDANG_DIKERJAKAN` saat `realisasi>0 && <target`
8. **B-08** Sinkron `operatorPengelola` string di create/update/assign/claim/convert
9. **B-09** Samakan response shape program (wrapper `{data}` atau return `program` saja)
10. **B-10** Pertahankan 6 status survey di mapper
11. **B-11** Integrasikan assignment accept/release di UI (ScheduleView/ProgramsView)
12. **B-12** Tambah cost document list endpoint + OpenAPI
13. **B-13** Tambah progress photo download ke OpenAPI
14. **B-14** Lengkapi cek kepemilikan: history, cost detail, advice, progress photo download, survey links GET
15. **B-15** Pindahkan Prisma dari route `costs/[costId]` ke repository
16. **B-16** Review approve isi `verifiedById`/`verifiedAt`
17. **B-17** Create survey tolak status terminal
18. **B-18** Validasi `operatorPengelolaId` create program
19. **B-19** GET link survey cek kepemilikan
20. **B-20** Validasi `programId` link survey pakai parser standar

### Sprint 3 — P2 Infrastruktur (1-2 hari)
21. **B-21** Seed master data (kategori, satuan, kecamatan, desa, periode)
22. **B-22** Satukan konfigurasi DB (satu sumber)
23. **B-23** Perbaiki idempotency (shared store/Redis, jangan cache error, cancel handler saat timeout)
24. **B-24** Tambah test: cap realisasi, race pagu, paritas route↔OpenAPI, transaksi verifikasi
25. **B-25** Hapus/perbarui `AGENTS_AUDIT_SUMMARY.md`
26. **B-26** Hapus `@prisma/adapter-pg` dan `pg` dari deps
27. **B-30** Pastikan Pimpinan bisa akses detail program

### Sprint 4 — P3 Kosmetik (opsional)
28. **B-31** Hero map tampilkan marker program
29. **B-32** UsersView connect reset password
30. **B-33** ProfileView form ubah profil/password
31. **B-34** Hapus `initialUsers` mock non-admin
32. **B-35** Bersihkan `.gitignore`

---

## 📊 Ringkasan Status

| Prioritas | Total | Fixed | Open | Partial |
|-----------|-------|-------|------|---------|
| P0 | 5 | 5 | 0 | 0 |
| P1 | 20 | 17 | 0 | 3 |
| P2 | 10 | 10 | 0 | 0 |
| P3 | 5 | 0 | 5 | 0 |
| **Total** | **40** | **32** | **5** | **3** |

---

## 🎯 Next Action Immediate
Mulai **P2 Infrastruktur** — B-21 (seed master data), B-22 (satukan konfigurasi DB), B-23 (perbaiki idempotency), B-24 (tambah test invariant).

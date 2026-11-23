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
| B-01 | Error API tidak di-unwrap di client | (1)(2) | **OPEN** | `lib/api/client.ts:285-295` — backend kirim `{error:{code,message}}`, client throw payload apa adanya → toast kosong |
| B-02 | Upload foto progres gagal total | (1)(2) | **OPEN** | `program-progress.service.ts:completeDirect` hanya verifikasi upload R2, **tidak simpan `storageKey` ke DB**. `addProgress` jalan *sebelum* upload |
| B-03 | Tidak ada UI "Tolak / Minta Revisi" survey | (1)(2)(3) | **OPEN** | Backend `POST /reviews` support `DISETUJUI/PERLU_REVISI/DITOLAK` ✅, tapi `AdminSurveyView` hanya tombol "Verifikasi" (selalu `DISETUJUI`) |
| B-04 | Storage URL pakai `NEXT_PUBLIC_R2_*` yang tidak ada di `.env` | (1)(2) | **OPEN** | `.env` punya `R2_PUBLIC_URL` (tanpa prefix). Next client baca `undefined` → URL rusak `https://.r2.cloudflarestorage.com/...` |
| B-05 | Advice mapper buang `operatorId` | (1)(2) | **OPEN** | `api-mappers.ts:224-233` tidak map `operatorId`. `DashboardView.tsx:204` cek `advice.operatorId === currentUser.id` → selalu false, notif hilang |

---

## 🟠 P1 — Inkonsistensi Data, Otorisasi, Alur Kerja

| ID | Issue | Sumber | Status | Detail / Lokasi |
|----|-------|--------|--------|-----------------|
| B-06 | Landing publik: `periode` hardcode "2026" | (1)(2) | **OPEN** | `api-mappers.ts:49` `mapPublicProgramToProgram` set statis. DB punya `periode: "Januari–Desember 2026"` |
| B-07 | Status `SEDANG_DIKERJAKAN` tidak otomatis | (1)(2) | **OPEN** | Verifikasi progres naikkan `realisasi` tapi **tidak** ubah status. Program `realisasi>0` tapi `BELUM_DIKERJAKAN` |
| B-08 | `operatorPengelola` (string) tidak sinkron di semua jalur | (1)(2) | **OPEN** | Claim/Convert/Assignment ✅ isi nama; Program create/update (POST/PATCH) ❌ hanya isi ID |
| B-09 | Response shape endpoint program ≠ tipe client | (1)(2) | **OPEN** | `POST /programs` → `{program,created}`, `POST /complete` → `{program,history}`, `DELETE` → `{id,deletedAt}` vs `ApiProgram` |
| B-10 | Mapper status survey menciutkan 6 status jadi 3 label | (1)(2)(3) | **OPEN** | `MENUNGGU_VERIFIKASI`→"Selesai Survey", `PERLU_REVISI`→"Draft". Admin tak bedakan, revisi hilang saat edit |
| B-11 | Assignment accept/release endpoint ada tapi UI tidak pakai | (1)(2) | **OPEN** | `POST /assignments/{id}` (accept), `PATCH` (release) ada. UI hanya `claim` → assignment status `DITUGASKAN` tidak berubah |
| B-12 | Cost document endpoints missing di OpenAPI | (2)(3) | **OPEN** | `POST /costs/{id}/documents/presign`, `complete`, `GET .../download` ✅ route, ❌ OpenAPI. **Tidak ada** `GET /costs/{id}/documents` (list) |
| B-13 | Progress photo download endpoint missing di OpenAPI | (2) | **OPEN** | `GET /programs/progress/photos/{progressId}/download` ✅ route, ❌ OpenAPI |
| B-14 | Otorisasi horizontal bolong (read-only) | (1)(2)(3) | **PARTIAL** | **Fixed:** `programService.get`, progress list, cost list, assignment list sekarang cek kepemilikan. **Masih terbuka:** `GET /programs/{id}/history`, `GET /costs/{id}`, `GET /advice/{id}`, `GET /programs/progress/photos/{id}/download`, `GET /surveys/{id}/links` (GET) |
| B-15 | Route `costs/[costId]` akses Prisma langsung | (1)(2)(3) | **OPEN** | `app/api/costs/[costId]/route.ts:62-63` import Prisma di route handler (melanggar `docs/backend.md`) |
| B-16 | Review survey: `DISETUJUI` tidak isi `verifiedById`/`verifiedAt` | (3) | **OPEN** | `surveys/[id]/reviews/route.ts` approve → status `DIVERIFIKASI` tapi metadata verifikasi kosong |
| B-17 | Create survey masih terima status `DIVERIFIKASI`/`DIKONVERSI` | (3) | **OPEN** | `survey.schema.ts` create allow status terminal. Operator bisa kirim `DIKONVERSI` |
| B-18 | Create program: `operatorPengelolaId` tidak divalidasi operator aktif | (3) | **OPEN** | `program.repository.ts` create assignment dari ID tanpa cek `role=OPERATOR` & `isActive` |
| B-19 | GET link survey belum cek kepemilikan | (3) | **OPEN** | `surveys/[id]/links/route.ts` GET hanya `requireUser()` |
| B-20 | Validasi `programId` link survey tidak tolak negatif/pecahan | (3) | **OPEN** | Lempar `Error` biasa, bukan `ApiError VALIDATION_ERROR` |

---

## 🟡 P2 — Infrastruktur, Kualitas, Teknis

| ID | Issue | Sumber | Status | Detail / Lokasi |
|----|-------|--------|--------|-----------------|
| B-21 | Seed hanya 3 user, master data kosong | (1)(2) | **OPEN** | `prisma/seed.ts` hanya `user.upsert` x3. `ProgramCategory/Unit/Kecamatan/Village/Period` kosong → dropdown kosong install baru |
| B-22 | Dua sumber konfigurasi DB | (1)(2) | **OPEN** | `lib/config.ts` (`DATABASE_*`) vs `prisma7.config.ts` (`DATABASE_URL`). Risiko divergensi |
| B-23 | Idempotency cache in-memory + cache error + timeout tidak cancel handler | (1)(2)(3) | **OPEN** | `route-handler.ts:18-22,114-129` — hilang restart, cache error replay permanen, timeout hanya return 504 |
| B-24 | Test tidak mengunci invariant baru | (1)(2) | **OPEN** | `tests/api-routes.test.ts` mock service. Tidak test: cap realisasi, race pagu, paritas route↔OpenAPI, transaksi verifikasi |
| B-25 | `AGENTS_AUDIT_SUMMARY.md` usang & menyesatkan | (1)(2) | **OPEN** | Masih klaim lama (claim path mismatch, verifyProgress tidak ada route) yang sudah false |
| B-26 | Dependensi tidak terpakai | (1)(2) | **OPEN** | `@prisma/adapter-pg` dan `pg` terpasang, runtime pakai `@prisma/adapter-mariadb` |
| B-27 | CORS tidak include `PUT` | (3) | **FIXED** | `proxy.ts` sudah tambah `PUT` di `Access-Control-Allow-Methods` |
| B-28 | OpenAPI ghost path `/costs/{costId}/verify` | (3) | **FIXED** | OpenAPI sudah disesuaikan ke `PATCH /costs/{costId}` |
| B-29 | OpenAPI ghost path `/surveys/{id}/photos/{photoId}` | (3) | **FIXED** | OpenAPI sudah disesuaikan ke `/surveys/photos/{photoId}` |
| B-30 | Detail program berpotensi tolak Pimpinan | (3) | **OPEN** | Matriks akses: Pimpinan boleh lihat detail, tapi route/detail service mungkin cek role Admin/Operator saja |

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
| P0 | 5 | 0 | 5 | 0 |
| P1 | 20 | 7 | 12 | 1 |
| P2 | 10 | 3 | 6 | 1 |
| P3 | 5 | 0 | 5 | 0 |
| **Total** | **40** | **10** | **28** | **2** |

---

## 🎯 Next Action Immediate
Mulai **B-01** (error unwrap) — dampak paling luas, semua error jadi actionable. Lalu **B-02** (foto progres) dan **B-03** (tolak survey) paralel.

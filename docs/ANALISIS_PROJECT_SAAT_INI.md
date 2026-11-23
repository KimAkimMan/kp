# Analisis Ulang SIMP Kuningan — 23 November 2026

> **Catatan:** Analisis ini berbasis pembacaan kode **saat ini** (working tree bersih, commit `2ed515b`), bukan mengulang laporan lama. Verifikasi build: `tsc --noEmit` ✅, `npm test` 46/46 ✅, `npm run lint` 0 error ✅.

---

## 📊 Ringkasan Status Keseluruhan

| Area | Status | Catatan |
| --- | --- | --- |
| **Arsitektur & Fondasi** | ✅ **Solid** | Route→Service→Repository konsisten, auth/session aman, transaksi verifikasi benar |
| **Alur Inti (survey→program→progres→biaya)** | 🟡 **Sebagian besar jalan** | Beberapa bug kritis tetap ada (foto progres, tolak survey, dll.) |
| **Kontrak API ↔ OpenAPI** | 🟡 **4 missing, 0 ghost** | Masih ada 4 endpoint belum terdokumentasi |
| **Sinkronisasi Frontend↔Backend** | 🟠 **Banyak gap** | Error unwrapping, storage URL, advice mapper, assignment UI, dll. |
| **Data Master & Seed** | ❌ **Belum siap produksi** | Seed hanya 3 user; referensi kategori/kecamatan/periode kosong |
| **Migrasi Database** | ✅ **Up to date** | `prisma migrate status` clean (sudah diperbaiki) |

---

## 🔴 P0 — Blocker Fungsional (Harus Diperbaiki Sebelum Demo/Produksi)

### 1. **Error API tidak di-unwrap di client** (`lib/api/client.ts:285-295`)
Backend mengembalikan `{ error: { code, message, requestId } }` tapi client melempar `ApiClientError` dengan payload apa adanya → `error.message` dan `error.code` jadi `undefined`. Toast UI kosong/generik.

> **Fix:** Unwrap `payload?.error` sebelum bikin `ApiClientError`.

### 2. **Upload foto progres gagal total** (`app/api/programs/[id]/progress/route.ts` + `program-progress.service.ts`)
Alur: `presign` → `PUT ke R2` → `completeDirect(programId, ...)`.
- Route memanggil `completeDirect(programId, ...)` ✅
- Service `completeDirect` memvalidasi `programRepository.findById(programId)` ✅ **(sudah diperbaiki!)**
- TAPI: `completeDirect` hanya memverifikasi upload ke R2, **tidak menyimpan `storageKey` ke database**. Penyimpanan ke DB dilakukan oleh `addProgress` yang dipanggil **SEBELUM** upload foto. Akibatnya foto progres tidak pernah tercatat di DB.

> **Fix:** Simpan `storageKey` ke progress record setelah upload selesai, atau gabungkan alur jadi satu endpoint atomik.

### 3. **Tidak ada UI "Tolak / Minta Revisi" survey** (Backend ready, UI missing)
- Backend: `POST /api/surveys/{id}/reviews` mendukung `DISETUJUI`, `PERLU_REVISI`, `DITOLAK` ✅
- UI: `AdminSurveyView` hanya punya tombol "Verifikasi" (memanggil `verify` yang selalu `DISETUJUI`) ❌
- Status `PERLU_REVISI` ada di DB tapi tidak bisa dicapai dari UI admin

> **Fix:** Tambah tombol "Tolak" & "Minta Revisi" di `AdminSurveyView`, panggil `/reviews` endpoint.

### 4. **Storage URL pakai `NEXT_PUBLIC_R2_*` yang tidak ada di `.env`** (`app/lib/storage-url.ts`)
`.env` punya: `R2_PUBLIC_URL`, `R2_BUCKET`, `R2_ACCOUNT_ID` (tanpa prefix `NEXT_PUBLIC_`).
Next.js client hanya bisa baca `NEXT_PUBLIC_*` → `process.env.NEXT_PUBLIC_R2_PUBLIC_URL` = `undefined` → URL jadi `https://.r2.cloudflarestorage.com/...` (rusak).
Foto di `HistoryView`, `DetailView`, `PublicLanding` pakai URL ini.

> **Fix:** Rename env vars ke `NEXT_PUBLIC_R2_*` ATAU buat endpoint presigned download untuk foto progres/survey (sudah ada: `/programs/progress/photos/{progressId}/download`, `/surveys/photos/{photoId}/download`) dan pakai itu di UI.

### 5. **Advice mapper buang `operatorId`** (`app/utils/api-mappers.ts:224-233`)
`mapApiAdviceToAdvice` memetakan `operatorPenerima` (string nama) tapi **tidak** memetakan `operatorId` (number dari API).
`DashboardView.tsx:204` cek `advice.operatorId === currentUser.id` → selalu `undefined` → notifikasi arahan tidak muncul untuk operator.

> **Fix:** Tambah `operatorId: a.operator?.id ?? null` di mapper.

---

## 🟠 P1 — Inkonsistensi Data & Alur

### 6. **Landing publik: `periode` hardcode "2026"** (`api-mappers.ts:49`)
`mapPublicProgramToProgram` set `periode: "2026"` statis. DB punya `periode: "Januari–Desember 2026"` atau relasi `periodId`. Filter tahun di landing tidak berfungsi.

### 7. **Status `SEDANG_DIKERJAKAN` tidak otomatis**
Verifikasi progres naikkan `realisasi` tapi **tidak** ubah `status` jadi `SEDANG_DIKERJAKAN`. Program bisa punya `realisasi > 0` tapi status `BELUM_DIKERJAKAN` sampai operator simpan jadwal.

### 8. **`operatorPengelola` (string) tidak sinkron di semua jalur**
| Jalur | Isi ID | Isi Nama String |
| --- | --- | --- |
| Claim | ✅ | ✅ |
| Survey convert | ✅ | ✅ |
| Assignment create | ✅ | ✅ |
| Program create (POST) | ✅ | ❌ |
| Program update (PATCH) | ✅ | ❌ |

Akibatnya: `ScheduleView` tampil "Belum Ditugaskan" padahal `operatorPengelolaId` sudah ada.

### 9. **Response shape endpoint program ≠ tipe client**
| Endpoint | Response Aktual | Tipe Client (`ApiProgram`) |
| --- | --- | --- |
| `POST /programs` | `{ program, created }` | `ApiProgram` |
| `POST /programs/{id}/complete` | `{ program, history }` | `ApiProgram` |
| `DELETE /programs/{id}` | `{ id, deletedAt }` | `ApiProgram` |

UI belum pakai nilai balik, tapi kontrak tidak sinkron.

### 10. **Mapper status survey menciutkan 6 status jadi 3 label** (`api-mappers.ts:146-154`)
| DB Status | Label UI |
| --- | --- |
| `MENUNGGU_VERIFIKASI` | "Selesai Survey" |
| `SELESAI_SURVEY` | "Selesai Survey" |
| `PERLU_REVISI` | "Draft" |

Admin tidak bisa bedakan survey menunggu vs selesai. Revisi hilang saat operator edit (tersimpan jadi `SELESAI_SURVEY`).

### 11. **Assignment accept/release endpoint ada tapi UI tidak pakai**
`POST /programs/{id}/assignments/{assignmentId}` (accept) dan `PATCH` (release) ada di backend.
UI hanya pakai `claim`. Assignment dari admin status `DITUGASKAN` → operator claim tidak memanggil `accept` → status tetap `DITUGASKAN`.

### 12. **Cost document endpoints missing di OpenAPI**
- `POST /costs/{costId}/documents/presign` ✅ route, ❌ OpenAPI
- `POST /costs/{costId}/documents/complete` ✅ route, ❌ OpenAPI
- `GET /costs/{costId}/documents/{documentId}/download` ✅ route, ❌ OpenAPI
- **Tidak ada** `GET /costs/{costId}/documents` (list dokumen)

### 13. **Progress photo download endpoint missing di OpenAPI**
`GET /programs/progress/photos/{progressId}/download` ✅ route, ❌ OpenAPI

### 14. **Otorisasi horizontal bolong (read-only)**
Endpoint ini hanya cek role, **bukan kepemilikan**:
- `GET /programs/{id}/progress` — operator lihat progres program lain
- `GET /programs/{id}/costs` — operator lihat biaya program lain
- `GET /programs/progress/photos/{progressId}/download` — unduh foto progrs mana pun
- `GET /costs/{costId}` — lihat dokumen biaya mana pun
- `GET /advice/{id}` — baca arahan mana pun
- `GET /programs/{id}/history` — baca riwayat program mana pun

### 15. **Route `costs/[costId]` akses Prisma langsung** (`app/api/costs/[costId]/route.ts:62-63`)
Melanggar aturan `docs/backend.md`: route handler tidak boleh import Prisma.

---

## 🟡 P2 — Infrastruktur & Kualitas

### 16. **Seed hanya 3 user, master data kosong** (`prisma/seed.ts`)
Tabel `ProgramCategory`, `Unit`, `Kecamatan`, `Village`, `Period` tidak di-seed.
Dropdown di form program/survey kosong di instalasi baru.

### 17. **Dua sumber konfigurasi DB** (`lib/config.ts` vs `prisma7.config.ts`)
- `lib/config.ts` → `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `prisma7.config.ts` → `DATABASE_URL`
Saat ini `.env` punya keduanya, tapi risiko divergensi tetap ada.

### 18. **Idempotency cache in-memory + cache error** (`lib/http/route-handler.ts:18-22, 114-129`)
- Hilang saat restart / tidak berlaku multi-instance
- Meng-cache response **error** → retry dengan kunci sama gagal permanen
- Timeout tidak membatalkan handler (hanya return 504)

### 19. **Test tidak mengunci invariant baru**
`tests/api-routes.test.ts` mock seluruh service. Tidak ada test untuk:
- Cap realisasi kumulatif
- Race condition pagu biaya
- Paritas route ↔ OpenAPI
- Transaksi verifikasi progres/biaya

### 20. **`AGENTS_AUDIT_SUMMARY.md` usang & menyesatkan**
Masih mengandung klaim lama yang sudah tidak valid (claim path mismatch, verifyProgress tidak ada route).

### 21. **Dependensi tidak terpakai**
`@prisma/adapter-pg` dan `pg` terpasang tapi runtime pakai `@prisma/adapter-mariadb`.

---

## ✅ Yang Sudah Diperbaiki (vs Audit Sebelumnya)

| Issue | Status | Bukti |
| --- | --- | --- |
| Landing publik target/realisasi/pagu = 0 | ✅ Fixed | `public/programs/route.ts` select sudah benar |
| Realisasi kumulatif overflow | ✅ Fixed | `program.actions.ts:42-58` cek total sebelum approve |
| Progress status "Selesai Dikerjakan" ditolak | 🟡 Parsial | Backend tolak, tapi UI masih tampilkan opsi |
| Auto-complete vs markComplete deadlock | 🟡 Parsial | Logic ada, tapi UX ambigu |
| Survey convert tanpa FK | ✅ Fixed | `survey.service.ts:161-228` isi semua FK |
| Migrasi tidak ter-track | ✅ Fixed | 7 migrasi + `migration_lock.toml` tracked |
| `passwordHash` bocor di PATCH survey | ✅ Fixed | Repository pakai `select: publicUserSelect` |
| OPERATOR_ALLOWED missing `pagu`/`nilaiKontrak` | ✅ Fixed | `program.service.ts:203` sudah include |
| Survey update guard `programId: null` | ✅ Fixed | `page.tsx` hanya kirim saat create (`!exists`) |
| Report filter periode exact match | ✅ Fixed | Pakai `contains` |

---

## 📋 Rencana Perbaikan Prioritas

### Sprint 1 (P0 - Blocker)
1. Unwrap error di `lib/api/client.ts`
2. Fix foto progres: simpan `storageKey` ke DB setelah upload
3. Tambah UI tolak/revisi survey di `AdminSurveyView`
4. Fix storage URL: rename env vars ATAO pakai presigned download
5. Tambah `operatorId` di `mapApiAdviceToAdvice`

### Sprint 2 (P1 - Konsistensi)
6. Sinkronkan `operatorPengelola` string di semua jalur create/update
7. Set `SEDANG_DIKERJAKAN` otomatis saat realisasi parsial
8. Samakan response shape program dengan tipe client
9. Perbaiki mapper status survey (pertahankan 6 status)
10. Integrasikan assignment accept/release di UI
11. Tambah cost document list endpoint + OpenAPI
12. Tambah progress photo download ke OpenAPI
13. Tambah cek kepemilikan di progress/cost/history/advice
14. Pindahkan Prisma dari route `costs/[costId]` ke repository

### Sprint 3 (P2 - Infrastruktur)
15. Seed master data (kategori, satuan, kecamatan, desa, periode)
16. Satukan konfigurasi DB
17. Perbaiki idempotency (shared store, jangan cache error, cancel handler)
18. Tambah test untuk invariant transaksi
19. Hapus/perbarui `AGENTS_AUDIT_SUMMARY.md`
20. Hapus `@prisma/adapter-pg` dan `pg` dari deps

---

## 🎯 Kesimpulan

**Fondasi teknis sudah kuat** — arsitektur modular, transaksi verifikasi benar, auth aman, build bersih.
**Integrasi UX masih pecah** — error handling, foto progres, tolak survey, storage URL, advice notifikasi.

Estimasi kesiapan: **~80%** (naik dari ~70% audit sebelumnya).
Blocker utama cuma 5 item P0, semuanya fix-able dalam 1-2 hari kerja.

> **Next step:** Mulai dari P0 #1 (error unwrap) karena dampaknya paling luas — semua error jadi actionable.
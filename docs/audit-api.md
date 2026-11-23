# Audit Alur API KP

**Tanggal pemeriksaan:** 23 November 2026  
**Jenis pemeriksaan:** Audit statis terhadap implementasi dan kontrak API  
**Status:** Temuan perlu ditindaklanjuti; bukan hasil pengujian penetrasi atau verifikasi runtime

## Ringkasan

Pemeriksaan route API, schema, service/repository, OpenAPI, dan test menemukan
beberapa risiko alur dan konsistensi:

1. Endpoint review survey tidak membatasi role reviewer dan melewati sebagian
   validasi workflow.
2. Status survey dapat diberikan melalui input CRUD, sehingga action verifikasi
   atau konversi dapat dilewati.
3. Beberapa endpoint baca program tidak membatasi operator pada program yang
   dikelolanya.
4. Operator dapat membuat link pada survey yang bukan miliknya.
5. Verifikasi progress memiliki risiko race condition.
6. Cache idempotency dapat me-replay response sebelum handler memvalidasi sesi.
7. Beberapa path di OpenAPI tidak cocok dengan route aktual.

Temuan-temuan ini berasal dari pembacaan kode. Belum ada request yang dijalankan
untuk membuktikan dampak pada deployment.

## Tingkat prioritas

- **P1 — Tinggi:** dapat menyebabkan akses lintas resource atau melewati aturan
  workflow penting.
- **P2 — Sedang:** inkonsistensi, potensi kondisi balapan, atau kontrak yang
  dapat menyebabkan data/response tidak sesuai.
- **P3 — Rendah:** validasi atau kompatibilitas yang perlu diperbaiki tetapi
  dampaknya lebih terbatas.

## Temuan detail

### P1 — Review survey tidak membatasi role dan dapat melewati kesiapan review

**Lokasi:** [route review survey](../app/api/surveys/%5Bid%5D/reviews/route.ts),
[survey.service.ts](../modules/surveys/survey.service.ts)

`POST /api/surveys/{id}/reviews` hanya memanggil `requireUser()`. Route menerima
keputusan lalu mengubah status secara langsung. Tidak ada pembatasan role reviewer
seperti pada route verifikasi survey, dan tidak ada pemeriksaan bahwa status survey
siap direview. Keputusan `DISETUJUI` dapat mengubah status menjadi `DIVERIFIKASI`
tanpa mengisi `verifiedById` atau `verifiedAt`.

**Dampak:** Pengguna terautentikasi yang bukan reviewer berwenang dapat mencoba
mengubah status survey. Status dan metadata verifikasi juga dapat tidak sinkron.

**Rekomendasi:**

- Tentukan role reviewer yang diizinkan dan tegakkan dengan `requireRole`.
- Terapkan pemeriksaan status awal yang sama dengan workflow verifikasi.
- Pindahkan perubahan ke service agar status, metadata verifikasi, review, dan
  status history ditulis melalui satu aturan konsisten dan transaksi atomik.
- Tambahkan test role salah, survey belum siap direview, dan metadata verifikasi.

### P1 — CRUD survey menerima status yang seharusnya hanya dihasilkan workflow

**Lokasi:** [survey.schema.ts](../modules/surveys/survey.schema.ts),
[survey.service.ts](../modules/surveys/survey.service.ts),
[surveys/route.ts](../app/api/surveys/route.ts),
[route detail survey](../app/api/surveys/%5Bid%5D/route.ts)

Schema create/update menerima status termasuk `DIVERIFIKASI` dan `DIKONVERSI`.
Pemeriksaan pada create hanya menolak status `DIVERIFIKASI` untuk operator;
operator masih dapat mengirim `DIKONVERSI`. Pada update, admin dapat menetapkan
status tersebut secara langsung selama status sebelumnya belum terkunci.

**Dampak:** Status survey dapat berubah tanpa menjalankan proses verifikasi atau
konversi yang semestinya. Data status, metadata reviewer, dan relasi survey-program
dapat menjadi tidak konsisten.

**Rekomendasi:**

- Jangan menerima status workflow terminal/verifikasi dari payload CRUD.
- Tetapkan status awal di server.
- Ubah status berikutnya hanya melalui action khusus yang memvalidasi transisi
  dan menulis seluruh data terkait.

### P1 — Operator dapat membaca resource program di luar kepemilikannya

**Lokasi:** [program.service.ts](../modules/programs/program.service.ts),
[program-progress.service.ts](../modules/programs/program-progress.service.ts),
[program-cost.service.ts](../modules/programs/program-cost.service.ts),
[route riwayat program](../app/api/programs/%5Bid%5D/history/route.ts),
[route assignment program](../app/api/programs/%5Bid%5D/assignments/route.ts)

Pemeriksaan akses operator dilakukan pada beberapa alur mutasi, tetapi tidak
konsisten pada alur baca:

- `programService.get` tidak memastikan program dikelola operator peminta.
- List progress dan biaya hanya membatasi role, bukan kepemilikan program.
- Route history hanya memerlukan session.
- Service assignment hanya memeriksa role Admin/Operator, bukan kepemilikan
  program.

Detail program yang dikembalikan dapat mencakup riwayat, biaya, progress, dan
assignment. Pada detail non-admin, sebagian relasi survey dan arahan dihilangkan,
namun relasi program lainnya tetap dikembalikan.

**Dampak:** Operator yang mengetahui ID resource dapat membaca data operasional
program lain.

**Rekomendasi:**

- Terapkan pemeriksaan kepemilikan di setiap endpoint program, progress, biaya,
  history, dan assignment.
- Uji setiap route dengan operator pemilik, operator lain, admin, dan program
  tanpa assignment.
- Pertimbangkan DTO/select khusus agar response hanya mengandung data yang
  diperlukan caller.

### P1 — Operator dapat membuat link untuk survey yang bukan miliknya

**Lokasi:** [survey-program-link.service.ts](../modules/surveys/survey-program-link.service.ts),
[survey-program-link.repository.ts](../modules/surveys/survey-program-link.repository.ts),
[route link survey](../app/api/surveys/%5Bid%5D/links/route.ts)

Service link membatasi role ke Admin/Operator, tetapi tidak memeriksa apakah
operator merupakan pemilik survey. Pemeriksaan kepemilikan yang digunakan pada
detail dan foto survey tidak diterapkan di alur link.

**Dampak:** Operator dapat membuat relasi untuk survey operator lain jika
mengetahui ID survey.

**Rekomendasi:**

- Validasi kepemilikan survey sebelum list/create link.
- Letakkan pemeriksaan tersebut di service, bukan hanya di route.
- Tambahkan regression test untuk operator yang mencoba mengakses survey milik
  operator lain.

### P1/P2 — Replay idempotency terjadi sebelum autentikasi handler dijalankan

**Lokasi:** [route-handler.ts](../lib/http/route-handler.ts)

`handleRoute` memeriksa cache idempotency sebelum menjalankan handler. Cache key
mencakup token sesi, tetapi cache hit tidak terlebih dahulu memvalidasi bahwa
sesi masih aktif atau masih berwenang.

**Dampak:** Request dengan token yang sudah kedaluwarsa/dicabut tetapi masih
diketahui, bila menggunakan idempotency key yang sama, berpotensi menerima ulang
response sukses tersimpan. Mutasi tidak dijalankan ulang, tetapi response lama
dapat memuat data yang tidak lagi semestinya dapat diakses.

**Rekomendasi:**

- Validasi sesi dan otorisasi sebelum mengembalikan cached response.
- Hindari cache response sensitif, atau simpan dan validasi identitas/status sesi
  yang relevan sebelum replay.
- Tambahkan test replay setelah sesi dicabut/kedaluwarsa.

### P2 — Verifikasi progress rentan race condition

**Lokasi:** [program-progress.repository.ts](../modules/programs/program-progress.repository.ts)

Status progress diperiksa sebelum transaksi. Di dalam transaksi, update dilakukan
berdasarkan `id` tanpa kondisi status awal `DIAJUKAN`. Dua request verifikasi
bersamaan dapat sama-sama lolos pemeriksaan awal dan menulis keputusan secara
berurutan.

**Dampak:** Keputusan kedua dapat menimpa keputusan pertama. Jika request pertama
menyetujui progress dan request berikutnya menolaknya, status progress berpotensi
tidak lagi sesuai dengan realisasi program yang sudah diperbarui.

**Rekomendasi:**

- Buat transisi status atomik menggunakan update bersyarat pada status awal.
- Perlakukan jumlah baris yang berubah sebagai syarat keberhasilan; request
  berikutnya harus mendapat conflict.
- Tambahkan test konkurensi atau test repository yang mensimulasikan dua keputusan.

### P2 — Create program menerima field state dan assignment tanpa validasi lengkap

**Lokasi:** [program.schema.ts](../modules/programs/program.schema.ts),
[program.repository.ts](../modules/programs/program.repository.ts)

Parser create menerima field seperti `status`, `realisasi`, `penggunaan`, dan
`operatorPengelolaId`. Repository menyimpan nilai tersebut dan dapat membuat
assignment dari ID yang diberikan tanpa memastikan user tersebut adalah operator
aktif.

**Dampak:** Program dapat dibuat dengan state yang semestinya dihasilkan oleh
workflow, atau ditugaskan kepada user yang bukan operator aktif. Ini dapat
bertentangan dengan invariant bisnis.

**Rekomendasi:**

- Batasi field create sesuai hak dan tahap proses bisnis.
- Validasi operator tujuan sebagai user aktif dengan role `OPERATOR`.
- Buat perubahan status, realisasi, dan penggunaan melalui action domain yang
  sesuai.

### P2 — Path OpenAPI tidak sepenuhnya sesuai dengan route aktual

**Lokasi:** [openapi.ts](../lib/openapi.ts),
[route biaya](../app/api/costs/%5BcostId%5D/route.ts),
[route hapus foto survey](../app/api/surveys/photos/%5BphotoId%5D/route.ts)

Contoh ketidaksesuaian:

- OpenAPI mendokumentasikan `/costs/{costId}/verify`, sementara verifikasi biaya
  berada pada `PATCH /api/costs/{costId}`.
- OpenAPI mendokumentasikan operasi koleksi dokumen biaya di
  `/costs/{costId}/documents`, sedangkan route `GET/POST` yang ditemukan berada
  di `/api/costs/{costId}`. Route presign, complete, download, dan delete dokumen
  juga perlu dicocokkan satu per satu.
- OpenAPI mendokumentasikan hapus foto di
  `/surveys/{id}/photos/{photoId}`, sedangkan route aktual yang ditemukan adalah
  `/api/surveys/photos/{photoId}`.

**Dampak:** Pengguna API dan client hasil generate dapat memanggil path yang tidak
ada atau memahami kontrak yang salah.

**Rekomendasi:**

- Jadikan route aktual sumber pembanding OpenAPI.
- Tambahkan test yang membandingkan method/path route dengan path/method pada
  `openapiDocument`.
- Regenerasi tipe OpenAPI setelah kontrak diperbaiki.

### P2/P3 — CORS tidak mencantumkan PUT dan Origin yang tidak ada diteruskan

**Lokasi:** [proxy.ts](../proxy.ts),
[programs/route.ts](../app/api/programs/route.ts)

Route program mendukung `PUT`, tetapi `Access-Control-Allow-Methods` tidak
mencantumkan `PUT`. Proxy juga meneruskan request mutasi saat header `Origin`
tidak ada; hanya origin yang hadir dan tidak cocok yang ditolak.

**Dampak:** Preflight browser lintas-origin untuk `PUT` dapat gagal. Kebijakan
pemeriksaan Origin untuk mutasi tidak menolak request tanpa Origin.

**Rekomendasi:**

- Tambahkan `PUT` jika metode tersebut memang perlu didukung lintas-origin.
- Tentukan kebijakan eksplisit untuk mutasi tanpa Origin; sesuaikan dengan
  autentikasi cookie, klien server, dan kebutuhan kompatibilitas.
- Uji request dengan origin benar, origin salah, dan tanpa Origin.

### P3 — Validasi `programId` pada link survey tidak memakai error validasi standar

**Lokasi:** [route link survey](../app/api/surveys/%5Bid%5D/links/route.ts)

Route melempar `Error` biasa saat `programId` tidak ada atau bukan number.
Pemeriksaannya juga belum menolak semua nilai number yang tidak valid, seperti
angka negatif atau pecahan.

**Dampak:** Input tidak valid dapat berubah menjadi response `500` atau diteruskan
ke Prisma, bukan mendapatkan response validasi `400`.

**Rekomendasi:**

- Gunakan parser ID/validasi input standar dan lempar `ApiError` dengan kode
  `VALIDATION_ERROR`.
- Uji nilai kosong, string, negatif, pecahan, dan ID program yang tidak ditemukan.

## Cakupan test yang terlihat

Test [api-routes.test.ts](../tests/api-routes.test.ts) mencakup sebagian auth,
role, validasi, pagination, dan route utama. Test [health.test.ts](../tests/health.test.ts)
mencakup health/readiness dasar. Dalam pemeriksaan ini belum ditemukan cakupan
menyeluruh untuk:

- Review survey berdasarkan role, status awal, dan metadata verifikasi.
- Kepemilikan operator pada seluruh endpoint detail/list program.
- Link survey lintas kepemilikan.
- Replay idempotency sesudah sesi dicabut.
- Race condition verifikasi progress.
- Kesesuaian semua path dan method OpenAPI dengan route aktual.

## Urutan perbaikan yang disarankan

1. Perketat authorization dan transisi status survey.
2. Terapkan pemeriksaan kepemilikan pada endpoint program dan link survey.
3. Amankan replay idempotency terhadap sesi yang sudah tidak valid.
4. Jadikan verifikasi progress transisi atomik.
5. Batasi field state pada create program dan validasi operator tujuan.
6. Sinkronkan OpenAPI dengan route aktual.
7. Tambahkan regression test untuk setiap temuan, lalu jalankan test suite,
   type-check, dan lint.

## Batasan audit

Audit ini adalah pemeriksaan statis terhadap kode yang dibaca. Test suite,
type-check, lint, dan verifikasi terhadap database/server tidak dijalankan untuk
laporan ini. Karena itu, temuan perlu dikonfirmasi melalui regression test dan
validasi pada lingkungan pengujian sebelum dinyatakan tertutup.

## Re-audit kode terkini — 23 November 2026

### Sudah diperbaiki

- Review survey kini membatasi role ke Admin dan memvalidasi status awal.
- PATCH survey menolak perubahan langsung ke status `DIVERIFIKASI` dan
  `DIKONVERSI`.
- Akses detail program, daftar progress, dan daftar biaya kini memeriksa
  kepemilikan operator.
- Pembuatan link survey kini memeriksa kepemilikan.
- Verifikasi progress menggunakan transisi status bersyarat.
- Create program menolak beberapa field state yang seharusnya dihasilkan
  workflow.
- Path OpenAPI untuk koleksi biaya dan hapus foto telah disesuaikan.
- CORS mencantumkan `PUT`.

### Masih terbuka atau perlu ditinjau

- Create survey masih menerima status `DIVERIFIKASI`/`DIKONVERSI`; operator juga
  masih dapat mengirim `DIKONVERSI`.
- Review survey yang disetujui belum mengisi `verifiedById` dan `verifiedAt`.
- Riwayat dan assignment program, serta daftar/unduh dokumen biaya, belum
  konsisten membatasi akses berdasarkan kepemilikan operator.
- GET link survey belum memeriksa kepemilikan survey.
- Cache idempotency masih dapat me-replay response sebelum handler memvalidasi
  sesi.
- `operatorPengelolaId` pada create program belum divalidasi sebagai operator
  aktif.
- Validasi `programId` link survey belum menolak angka negatif atau pecahan.
- Pemeriksaan detail program berpotensi menolak role Pimpinan, padahal matriks
  akses proyek menyebut Pimpinan dapat melihat detail kegiatan.

### Kesimpulan re-audit

Sebagian temuan awal sudah diperbaiki, tetapi API belum sepenuhnya siap: masih
ada celah akses dan aturan workflow yang perlu ditutup. Test regression untuk
temuan-temuan ini belum terlihat pada pemeriksaan statis ini. Test suite,
type-check, dan lint belum dijalankan.

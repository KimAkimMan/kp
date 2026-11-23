# SIPANTAU — Panduan Lengkap Proyek

**Sistem Informasi Pemantauan Program PSU Kabupaten Kuningan**

Dokumen ini menjelaskan secara menyeluruh: apa yang dikerjakan aplikasi, siapa
penggunanya, fitur apa saja yang tersedia, bagaimana alur bisnisnya dari ujung
ke ujung, serta bagaimana aplikasi dibangun secara teknis.

| Item | Keterangan |
| --- | --- |
| Nama produk | **SIPANTAU** (Pemantauan PSU Kuningan) |
| Instansi | Dinas Perumahan, Kawasan Permukiman dan Pertanahan (Disperkimtan) Kab. Kuningan |
| Jenis aplikasi | Aplikasi web full-stack, modular monolith |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript 5 |
| Database | MariaDB/MySQL via Prisma 7 |
| Status dokumen | Gambaran produk & teknis, 23 November 2026 |

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Masalah yang Diselesaikan](#2-latar-belakang--masalah-yang-diselesaikan)
3. [Pengguna & Hak Akses](#3-pengguna--hak-akses)
4. [Peta Fitur](#4-peta-fitur)
5. [Fitur Publik (Tanpa Login)](#5-fitur-publik-tanpa-login)
6. [Autentikasi & Sesi](#6-autentikasi--sesi)
7. [Dashboard per Peran](#7-dashboard-per-peran)
8. [Master Kegiatan (Admin)](#8-master-kegiatan-admin)
9. [Data Kegiatan & Detail Program](#9-data-kegiatan--detail-program)
10. [Penugasan Operator](#10-penugasan-operator)
11. [Jadwal, Target, Progres & Verifikasi](#11-jadwal-target-progres--verifikasi)
12. [Anggaran, Biaya & Dokumen Bukti](#12-anggaran-biaya--dokumen-bukti)
13. [Survey Lapangan](#13-survey-lapangan)
14. [Verifikasi & Konversi Survey (Admin)](#14-verifikasi--konversi-survey-admin)
15. [Arahan Pimpinan & Balasan](#15-arahan-pimpinan--balasan)
16. [Laporan & Ekspor](#16-laporan--ekspor)
17. [Manajemen Pengguna](#17-manajemen-pengguna)
18. [Profil & Notifikasi](#18-profil--notifikasi)
19. [Dokumentasi Publik](#19-dokumentasi-publik)
20. [Alur Bisnis End-to-End](#20-alur-bisnis-end-to-end)
21. [Aturan Bisnis & Invariant](#21-aturan-bisnis--invariant)
22. [Arsitektur Aplikasi](#22-arsitektur-aplikasi)
23. [Teknologi yang Digunakan](#23-teknologi-yang-digunakan)
24. [Model Data](#24-model-data)
25. [Permukaan API](#25-permukaan-api)
26. [Keamanan](#26-keamanan)
27. [Struktur Folder](#27-struktur-folder)
28. [Menjalankan Aplikasi](#28-menjalankan-aplikasi)
29. [Status Implementasi & Catatan Teknis](#29-status-implementasi--catatan-teknis)
30. [Glosarium](#30-glosarium)

---

## 1. Ringkasan Eksekutif

SIPANTAU adalah aplikasi web untuk **memantau pekerjaan Penataan dan
Peningkatan Sarana dan Utilitas Umum (PSU)** di Kabupaten Kuningan — mulai dari
usulan hasil survey lapangan, penetapan kegiatan, penugasan operator,
pencatatan progres fisik dan biaya, verifikasi oleh admin, hingga pelaporan
dan publikasi dokumentasi kepada masyarakat.

Inti nilai aplikasi:

- **Satu sumber data.** Semua kegiatan, realisasi fisik, penggunaan anggaran,
  bukti foto, dan riwayat perubahan tersimpan di satu database — bukan
  tersebar di spreadsheet atau grup chat.
- **Ada kontrol berlapis.** Operator menginput, admin memverifikasi. Angka
  realisasi dan biaya baru masuk ke total program setelah disetujui, sehingga
  laporan tidak bisa "naik sendiri".
- **Bisa dipertanggungjawabkan.** Setiap perubahan penting meninggalkan jejak:
  riwayat progres, riwayat status survey, riwayat penugasan, dan `AuditLog`.
- **Transparan ke publik.** Masyarakat dapat melihat daftar program yang
  selesai beserta dokumentasi foto tanpa harus login.
- **Fleksibel untuk tiga level pengguna.** Admin mengelola data induk,
  operator bekerja di lapangan, pimpinan memantau dan memberi arahan.

Aplikasi berjalan sebagai **satu proses Next.js**: halaman React dan endpoint
`/api/*` berada dalam satu basis kode, dengan lapisan
`route → service → repository → Prisma` yang konsisten.

---

## 2. Latar Belakang & Masalah yang Diselesaikan

Pekerjaan PSU (jalan lingkungan, drainase, trotoar, dan konstruksi lain)
melibatkan banyak pihak dan berlangsung bertahap. Tanpa sistem, masalah yang
umum muncul:

| Masalah manual | Penanganan di SIPANTAU |
| --- | --- |
| Data survey lapangan berupa kertas/Excel terpisah | Form survey digital dengan koordinat, foto, dan estimasi biaya |
| Usulan survey tidak jelas statusnya | Alur status survey 6 tahap + riwayat status |
| Progres pekerjaan dilaporkan lewat chat | Progres diinput operator, diverifikasi admin, tersimpan per tahap |
| Realisasi bisa "diklaim" tanpa bukti | Verifikasi wajib; foto progres dan biaya menjadi lampiran |
| Pemakaian anggaran tidak terkontrol | Pagu, penggunaan, dan sisa dihitung; verifikasi biaya dibatasi pagu |
| Pimpinan sulit melihat kondisi terkini | Dashboard ringkas + laporan yang bisa diekspor |
| Masyarakat tidak tahu hasil pekerjaan | Landing publik berisi program selesai + galeri dokumentasi |
| Tidak ada jejak siapa mengubah apa | Riwayat progres, riwayat status, penugasan, `AuditLog` |

---

## 3. Pengguna & Hak Akses

Aplikasi memiliki **tiga peran** (`UserRole`):

| Peran | Posisi | Fokus pekerjaan |
| --- | --- | --- |
| **Admin** | Pengelola sistem / dinas | Data induk, verifikasi, konversi survey, pengguna, laporan |
| **Operator** | Petugas lapangan | Survey, mengambil kegiatan, input progres & biaya, unggah foto |
| **Pimpinan** | Kepala dinas / pejabat | Monitoring, arahan, laporan |

### 3.1 Menu per peran

**Admin**

```
Dashboard Admin · Manajemen Pengguna · Master Kegiatan ·
Hasil Survey Operator · Data Kegiatan · Laporan · Profil & Notifikasi
```

**Operator**

```
Dashboard Operator · Form Survey Lapangan · Data Kegiatan ·
Riwayat Progres · Laporan · Profil & Notifikasi
```

**Pimpinan**

```
Dashboard Pimpinan · Data Kegiatan · Laporan · Profil & Notifikasi
```

### 3.2 Matriks kemampuan

| Kemampuan | Admin | Operator | Pimpinan |
| --- | :---: | :---: | :---: |
| Melihat landing publik | ✅ | ✅ | ✅ |
| Login / logout / lihat sesi sendiri | ✅ | ✅ | ✅ |
| Melihat dashboard | ✅ | ✅ | ✅ |
| Melihat daftar & detail kegiatan | ✅ | ✅ | ✅ |
| Membuat / mengubah / menghapus kegiatan | ✅ | — | — |
| Menetapkan operator pengelola | ✅ | — | — |
| Mengambil kegiatan (`claim`) | — | ✅ | — |
| Mengisi jadwal, target, kontrak | ✅ | ✅ (terbatas) | — |
| Input progres + foto | ✅ | ✅ | — |
| Verifikasi / tolak progres | ✅ | — | — |
| Input biaya + dokumen | ✅ | ✅ | — |
| Verifikasi / tolak biaya | ✅ | — | — |
| Melihat riwayat progres | ✅ | ✅ | ✅ |
| Membuat & mengubah survey | ✅ | ✅ | — |
| Verifikasi / tolak / minta revisi survey | ✅ | — | — |
| Konversi survey → program | ✅ | — | — |
| Melihat hasil survey operator | ✅ | — | — |
| Membuat arahan | — | — | ✅ |
| Membalas arahan | ✅ | ✅ | ✅ |
| Menandai arahan selesai | ✅ | ✅ | — |
| Melihat & mengekspor laporan | ✅ | ✅ | ✅ |
| Mengelola pengguna & reset password | ✅ | — | — |
| Melihat dokumentasi publik | ✅ | ✅ | ✅ |

> Catatan: beberapa pembatasan tambahan (misalnya operator hanya boleh
> mengubah field tertentu pada program) diterapkan di lapisan service, bukan
> hanya disembunyikan di UI.

---

## 4. Peta Fitur

```
SIPANTAU
│
├── Publik
│   ├── Landing page (ringkasan, daftar program selesai, filter tahun/kategori)
│   └── Galeri dokumentasi foto
│
├── Autentikasi
│   ├── Login (email + password)
│   ├── Logout
│   └── Pemulihan sesi (GET /auth/me)
│
├── Dashboard (3 varian peran)
│   ├── Kartu statistik
│   ├── Grafik ringkasan
│   ├── Peta lokasi kegiatan
│   ├── Notifikasi arahan
│   └── Capaian per kategori (Pimpinan)
│
├── Data Kegiatan (Program)
│   ├── Daftar + filter status/kecamatan + pencarian + urutan
│   ├── Detail lengkap (kontrak, jadwal, progres, biaya, riwayat, foto)
│   ├── Master Kegiatan (CRUD oleh Admin)
│   ├── Claim oleh Operator
│   ├── Penugasan (assign / accept / release)
│   ├── Jadwal & target
│   ├── Progres + foto + verifikasi
│   ├── Biaya + dokumen + verifikasi
│   └── Tandai selesai
│
├── Survey Lapangan
│   ├── Form survey (kondisi, dimensi, urgensi, koordinat, foto)
│   ├── Daftar & filter survey
│   ├── Edit / hapus
│   ├── Verifikasi / tolak / minta revisi
│   └── Konversi survey → program
│
├── Arahan Pimpinan
│   ├── Buat arahan
│   ├── Balasan (thread)
│   └── Status tindak lanjut
│
├── Laporan
│   ├── Ringkasan agregat
│   ├── Filter tahun
│   └── Ekspor Excel / Word / PDF
│
├── Pengguna
│   ├── CRUD pengguna
│   ├── Aktivasi / nonaktivasi
│   └── Reset password
│
└── Profil
    ├── Data akun
    └── Notifikasi arahan
```

---

## 5. Fitur Publik (Tanpa Login)

Halaman pertama yang dilihat pengunjung adalah **landing page** yang tidak
memerlukan autentikasi.

### 5.1 Hero & identitas

- Nama instansi dan deskripsi singkat program PSU.
- Visual beranda dengan rotasi sorotan (hero) program.
- Navigasi menuju bagian proyek dan dokumentasi.

### 5.2 Kartu ringkasan

Empat kartu utama dihitung dari data publik yang tersedia:

| Kartu | Isi |
| --- | --- |
| **Program aktif** | Jumlah kegiatan berstatus sedang dikerjakan |
| **Program selesai** | Jumlah kegiatan berstatus selesai |
| **Total pagu** | Akumulasi pagu anggaran program yang ditampilkan |
| **Total penggunaan** | Akumulasi realisasi penggunaan anggaran |

### 5.3 Daftar proyek

- Kartu program berisi nama, kategori, lokasi, kecamatan/desa, status,
  target, realisasi, pagu, dan penggunaan.
- **Filter tahun anggaran** dan **filter kategori**.
- Klik kartu untuk melihat detail; jika belum login, pengunjung diarahkan ke
  halaman login (alur "pilih proyek → login").
- Mendukung kondisi memuat, kosong, dan gagal memuat data dengan tombol coba
  ulang — bukan menampilkan data palsu.

### 5.4 Galeri dokumentasi

- Foto dokumentasi dari program yang telah selesai.
- Ditampilkan sebagai grid/galeri dengan keterangan program.
- Diambil dari `GET /api/public/documentation`.

### 5.5 Peta & kontak instansi

- Peta interaktif (Leaflet + OpenStreetMap) yang menampilkan area Kabupaten
  Kuningan dan lokasi kantor Disperkimtan.
- Alamat lengkap serta tautan "Buka di Maps".
- Tidak memerlukan API key pihak ketiga.

> Data publik sengaja dibatasi: endpoint publik tidak membuka data operator,
> kontrak, atau dokumen internal. Yang ditampilkan hanya DTO publik.

---

## 6. Autentikasi & Sesi

### 6.1 Login

1. Pengguna membuka halaman login dari landing page.
2. Mengirim email + password ke `POST /api/auth/login`.
3. Server memvalidasi, membuat JWT HS256, dan menyimpan **hash** token di tabel
   `Session`.
4. JWT dikirim sebagai cookie `kp_session` (`HttpOnly`, `SameSite=Lax`,
   `Secure` di produksi, umur 7 hari).
5. Respons juga menyertakan `accessToken` agar klien non-browser (mis. mobile
   atau integrasi) bisa memakai header `Authorization: Bearer <token>`.

### 6.2 Proteksi brute force

- Login dibatasi per kombinasi IP + email (`modules/auth/rate-limit`).
- Percobaan berlebihan menghasilkan `429 RATE_LIMITED` beserta
  `retryAfterSeconds`.
- Login sukses menghapus penghitung kegagalan.

### 6.3 Validasi sesi

Setiap request terproteksi melewati `requireUser()` / `requireRole(...)`:

1. Ambil token dari cookie atau header `Authorization`.
2. Verifikasi tanda tangan dan masa berlaku JWT.
3. Cocokkan hash token dengan tabel `Session`.
4. Pastikan sesi belum kedaluwarsa/dicabut.
5. Pastikan user masih ada, aktif, dan belum dihapus (soft delete).

User nonaktif atau terhapus langsung kehilangan akses meskipun tokennya masih
secara kriptografis valid.

### 6.4 Logout

`POST /api/auth/logout` mencabut sesi di database dan menghapus cookie.

### 6.5 Pemulihan sesi

Saat halaman dimuat ulang, frontend memanggil `GET /api/auth/me` untuk
memulihkan identitas pengguna tanpa meminta login ulang.

---

## 7. Dashboard per Peran

Dashboard adalah halaman pertama setelah login dan isinya menyesuaikan peran.

### 7.1 Dashboard Admin

- Jumlah kegiatan total, sedang dikerjakan, dan selesai.
- Sisa anggaran dari seluruh pagu.
- Total data survey dan jumlah kondisi rusak sedang/berat.
- Estimasi kebutuhan usulan dari survey.
- Daftar kegiatan terbaru dan yang perlu perhatian.
- Notifikasi arahan pimpinan.
- Grafik ringkasan capaian.
- Pintasan ke Master Kegiatan, Hasil Survey, dan Laporan.

### 7.2 Dashboard Operator

- Hanya menghitung kegiatan yang menjadi tanggung jawabnya (berdasarkan
  assignment/claim).
- Progres terkini, target vs realisasi, dan sisa target.
- Banner arahan pimpinan yang ditujukan kepadanya (termasuk arahan yang belum
  ditugaskan).
- Pintasan ke Form Survey dan Data Kegiatan.

### 7.3 Dashboard Pimpinan

- Ringkasan capaian seluruh program.
- **Capaian per kategori**: target, realisasi, persentase, status.
- Grafik ringkasan (Chart.js).
- Notifikasi arahan yang pernah dibuat/dibalas.
- Pintasan ke Laporan.

### 7.4 Komponen dashboard

| Komponen | Fungsi |
| --- | --- |
| Kartu statistik | Angka kunci dengan label kontekstual |
| `SimpleBarChart` / `Charts.tsx` | Visualisasi capaian dan distribusi |
| `PimpinanAchievementSection` | Tabel capaian per kategori untuk pimpinan |
| Panel notifikasi | Arahan dan tindak lanjut |
| `LeafletMap` | Peta lokasi kantor dinas (dipakai di landing publik) |

---

## 8. Master Kegiatan (Admin)

**Master Kegiatan** adalah daftar induk seluruh pekerjaan PSU. Di sini Admin
membuat "kerangka" kegiatan sebelum operator bekerja.

### 8.1 Daftar master

Kolom utama:

```
Tahun/SPK · Nama Kegiatan · Kategori · Lokasi · Pagu Anggaran ·
Target Volume · Realisasi · Penanggung Jawab · Aksi
```

Fitur:

- Pencarian dan pengurutan.
- Filter status dan kecamatan.
- Indikator capaian (target vs realisasi).
- Aksi buka detail dan hapus (soft delete).

### 8.2 Membuat / mengubah kegiatan

Form kegiatan (`ActivityModal`) memuat:

| Kelompok | Field |
| --- | --- |
| Identitas | Kode kegiatan, nama kegiatan, kategori, periode/tahun |
| Lokasi | Kecamatan, desa/kelurahan, detail lokasi |
| Anggaran | Pagu anggaran, satuan, target volume |
| Pelaksana | Operator pengelola, penanggung jawab dinas |
| Kontrak | Penyedia, direktur, nomor kontrak, nilai kontrak |
| Jadwal | Tanggal mulai, tanggal selesai, jadwal tekstual |
| Teknis | Lebar jalan, kondisi jalan, catatan |

Validasi dilakukan di server (`program.schema.ts`): kode wajib dan unik, angka
anggaran non-negatif, tanggal valid, dan field enum harus salah satu nilai yang
diizinkan.

### 8.3 Hapus kegiatan

Penghapusan bersifat **soft delete**: `deletedAt` diisi, data tetap tersimpan
untuk audit, dan tidak muncul lagi di daftar maupun laporan.

---

## 9. Data Kegiatan & Detail Program

### 9.1 Daftar kegiatan

Halaman **Data Kegiatan** menampilkan program dalam bentuk kartu/tabel dengan:

- Filter status: semua, belum dikerjakan, sedang dikerjakan, selesai.
- Filter kecamatan.
- Pencarian nama/kode.
- Urutan: terbaru, terlama, nama A–Z, nama Z–A.
- Ringkasan pagu, penggunaan, dan capaian.
- Tombol menuju detail, jadwal, dan riwayat.

Operator melihat seluruh kegiatan yang relevan, tetapi hanya dapat mengubah
kegiatan yang menjadi tanggung jawabnya.

### 9.2 Detail program

`DetailView` menampilkan satu program secara lengkap:

| Bagian | Isi |
| --- | --- |
| Identitas | Kode, nama, kategori, status pekerjaan |
| Lokasi | Alamat lengkap, kecamatan, desa, detail ruas/blok |
| Pelaksana | Penanggung jawab dinas, operator pengelola |
| Kontrak | Penyedia/CV, direktur, nomor kontrak, nilai kontrak |
| Waktu | Periode, jadwal, tanggal mulai/selesai |
| Anggaran | Pagu, penggunaan, sisa |
| Fisik | Satuan, target, realisasi, capaian persentase |
| Sumber | Sumber pembaruan data dan catatan |
| Lampiran | Foto progres dan dokumentasi |

### 9.3 Riwayat progres

`HistoryView` menampilkan linimasa progres:

```
Tanggal Update · Tahap Pekerjaan · Nilai Realisasi · Keterangan ·
Dokumentasi · Penginput
```

- Hanya entri yang sudah **diverifikasi** yang memengaruhi realisasi program.
- Foto dapat dibuka melalui lightbox dan diunduh.
- Berguna untuk audit "kapan angka ini berubah dan oleh siapa".

---

## 10. Penugasan Operator

Ada dua jalur penugasan:

### 10.1 Claim oleh operator (self-service)

- Operator membuka kegiatan yang belum punya pengelola lalu menekan **Ambil
  Kegiatan**.
- Backend melakukan `updateMany` dengan syarat `operatorPengelolaId = null`
  sehingga **atomik**: dua operator yang menekan bersamaan tidak bisa
  sama-sama berhasil.
- Setelah berhasil, operator menjadi penanggung jawab dan tercatat di
  assignment.

### 10.2 Penugasan oleh admin

Admin dapat menetapkan operator melalui `POST /programs/{id}/assignments`.

Status assignment (`ProgramAssignmentStatus`):

| Status | Arti |
| --- | --- |
| `DITUGASKAN` | Admin menugaskan, operator belum merespons |
| `DITERIMA` | Operator menerima penugasan |
| `DITOLAK` | Penugasan ditolak operator |
| `DILEPAS` | Penugasan dilepas/dikembalikan |

Endpoint pendukung:

```
GET    /api/programs/{id}/assignments
POST   /api/programs/{id}/assignments
POST   /api/programs/{id}/assignments/{assignmentId}   → terima
PATCH  /api/programs/{id}/assignments/{assignmentId}   → lepas
DELETE /api/programs/{id}/assignments/{assignmentId}
```

Saat admin mengganti operator, assignment lama dilepas dan assignment baru
dibuat — bukan menimpa riwayat.

### 10.3 Konversi survey

Saat survey dikonversi menjadi program, assignment otomatis dibuat dengan
status `DITERIMA` untuk operator yang ditunjuk (atau surveyor asal bila tidak
ada operator lain). Artinya program hasil survey langsung punya penanggung
jawab.

---

## 11. Jadwal, Target, Progres & Verifikasi

Ini adalah jantung aplikasi: bagaimana realisasi fisik dicatat dan disetujui.

### 11.1 Pengaturan jadwal & target

Halaman **Jadwal** (`ScheduleView`) dipakai untuk:

- Melihat target awal, target berjalan, realisasi terakhir, sisa target.
- Mengubah target/jadwal/kontrak (sesuai izin peran).
- Menginput progres baru.
- Menandai kegiatan selesai.
- Melihat dan memverifikasi progres/biaya (admin).

### 11.2 Input progres

Form progres meminta:

| Field | Keterangan |
| --- | --- |
| Tanggal | Tanggal pelaksanaan |
| Tahap pekerjaan | Mis. galian, pemasangan, pengecoran |
| Volume/nilai capaian | Angka realisasi |
| Satuan | Satuan pekerjaan |
| Keterangan | Uraian pekerjaan |
| Foto | 1–3 foto dokumentasi (maks. 2 MB per foto) |

Alur unggah:

```
1. Klien minta presigned URL   → POST /programs/{id}/progress  { action: "presign" }
2. Klien upload langsung ke R2 → HTTP PUT ke presigned URL
3. Klien menyimpan progres     → POST /programs/{id}/progress  { action: "complete", ... }
```

Dengan cara ini file besar tidak melewati server aplikasi.

### 11.3 Verifikasi progres

Hanya **Admin** yang dapat memverifikasi (`PATCH /progress/{progressId}/verify`).

```
DIAJUKAN ──approve──► DIVERIFIKASI  (realisasi program bertambah)
    │
    └────reject───► DITOLAK        (wajib alasan, realisasi tidak berubah)
```

Yang terjadi saat approve:

1. Baris progres dikunci (`SELECT ... FOR UPDATE`) agar tidak ada verifikasi
   ganda/balapan.
2. Total realisasi dihitung **kumulatif** dari seluruh entri terverifikasi.
3. Jika total melebihi target → ditolak (`REALISASI_MELEBIHI_TARGET`).
4. `Program.realisasi` diperbarui.
5. Bila total ≥ target → status menjadi `SELESAI_DIKERJAKAN` dan
   `tanggalSelesai` diisi.
6. `ProgramHistory` mencatat perubahan.
7. `verifiedById` dan `verifiedAt` diisi.

Saat reject:

- `status = DITOLAK`, `rejectionReason` wajib diisi.
- Realisasi program **tidak berubah**.

### 11.4 Tandai selesai

`POST /programs/{id}/complete` dipakai untuk menyatakan pekerjaan selesai.
Aksi ini:

- Menolak jika realisasi belum mencapai target.
- Menolak jika program sudah selesai (idempoten secara status).
- Mengisi `tanggalSelesai`.
- Mencatat `ProgramHistory`.
- Mendukung lampiran foto penyelesaian.

### 11.5 Riwayat & audit

Setiap perubahan status, realisasi, atau penyelesaian menghasilkan entri
`ProgramHistory`:

```
fromStatus → toStatus · aktor · waktu · catatan
```

---

## 12. Anggaran, Biaya & Dokumen Bukti

### 12.1 Mencatat biaya

Operator atau admin menambahkan entri biaya:

| Field | Keterangan |
| --- | --- |
| Tanggal | Tanggal transaksi |
| Uraian | Deskripsi biaya |
| Nominal | Jumlah rupiah |
| Kategori | Klasifikasi biaya (opsional) |
| Bukti | Dokumen pendukung (opsional saat input) |

Biaya masuk dengan status `DIAJUKAN`.

### 12.2 Verifikasi biaya

`PATCH /costs/{costId}` (Admin):

```
DIAJUKAN ──approve──► DIVERIFIKASI  (penggunaan program bertambah)
    │
    └────reject───► DITOLAK      (wajib alasan)
```

Saat approve, sistem:

1. Mengunci baris biaya.
2. Menghitung sisa pagu: `pagu − penggunaan`.
3. Menolak jika nominal melebihi sisa pagu (`PAGU_TERLAMPAUI`).
4. Mengubah status secara atomik (`updateMany` dengan syarat status masih
   `DIAJUKAN`) sehingga approve ganda tidak mungkin.
5. Menambah `penggunaan` dan `penggunaanBiaya` program.

### 12.3 Dokumen bukti

Biaya mendukung banyak dokumen (`ProgramCostDocument`, ID CUID):

```
POST   /api/costs/{costId}/documents/presign    → minta URL unggah
POST   /api/costs/{costId}/documents/complete   → simpan metadata
GET    /api/costs/{costId}                      → detail biaya + daftar dokumen
GET    /api/costs/{costId}/documents/{documentId}/download
DELETE /api/costs/{costId}/documents/{documentId}
```

Dokumen menyimpan `storageKey`, nama asli, MIME, ukuran, dan pengunggah.
Unduhan memakai presigned URL agar bucket tetap privat.

---

## 13. Survey Lapangan

Survey adalah pintu masuk usulan kegiatan: operator mendata kondisi riil di
lapangan, lalu admin memverifikasi dan mengubahnya menjadi program.

### 13.1 Form survey

| Kelompok | Field |
| --- | --- |
| Identitas | Kode survey, tanggal, surveyor |
| Lokasi | Kecamatan, desa/kelurahan, detail ruas/blok, koordinat |
| Kondisi | Kondisi (Baik / Rusak Ringan / Rusak Sedang / Rusak Berat) |
| Dimensi | Panjang, lebar, luas/volume, satuan |
| Konstruksi | Tipe konstruksi (jalan lingkungan, drainase/TPT, lainnya) |
| Anggaran | Estimasi biaya |
| Prioritas | Tingkat urgensi (Rendah / Sedang / Tinggi–Mendesak) |
| Uraian | Temuan, rekomendasi, kontak pendamping |
| Bukti | Foto (1–3) |

Pemilihan lokasi dapat memakai peta (klik titik) sehingga koordinat tersimpan.

### 13.2 Daftar & statistik survey

`SurveyView` menampilkan:

- Total survey dilakukan.
- Jumlah titik lokasi terdata.
- Jumlah kondisi rusak sedang/berat.
- Jumlah survey selesai/siap diverifikasi.
- Total estimasi kebutuhan.
- Daftar survey dengan status, urgensi, dan tombol detail/edit/hapus.

### 13.3 Status survey

`SurveyStatus` memiliki **6 tahap**:

```
DRAFT
  └─► SELESAI_SURVEY
        └─► MENUNGGU_VERIFIKASI
              ├─► DIVERIFIKASI ─► DIKONVERSI
              └─► PERLU_REVISI ─► (operator perbaiki) ─► ...
```

| Status | Arti |
| --- | --- |
| `DRAFT` | Masih disusun |
| `SELESAI_SURVEY` | Data lapangan lengkap |
| `MENUNGGU_VERIFIKASI` | Menunggu pemeriksaan admin |
| `PERLU_REVISI` | Dikembalikan untuk diperbaiki |
| `DIVERIFIKASI` | Disetujui admin |
| `DIKONVERSI` | Sudah menjadi program |

Setiap perpindahan status dicatat di `SurveyStatusHistory`.

### 13.4 Edit & hapus

- Operator hanya boleh mengubah survey miliknya.
- Perubahan kepemilikan (`surveyorId`) dan tautan program (`programId`)
  dibatasi di service.
- Hapus bersifat soft delete.

### 13.5 Foto survey

Mengikuti pola presign yang sama:

```
POST /api/surveys/{id}/photos/presign
PUT  ke presigned URL
POST /api/surveys/{id}/photos/complete
GET  /api/surveys/{id}/photos
GET  /api/surveys/photos/{photoId}/download
```

Server memverifikasi MIME dan ukuran sebelum metadata disimpan.

---

## 14. Verifikasi & Konversi Survey (Admin)

### 14.1 Halaman "Hasil Survey Operator"

`AdminSurveyView` adalah meja kerja admin untuk survey:

- Daftar survey beserta filter kategori, urgensi, kecamatan, dan status
  konversi (belum/sudah dikonversi).
- Statistik: berapa yang belum dikonversi, sudah dikonversi, dan total.
- Detail survey lengkap (termasuk foto dan riwayat status).
- Pemilihan operator pengelola saat akan mengonversi.
- Aksi verifikasi dan konversi menjadi program.

### 14.2 Keputusan review

Backend menyediakan `POST /api/surveys/{id}/reviews` dengan tiga keputusan:

| Decision | Efek status | Catatan |
| --- | --- | --- |
| `DISETUJUI` | `DIVERIFIKASI` | Survey siap dikonversi |
| `PERLU_REVISI` | `PERLU_REVISI` | Operator harus memperbaiki |
| `DITOLAK` | `DRAFT` | Dikembalikan ke draft |

Setiap keputusan disertai `notes`, dicatat di `SurveyReview` dan
`SurveyStatusHistory`. Survey yang sudah `DIVERIFIKASI`/`DIKONVERSI` dikunci
dari review ulang (`SURVEY_LOCKED`).

Endpoint `POST /api/surveys/{id}/verify` tetap ada untuk alur lama (langsung
menyetujui, opsional menautkan ke program).

### 14.3 Konversi survey → program

`POST /api/surveys/{id}/convert` (Admin) menjalankan **satu transaksi**:

1. Validasi survey ada, belum dikonversi, dan berstatus `DIVERIFIKASI`.
2. Buat `Program` baru:
   - nama & kode dari input,
   - kategori/lokasi/kecamatan/desa/detail dari survey,
   - `target`, `targetAwal`, `targetVolume` dari input,
   - `pagu` dari input, `realisasi = 0`, `penggunaan = 0`,
   - status awal `BELUM_DIKERJAKAN`,
   - catatan berisi temuan + rekomendasi survey.
3. Set `survey.programId` dan ubah status survey menjadi `DIKONVERSI`.
4. Catat `SurveyStatusHistory`.
5. Buat `SurveyProgramLink` (`CONVERTED_TO_PROGRAM`).
6. Buat `ProgramAssignment` untuk operator (`DITERIMA`) bila ada.

Jika salah satu langkah gagal, seluruh transaksi dibatalkan — tidak ada
program "setengah jadi".

---

## 15. Arahan Pimpinan & Balasan

Arahan adalah mekanisme komunikasi terarah dari pimpinan ke pelaksana.

### 15.1 Membuat arahan

`POST /api/advice` (Pimpinan):

| Field | Keterangan |
| --- | --- |
| Program | Kegiatan yang dimaksud (opsional) |
| Operator | Penerima arahan (opsional; bisa "belum ditugaskan") |
| Isi | Instruksi/arahan |
| Prioritas/identitas | Ditetapkan sesuai schema |

### 15.2 Melihat arahan

`GET /api/advice` mendukung filter status, pencarian, operator, dan pagination.
Operator otomatis dibatasi pada arahan miliknya.

### 15.3 Balasan (thread)

```
GET/POST /api/advice/{id}/replies
PATCH    /api/advice/replies/{replyId}
```

Balasan dapat ditulis Admin, Operator, dan Pimpinan, sehingga diskusi tetap
menempel pada arahan aslinya.

### 15.4 Status tindak lanjut

`PATCH /api/advice/{id}` mengubah status:

- `BELUM_DITINDAKLANJUTI`
- `SUDAH_DITINDAKLANJUTI`

Status ini tampil di dashboard dan panel notifikasi.

---

## 16. Laporan & Ekspor

### 16.1 Ringkasan laporan

`GET /api/reports/summary` mengembalikan agregat:

- Jumlah kegiatan.
- Total pagu, total penggunaan, sisa anggaran.
- Distribusi status.
- Agregat per kategori (bila diminta).

Halaman laporan menampilkan rekap dalam tabel dan ringkasan angka.

### 16.2 Filter

- Tahun anggaran.
- Kategori (sesuai kebutuhan tampilan).
- Pencarian dan pengurutan pada tabel.

### 16.3 Ekspor

Tiga format, dihasilkan di sisi klien dari data yang sudah ditampilkan:

| Format | Library | Kegunaan |
| --- | --- | --- |
| Excel `.xlsx` | ExcelJS | Rekap untuk diolah lanjut |
| Word `.docx` | docx | Dokumen laporan resmi |
| PDF `.pdf` | jsPDF + AutoTable | Cetak/arsip siap tanda tangan |

Header dokumen memuat instansi, tahun anggaran, waktu cetak, dan nama petugas.

---

## 17. Manajemen Pengguna

Khusus Admin (`UsersView`).

### 17.1 Daftar pengguna

Kolom: nama lengkap, email, peran, status keaktifan, aksi.

### 17.2 Membuat / mengubah pengguna

- Nama, email (unik), password awal, peran (Admin/Operator/Pimpinan).
- Status aktif/nonaktif.
- Perubahan email divalidasi format dan keunikannya.

### 17.3 Reset password

`POST /api/users/{id}/reset-password` memungkinkan admin menetapkan password
baru tanpa mengetahui password lama. Password baru langsung di-hash dan
disimpan.

> Endpoint sudah tersedia dan terlindungi role Admin. Tombol khusus "Reset
> Password" di `UsersView` belum ada; saat ini tombol Reset yang terlihat
> adalah reset pencarian. Ini kandidat integrasi UI berikutnya.

### 17.4 Hapus pengguna

Soft delete: user tidak bisa login, tetapi riwayat pekerjaannya tetap utuh
karena relasi memakai `onDelete: SetNull`.

### 17.5 Keamanan password

- Disimpan sebagai hash `scrypt` dengan salt.
- Perbandingan memakai `timingSafeEqual`.
- Password asli tidak pernah dikembalikan API.
- Respons pengguna memakai `publicUserSelect` (tanpa `passwordHash`).

---

## 18. Profil & Notifikasi

`ProfileView` menampilkan:

- Nama lengkap, email, peran, status keaktifan.
- Kegiatan terkait (untuk operator).
- Panel notifikasi arahan.

Backend juga menyediakan:

```
PATCH /api/auth/profile          → ubah nama/email
POST  /api/auth/change-password  → ubah password (verifikasi password lama)
```

Berguna untuk pengembangan lanjutan: form ubah profil dan ubah password dapat
langsung memakai endpoint tersebut.

---

## 19. Dokumentasi Publik

`GET /api/public/documentation` mengumpulkan foto dokumentasi dari program yang
selesai, lengkap dengan metadata program (kode, nama, kategori, lokasi) dan
URL unduh.

Tujuan:

- Memberi bukti visual hasil pekerjaan kepada masyarakat.
- Menjadi arsip publik tanpa membuka dokumen internal.

---

## 20. Alur Bisnis End-to-End

### 20.1 Alur utama: dari survey sampai selesai

```
 ┌──────────────┐
 │   Operator   │
 └──────┬───────┘
        │ 1. Isi form survey (lokasi, kondisi, foto, estimasi)
        ▼
 ┌──────────────────────┐
 │ FieldSurvey (DRAFT → │
 │ SELESAI_SURVEY)      │
 └──────┬───────────────┘
        │ 2. Ajukan verifikasi
        ▼
 ┌──────────────┐   tolak / revisi   ┌──────────────┐
 │    Admin     │ ─────────────────► │   Operator   │
 └──────┬───────┘                    └──────┬───────┘
        │ 3. Setujui (DIVERIFIKASI)         │ perbaiki
        ▼                                   └──► kembali ke langkah 2
 ┌──────────────────────┐
 │ 4. Konversi menjadi  │
 │    Program + tugas   │
 └──────┬───────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────┐
 │ 5. Operator: jadwal, target, input progres   │
 │    (foto) + input biaya (dokumen)            │
 └──────┬───────────────────────────────────────┘
        │
        ▼
 ┌──────────────────────────────────────────────┐
 │ 6. Admin: verifikasi progres & biaya         │
 │    - progres → realisasi                     │
 │    - biaya   → penggunaan (≤ pagu)           │
 └──────┬───────────────────────────────────────┘
        │ 7. realisasi ≥ target
        ▼
 ┌──────────────────────┐
 │ SELESAI_DIKERJAKAN   │
 │ + tanggalSelesai     │
 └──────┬───────────────┘
        │
        ▼
 ┌──────────────────────┐
 │ Landing publik &     │
 │ galeri dokumentasi   │
 └──────────────────────┘
```

### 20.2 Alur kegiatan yang sudah ada (tanpa survey)

```
Admin membuat Master Kegiatan
        │
        ├─► menetapkan operator  ──► Operator menerima
        │
        └─► Operator claim sendiri ──► Operator menjadi pengelola
                     │
                     ▼
        Input progres → verifikasi → realisasi naik
        Input biaya   → verifikasi → penggunaan naik
                     │
                     ▼
             Tandai selesai / auto-selesai
```

### 20.3 Alur arahan

```
Pimpinan membuat arahan
        │
        ▼
Operator/Admin melihat notifikasi
        │
        ├─► membalas (thread)
        └─► menandai SUDAH_DITINDAKLANJUTI
```

### 20.4 Alur pengunjung publik

```
Landing page
   │  lihat ringkasan & daftar program selesai
   │  filter tahun/kategori
   │  buka galeri dokumentasi
   │
   └─► klik proyek → diarahkan login → dashboard
```

---

## 21. Aturan Bisnis & Invariant

Aturan berikut dijaga di lapisan service/repository, bukan hanya di UI.

### 21.1 Realisasi

| Aturan | Penegakan |
| --- | --- |
| Realisasi hanya bertambah dari progres **terverifikasi** | `program-progress.repository.verify` |
| Total realisasi tidak boleh melebihi target | Dihitung kumulatif + kunci baris |
| Verifikasi ganda tidak mungkin | `SELECT ... FOR UPDATE` + status check |
| Penolakan wajib alasan | `rejectionReason` divalidasi |

### 21.2 Anggaran

| Aturan | Penegakan |
| --- | --- |
| Penggunaan hanya bertambah dari biaya **disetujui** | `program-cost.service.verify` |
| Total penggunaan ≤ pagu | Cek sisa pagu sebelum update |
| Approve ganda tidak mungkin | `updateMany` atomik dengan syarat status |
| Nominal non-negatif | Validasi schema |

### 21.3 Status program

```
BELUM_DIKERJAKAN → SEDANG_DIKERJAKAN → SELESAI_DIKERJAKAN
```

- `SELESAI_DIKERJAKAN` hanya sah bila realisasi ≥ target.
- `tanggalSelesai` diisi bersamaan dengan status selesai.
- Status tidak boleh diubah sembarangan lewat input progres.

### 21.4 Survey

| Aturan | Penegakan |
| --- | --- |
| Hanya survey `DIVERIFIKASI` yang bisa dikonversi | `convertToProgram` |
| Satu survey hanya bisa dikonversi sekali | Cek `survey.programId` |
| Survey terverifikasi/terkonversi dikunci dari review ulang | `SURVEY_LOCKED` |
| Operator hanya mengubah survey miliknya | Pengecekan kepemilikan di service |
| Perubahan status selalu tercatat | `SurveyStatusHistory` |

### 21.5 Penugasan

| Aturan | Penegakan |
| --- | --- |
| Claim bersifat atomik | `updateMany` dengan `operatorPengelolaId: null` |
| Satu program satu pengelola aktif | Assignment aktif dilepas saat ganti |
| Riwayat penugasan tidak dihapus | Status `DILEPAS`, bukan delete |

### 21.6 Data & audit

| Aturan | Penegakan |
| --- | --- |
| Hapus data = soft delete | `deletedAt` + `deletedById` |
| Setiap mutasi penting tercatat | `ProgramHistory`, `SurveyStatusHistory`, `AuditLog` |
| ID dokumen/foto adalah CUID | Tidak dikonversi ke angka di frontend |
| Respons user tidak memuat `passwordHash` | `publicUserSelect` |

---

## 22. Arsitektur Aplikasi

### 22.1 Gaya arsitektur

**Modular monolith**: satu aplikasi deploy, tetapi kode dipisah per domain
bisnis dengan batas tanggung jawab yang tegas.

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser / React                        │
│  app/page.tsx · components/views · components/Modals          │
└───────────────────────────┬──────────────────────────────────┘
                            │  hanya lewat API client
┌───────────────────────────▼──────────────────────────────────┐
│  modules/<domain>/*.client.ts  →  lib/api/client.ts           │
│  (DTO, endpoint, error handling, idempotency)                 │
└───────────────────────────┬──────────────────────────────────┘
                            │  HTTP /api/*
┌───────────────────────────▼──────────────────────────────────┐
│  app/api/<domain>/route.ts                                     │
│  handleRoute · requireUser/requireRole · schema parser         │
└───────────────────────────┬──────────────────────────────────┘
┌───────────────────────────▼──────────────────────────────────┐
│  modules/<domain>/*.service.ts     aturan bisnis, transaksi    │
├───────────────────────────────────────────────────────────────┤
│  modules/<domain>/*.repository.ts  satu-satunya akses Prisma   │
└───────────────────────────┬──────────────────────────────────┘
┌───────────────────────────▼──────────────────────────────────┐
│                Prisma 7  +  adapter MariaDB                    │
└───────────────────────────┬──────────────────────────────────┘
                            ▼
                       MariaDB / MySQL
```

### 22.2 Aturan dependensi

1. **Route tipis.** Route hanya: parse request, cek auth, panggil service,
   bentuk respons.
2. **Service memiliki aturan bisnis.** Transaksi, validasi invariant, dan
   orkestrasi antar-repository ada di sini.
3. **Repository satu-satunya pemegang Prisma.** Route/komponen tidak boleh
   mengimpor Prisma langsung.
4. **Frontend hanya lewat client.** Komponen tidak memanggil `fetch` ke
   endpoint internal secara langsung.
5. **Kontrak API stabil.** Perubahan backend harus disertai pembaruan tipe,
   mapper, dokumentasi, dan test.

### 22.3 Domain yang ada

| Domain | Tanggung jawab |
| --- | --- |
| `auth` | Login, logout, sesi, profil, ubah password, rate limit |
| `users` | CRUD pengguna, reset password |
| `programs` | Program, progres, biaya, assignment, riwayat |
| `surveys` | Survey, foto, review, konversi, link, riwayat status |
| `advice` | Arahan pimpinan, balasan, status |
| `reports` | Agregasi laporan |
| `reference-data` | Kategori, satuan, periode, kecamatan, desa |
| `storage` | Presigned upload/download, mock storage |
| `system` | Health/ready check |

### 22.4 Envelope respons

```jsonc
// sukses
{ "data": { ... } }

// sukses dengan pagination
{ "data": [ ... ], "meta": { "page": 1, "pageSize": 25, "total": 120, "totalPages": 5 } }

// error
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "requestId": "..." } }
```

Kode error yang umum: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`,
`NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`, serta kode domain
seperti `SURVEY_NOT_VERIFIED`, `PAGU_TERLAMPAUI`, `PROGRAM_NOT_FOUND`.

### 22.5 Ketahanan request

- `handleRoute` membungkus handler: menangkap error, memetakan ke status HTTP,
  menambahkan `requestId`.
- `Idempotency-Key` didukung untuk mutasi: permintaan dengan kunci sama tidak
  dieksekusi dua kali.
- Batas waktu request diterapkan agar handler yang menggantung tidak
  menahan koneksi selamanya.
- `x-request-id` diteruskan dari `proxy.ts` untuk penelusuran log.

---

## 23. Teknologi yang Digunakan

| Lapisan | Teknologi | Catatan |
| --- | --- | --- |
| Framework | Next.js 16.4.6 (App Router) | `proxy.ts` menggantikan `middleware.ts` |
| UI | React 19.3, Tailwind CSS 4 | Desain responsif, komponen fungsional |
| Ikon | Lucide React | Ikon konsisten |
| Grafik | Chart.js | Bar chart capaian |
| Peta | Leaflet + OpenStreetMap | Tanpa API key |
| Bahasa | TypeScript 5 | Strict typing di backend |
| ORM | Prisma 7.10 | `prisma-client` generator |
| Driver DB | `@prisma/adapter-mariadb` | Runtime memakai adapter ini |
| Database | MariaDB / MySQL | `provider = "mysql"` |
| Auth | JWT HS256 + tabel Session | Cookie `kp_session`, HttpOnly |
| Hashing | Node `crypto.scrypt` | Tanpa dependensi eksternal |
| Storage | Cloudflare R2 / S3-compatible | Presigned PUT/GET |
| AWS SDK | `@aws-sdk/client-s3`, `s3-request-presigner` | Untuk presign |
| Excel | ExcelJS | Ekspor `.xlsx` |
| Word | docx | Ekspor `.docx` |
| PDF | jsPDF + jspdf-autotable | Ekspor `.pdf` |
| Testing | Vitest | 46 test, 12 file |
| Lint | ESLint 9 + `eslint-config-next` | 0 error |
| Dokumentasi API | OpenAPI 3 + Swagger UI | `/api/openapi`, `/api/docs` |

> Dependensi `@prisma/adapter-pg` dan `pg` masih terpasang tetapi tidak dipakai
> runtime (warisan percobaan PostgreSQL). Bisa dihapus saat perapian.

---

## 24. Model Data

### 24.1 Entitas inti

| Model | Fungsi |
| --- | --- |
| `User` | Akun pengguna (3 peran), soft delete |
| `Session` | Sesi aktif (hash token, kedaluwarsa) |
| `Program` | Kegiatan PSU: identitas, lokasi, kontrak, target, realisasi, pagu, penggunaan |
| `ProgramProgress` | Entri progres + foto + status verifikasi |
| `ProgramHistory` | Jejak perubahan program |
| `ProgramCost` | Entri biaya + status verifikasi |
| `ProgramCostDocument` | Dokumen bukti biaya |
| `ProgramAssignment` | Penugasan operator (ditugaskan/diterima/dilepas) |
| `FieldSurvey` | Survey lapangan |
| `SurveyPhoto` | Foto survey |
| `SurveyReview` | Keputusan review survey |
| `SurveyStatusHistory` | Jejak perpindahan status survey |
| `SurveyProgramLink` | Relasi survey ↔ program |
| `AdviceRecord` | Arahan pimpinan |
| `AdviceReply` | Balasan arahan |
| `AuditLog` | Log audit umum |
| `ProgramCategory` | Master kategori |
| `Unit` | Master satuan |
| `Kecamatan` | Master kecamatan |
| `Village` | Master desa/kelurahan |
| `Period` | Master periode/tahun |

### 24.2 Relasi utama

```
User ─┬─< Session
      ├─< Program (operatorPengelolaId, createdById)
      ├─< ProgramProgress (reportedById, verifiedById)
      ├─< ProgramCost (inputById, verifiedById)
      ├─< ProgramAssignment (operatorId, assignedById)
      ├─< FieldSurvey (surveyorId, verifiedById)
      └─< AdviceRecord / AdviceReply

Program ─┬─< ProgramProgress
         ├─< ProgramCost ─< ProgramCostDocument
         ├─< ProgramHistory
         ├─< ProgramAssignment
         ├─< FieldSurvey
         └─< SurveyProgramLink

FieldSurvey ─┬─< SurveyPhoto
             ├─< SurveyReview
             ├─< SurveyStatusHistory
             └─< SurveyProgramLink
```

### 24.3 Enum penting

```prisma
enum UserRole            { ADMIN OPERATOR PIMPINAN }
enum ProgramStatus       { BELUM_DIKERJAKAN SEDANG_DIKERJAKAN SELESAI_DIKERJAKAN }
enum ProgressStatus      { DRAFT DIAJUKAN DIVERIFIKASI DITOLAK }
enum CostStatus          { DRAFT DIAJUKAN DIVERIFIKASI DITOLAK }
enum SurveyStatus        { DRAFT SELESAI_SURVEY MENUNGGU_VERIFIKASI
                           PERLU_REVISI DIVERIFIKASI DIKONVERSI }
enum SurveyCondition     { BAIK RUSAK_RINGAN RUSAK_SEDANG RUSAK_BERAT }
enum UrgencyLevel        { RENDAH SEDANG TINGGI_MENDESAK }
enum SurveyReviewDecision{ DISETUJUI DITOLAK PERLU_REVISI }
enum ProgramAssignmentStatus { DITUGASKAN DITERIMA DITOLAK DILEPAS }
enum AdviceStatus        { BELUM_DITINDAKLANJUTI SUDAH_DITINDAKLANJUTI }
```

### 24.4 Dualitas string + relasi

Beberapa field menyimpan **nilai tampilan** sekaligus **referensi master**:

| Tampilan (string) | Relasi (FK) |
| --- | --- |
| `Program.kategori` | `Program.categoryId` |
| `Program.periode` | `Program.periodId` |
| `Program.satuan` | `Program.unitId` |
| `Program.kecamatan` | `Program.kecamatanId` |
| `Program.desaKelurahan` | `Program.villageId` |
| `FieldSurvey.kecamatan` | `FieldSurvey.kecamatanId` |
| `FieldSurvey.desaKelurahan` | `FieldSurvey.villageId` |

Tujuannya: kompatibilitas data lama (string) sambil menyiapkan normalisasi.
Selama UI belum memakai `reference-data`, kolom FK umumnya kosong dan string
menjadi sumber tampilan.

---

## 25. Permukaan API

Semua endpoint berada di bawah `/api`. Ringkasan per domain:

### 25.1 Autentikasi

| Method | Path | Akses |
| --- | --- | --- |
| POST | `/auth/login` | Publik |
| POST | `/auth/logout` | Login |
| GET | `/auth/me` | Login |
| PATCH | `/auth/profile` | Login |
| POST | `/auth/change-password` | Login |

### 25.2 Pengguna

| Method | Path | Akses |
| --- | --- | --- |
| GET/POST | `/users` | Admin |
| GET/PATCH/DELETE | `/users/{id}` | Admin |
| POST | `/users/{id}/reset-password` | Admin |

### 25.3 Program

| Method | Path | Akses |
| --- | --- | --- |
| GET | `/programs` | Login |
| POST | `/programs` | Admin |
| GET | `/programs/{id}` | Login |
| PATCH | `/programs/{id}` | Admin, Operator (field terbatas) |
| DELETE | `/programs/{id}` | Admin |
| POST | `/programs/{id}/claim` | Operator |
| POST | `/programs/{id}/complete` | Admin, Operator |
| GET | `/programs/{id}/history` | Login |
| GET/POST | `/programs/{id}/progress` | Login (GET), Admin/Operator (POST) |
| PATCH | `/progress/{progressId}/verify` | Admin |
| GET | `/programs/progress/photos/{progressId}/download` | Login |
| GET/POST | `/programs/{id}/costs` | Login (GET), Admin/Operator (POST) |
| PATCH | `/costs/{costId}` | Admin (verifikasi) |
| GET/POST | `/costs/{costId}` | Admin/Operator |
| POST | `/costs/{costId}/documents/presign` | Admin/Operator |
| POST | `/costs/{costId}/documents/complete` | Admin/Operator |
| GET | `/costs/{costId}/documents/{documentId}/download` | Admin/Operator |
| DELETE | `/costs/{costId}/documents/{documentId}` | Admin/Operator |
| GET/POST | `/programs/{id}/assignments` | Login / Admin |
| POST/PATCH/DELETE | `/programs/{id}/assignments/{assignmentId}` | Sesuai peran |

### 25.4 Survey

| Method | Path | Akses |
| --- | --- | --- |
| GET/POST | `/surveys` | Login / Admin+Operator |
| GET/PATCH/DELETE | `/surveys/{id}` | Login / Admin+Operator / Admin |
| POST | `/surveys/{id}/verify` | Admin |
| GET/POST | `/surveys/{id}/reviews` | Login |
| GET | `/surveys/{id}/status-history` | Login |
| POST | `/surveys/{id}/convert` | Admin |
| GET/POST | `/surveys/{id}/links` | Login |
| DELETE | `/surveys/links/{linkId}` | Sesuai peran |
| POST | `/surveys/{id}/photos/presign` | Admin/Operator |
| POST | `/surveys/{id}/photos/complete` | Admin/Operator |
| GET | `/surveys/photos/{photoId}/download` | Login |
| DELETE | `/surveys/photos/{photoId}` | Pemilik/Admin |

### 25.5 Arahan

| Method | Path | Akses |
| --- | --- | --- |
| GET | `/advice` | Login (operator: miliknya) |
| POST | `/advice` | Pimpinan |
| GET/PATCH/DELETE | `/advice/{id}` | Login / Admin+Operator |
| GET/POST | `/advice/{id}/replies` | Login |
| DELETE | `/advice/replies/{replyId}` | Login |

### 25.6 Laporan & referensi

| Method | Path | Akses |
| --- | --- | --- |
| GET | `/reports/summary` | Login |
| GET | `/reference-data/categories` | Login |
| GET | `/reference-data/units` | Login |
| GET | `/reference-data/periods` | Login |
| GET | `/reference-data/districts` | Login |
| GET | `/reference-data/villages?kecamatanId=` | Login |

### 25.7 Publik & sistem

| Method | Path | Akses |
| --- | --- | --- |
| GET | `/public/programs` | Publik |
| GET | `/public/documentation` | Publik |
| GET | `/health` | Publik |
| GET | `/ready` | Publik |
| GET | `/openapi` | Publik |
| GET | `/docs` | Publik (Swagger UI) |
| GET | `/mock-storage/{key}` | Development |

### 25.8 Konvensi umum

- Pagination: `?page=1&pageSize=25` (maksimum 100).
- Pencarian: `?search=...`.
- Filter domain: `?status=...`, `?operatorId=...`, `?kecamatan=...`.
- Mutasi mendukung header `Idempotency-Key`.

---

## 26. Keamanan

### 26.1 Autentikasi & sesi

- JWT ditandatangani HS256 dengan `JWT_SECRET` (minimal 32 karakter).
- Token disimpan sebagai cookie `HttpOnly` sehingga tidak dapat dibaca
  JavaScript.
- Hash token disimpan di database; logout benar-benar mencabut sesi.
- Verifikasi ulang status user pada setiap request.

### 26.2 Otorisasi

- `requireRole(...)` di setiap route yang membutuhkan peran tertentu.
- Pengecekan kepemilikan di service untuk survey, progres, biaya, dan foto.
- Operator dibatasi pada field program tertentu (allowlist).

### 26.3 Proteksi CSRF & CORS

`proxy.ts` (pengganti middleware di Next.js 16):

- Menolak request mutasi dengan `Origin` yang tidak sama dengan `APP_ORIGIN`
  (`403 CSRF_ORIGIN_MISMATCH`).
- Menangani preflight `OPTIONS`.
- Menambahkan header CORS hanya untuk origin yang sah.
- Meneruskan `x-request-id` untuk korelasi log.

### 26.4 Penyimpanan berkas

- Bucket R2 bersifat privat.
- Unggah/unduh memakai presigned URL berumur pendek.
- Server memvalidasi MIME dan ukuran sebelum menyimpan metadata.
- Nama file asli disimpan terpisah dari `storageKey`.

### 26.5 Data sensitif

- `passwordHash` tidak pernah dikembalikan (`publicUserSelect`).
- Endpoint publik memakai DTO terbatas.
- `.env` tidak di-commit; kredensial produksi harus dirotasi bila pernah
  dibagikan.

### 26.6 Ketahanan

- Rate limit login.
- Idempotency untuk mencegah duplikasi mutasi.
- Transaksi database untuk operasi multi-tabel.
- Row lock untuk verifikasi yang melibatkan angka uang/fisik.
- Soft delete agar data historis tidak hilang.

---

## 27. Struktur Folder

```text
kp/
├── app/
│   ├── api/                     # route handler HTTP per domain
│   │   ├── advice/
│   │   ├── auth/
│   │   ├── costs/
│   │   ├── programs/
│   │   ├── public/
│   │   ├── reference-data/
│   │   ├── reports/
│   │   ├── surveys/
│   │   └── users/
│   ├── components/
│   │   ├── views/               # layar utama (dashboard, program, survey, ...)
│   │   ├── Modals.tsx           # modal form kegiatan/jadwal/biaya/pengguna
│   │   ├── PublicLanding.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── Charts.tsx
│   │   ├── LeafletMap.tsx
│   │   └── PhotoLightbox.tsx
│   ├── data/                    # data awal/konstanta tampilan
│   ├── lib/                     # helper UI (storage URL, dsb.)
│   ├── utils/                   # mapper API → tipe UI, export, helper
│   ├── types.ts                 # tipe tampilan
│   ├── page.tsx                 # shell aplikasi + orkestrasi state
│   └── layout.tsx
├── lib/
│   ├── api/                     # HTTP client, DTO, entry point frontend
│   ├── http/                    # envelope respons, error, route wrapper
│   ├── prisma.ts                # Prisma client + adapter MariaDB
│   ├── config.ts                # konfigurasi runtime
│   ├── validation.ts            # primitive validation
│   ├── openapi.ts               # spesifikasi OpenAPI
│   └── serializers.ts           # serialisasi nilai Prisma (Decimal, Date)
├── modules/
│   ├── auth/
│   ├── users/
│   ├── programs/
│   ├── surveys/
│   ├── advice/
│   ├── reports/
│   ├── reference-data/
│   ├── storage/
│   └── system/
│       ├── <domain>.client.ts
│       ├── <domain>.schema.ts
│       ├── <domain>.service.ts
│       ├── <domain>.repository.ts
│       └── <domain>.types.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── generated/prisma/            # Prisma client hasil generate
├── public/                      # aset statis
├── scripts/                     # generator tipe OpenAPI
├── tests/                       # unit test Vitest
├── docs/                        # dokumentasi arsitektur & panduan
├── proxy.ts                     # CSRF/CORS/request-id (Next 16)
├── next.config.ts
├── prisma7.config.ts
├── vitest.config.ts
└── package.json
```

### 27.1 Pembagian tanggung jawab frontend

| Lapisan | Tanggung jawab |
| --- | --- |
| `page.tsx` | State global, navigasi, orkestrasi aksi, pemanggilan API |
| `components/views/*` | Presentasi layar, filter lokal, form |
| `components/Modals.tsx` | Form modal (kegiatan, jadwal, biaya, pengguna) |
| `utils/api-mappers.ts` | Konversi DTO API → tipe tampilan |
| `modules/*.client.ts` | Definisi endpoint + tipe request/response |
| `lib/api/client.ts` | Transport: base URL, cookie, query, error, idempotency |

---

## 28. Menjalankan Aplikasi

### 28.1 Prasyarat

- Node.js 20+
- MariaDB/MySQL yang dapat diakses
- (Opsional) bucket Cloudflare R2 atau S3-compatible

### 28.2 Variabel lingkungan

```env
# Database (runtime memakai serangkaian DATABASE_*)
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=...
DATABASE_PASSWORD=...
DATABASE_NAME=...

# Prisma CLI (migrate/studio)
DATABASE_URL="mysql://user:pass@host:3306/db"

# Auth
JWT_SECRET="minimal-32-karakter-acak"
APP_ORIGIN="http://localhost:3000"

# Storage (R2/S3)
R2_ENDPOINT=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
R2_PUBLIC_URL=...
```

> Runtime aplikasi (`lib/prisma.ts`) dan Prisma CLI (`prisma7.config.ts`)
> membaca konfigurasi dari kunci yang berbeda. Pastikan keduanya menunjuk
> database yang sama.

### 28.3 Langkah menjalankan

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run db:seed          # membuat 3 akun demo
npm run dev              # http://localhost:3000
```

Akun demo dari seed (password `Password123!`, hanya untuk pengembangan):

```
admin@kp.local     → Admin
operator@kp.local  → Operator
pimpinan@kp.local  → Pimpinan
```

### 28.4 Perintah lain

```bash
npm run build            # build produksi
npm start                # jalankan hasil build
npm test                 # 46 unit test (Vitest)
npm run lint             # ESLint
npx tsc --noEmit         # type check
npm run openapi:generate # regenerate tipe dari OpenAPI
```

### 28.5 Dokumentasi API

- `GET /api/openapi` — spesifikasi JSON
- `GET /api/docs` — Swagger UI

### 28.6 Kesehatan sistem

- `GET /api/health` — proses hidup
- `GET /api/ready` — konfigurasi lengkap + database terhubung

---

## 29. Status Implementasi & Catatan Teknis

Bagian ini jujur tentang kondisi kode saat dokumen dibuat, agar tidak
menyesatkan saat pengembangan lanjutan.

### 29.1 Yang sudah solid

- Pemisahan `route → service → repository` konsisten di sebagian besar domain.
- Autentikasi sesi, hashing password, CSRF, dan otorisasi berbasis peran.
- Transaksi verifikasi progres/biaya dengan penguncian baris dan pengecekan
  pagu/target.
- Konversi survey → program dalam satu transaksi (program, link, riwayat,
  assignment).
- Klaim program atomik.
- Soft delete di user, survey, program.
- Pagination konsisten dengan batas maksimum.
- Build sehat: `tsc` exit 0, 46 test lulus, lint 0 error.

### 29.2 Titik yang perlu perhatian sebelum produksi

| Area | Kondisi | Dampak |
| --- | --- | --- |
| Riwayat migrasi | Nama migrasi di database berbeda dari folder repo | `migrate deploy` berikutnya bisa gagal (duplikat index) |
| Endpoint publik | Hanya mengembalikan program selesai | Kartu "Program aktif" di landing selalu 0 |
| Unggah foto progres | Validasi `complete` memakai ID program sebagai ID progres | Unggahan foto progres gagal |
| Simpan jadwal oleh operator | `pagu`/`nilaiKontrak` selalu dikirim tetapi tidak ada di allowlist operator | Operator menerima `403` saat menyimpan jadwal |
| Pesan error API | Client belum membuka bungkus `{ error: ... }` | Pesan penolakan tampil kosong/generik di UI |
| UI verifikasi survey | Tombol admin masih memakai `verify` (selalu setuju) | Keputusan "tolak/revisi" belum terjangkau dari UI |
| PATCH program oleh admin | Menerima `realisasi/penggunaan/status` langsung | Invariant verifikasi bisa dilewati |
| Master data | Seed hanya membuat user | Dropdown referensi kosong di instalasi baru |
| OpenAPI | Beberapa route belum terdokumentasi; beberapa path lama masih ada | Swagger menampilkan endpoint yang tidak ada |
| Mapper status survey | 6 status dipetakan ke 3 label | `MENUNGGU_VERIFIKASI` dan `PERLU_REVISI` tampil ambigu |
| Status `SEDANG_DIKERJAKAN` | Tidak otomatis saat realisasi parsial | Dashboard bisa menampilkan realisasi > 0 dengan status "Belum Dikerjakan" |
| Referensi UI | `referenceDataApi` belum dipakai form | Relasi kategori/periode/kecamatan masih null |
| Konfigurasi DB | Dua sumber konfigurasi | Risiko migrate ke database berbeda |
| Idempotency | Cache di memori proses | Tidak berlaku multi-instance/restart |

Daftar lengkap dan rencana perbaikan ada di dokumen audit terpisah.

---

## 30. Glosarium

| Istilah | Arti |
| --- | --- |
| **PSU** | Prasarana, Sarana, dan Utilitas Umum |
| **Program / Kegiatan** | Satu pekerjaan PSU yang dipantau (jalan, drainase, dll.) |
| **Pagu** | Batas anggaran yang dialokasikan untuk kegiatan |
| **Penggunaan** | Akumulasi biaya yang sudah diverifikasi |
| **Target** | Volume pekerjaan yang harus dicapai |
| **Realisasi** | Volume pekerjaan yang sudah diverifikasi |
| **Progres** | Laporan berkala penambahan realisasi |
| **Verifikasi** | Persetujuan admin atas progres/biaya/survey |
| **Claim** | Pengambilan kegiatan oleh operator |
| **Assignment** | Penugasan operator oleh admin |
| **Survey** | Pendataan kondisi lapangan sebagai usulan kegiatan |
| **Konversi** | Perubahan survey terverifikasi menjadi program |
| **Arahan** | Instruksi pimpinan terhadap kegiatan/operator |
| **Soft delete** | Menandai data terhapus tanpa menghapus baris |
| **Presigned URL** | URL sementara untuk unggah/unduh langsung ke storage |
| **DTO** | Objek transfer data antara API dan UI |
| **Idempotency** | Sifat operasi yang tidak berubah bila diulang |

---

## Penutup

SIPANTAU dibangun untuk satu tujuan: **memastikan setiap angka dalam laporan
pekerjaan PSU Kuningan punya asal-usul yang jelas** — dari foto survey di
lapangan, progres yang diinput operator, sampai persetujuan admin dan
dokumentasi yang dilihat publik.

Secara teknis, fondasinya sudah tepat: domain terpisah, route tipis, aturan
bisnis di service, akses data terpusat di repository, dan transaksi untuk
operasi yang menyentuh uang serta capaian fisik. Pekerjaan berikutnya lebih
banyak pada **penyambungan UI ke endpoint yang sudah ada** dan **konsistensi
kontrak**, bukan perombakan arsitektur.

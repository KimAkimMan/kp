# Panduan Wireframe UI SIMP-KUNINGAN

Dokumen ini adalah acuan wireframe untuk tampilan aplikasi SIMP-KUNINGAN. Isinya
berdasarkan permukaan UI yang saat ini tersedia di:

- `app/page.tsx` — alur layar dan pemetaan view.
- `app/components/PublicLanding.tsx` — halaman transparansi publik.
- `app/components/LoginScreen.tsx` — halaman login.
- `app/components/Sidebar.tsx` dan `app/components/Topbar.tsx` — shell aplikasi.
- `app/components/views/` — seluruh halaman internal.
- `app/components/Modals.tsx` — modal input dan pengaturan.

Dokumen ini hanya mendeskripsikan tampilan dan kebutuhan wireframe. Jangan
menganggapnya sebagai spesifikasi perubahan perilaku, API, atau struktur data.

## 1. Tujuan dan prinsip wireframe

Wireframe harus:

1. Memprioritaskan monitoring capaian fisik, lokasi kegiatan, anggaran, dan
   dokumentasi lapangan.
2. Membedakan pengalaman tiga role: **Admin**, **Operator**, dan **Pimpinan**.
3. Mempertahankan hierarki visual: judul halaman → ringkasan/toolbar →
   konten utama → aksi lanjutan.
4. Menunjukkan state kosong, loading konseptual, error validasi, data terkunci,
   sukses, dan tampilan cetak bila relevan.
5. Menggunakan label berbahasa Indonesia yang sama dengan aplikasi.

## 2. Struktur layar dan navigasi

### 2.1 Alur tingkat tinggi

```text
Landing publik
  ├─ Login
  │    └─ Area internal sesuai role
  └─ Klik kartu proyek → login

Area internal
  ├─ Dashboard
  ├─ Halaman role-spesifik
  ├─ Data Program → Detail Program
  ├─ Operator: Data Program → Pengaturan Jadwal & Target
  ├─ Operator: Form Survey Lapangan → Daftar/Detail Survey
  └─ Logout → Landing publik
```

### 2.2 Matriks menu berdasarkan role

| Halaman / fungsi | Admin | Operator | Pimpinan |
|---|---:|---:|---:|
| Dashboard | Ya | Ya | Ya |
| Manajemen Pengguna | Ya | Tidak | Tidak |
| Master Kegiatan | Ya | Tidak | Tidak |
| Hasil Survey Operator | Ya | Tidak | Tidak |
| Data Program | Ya | Ya, berlabel “Kegiatan Saya / Data Program” | Ya |
| Form Survey Lapangan | Tidak melalui menu utama | Ya | Tidak |
| Pengaturan Jadwal & Target | Tidak melalui menu utama | Ya, dari data program | Tidak |
| Riwayat Progres | Tidak | Ya | Tidak |
| Laporan | Ya | Ya | Ya |
| Profil & Notifikasi | Ya | Ya | Ya |
| Detail Program | Dari data program/dashboard | Dari data program/dashboard | Dari data program/dashboard |

## 3. Sistem visual yang perlu direpresentasikan

### 3.1 Warna dan makna

| Token visual | Nilai saat ini | Penggunaan wireframe |
|---|---|---|
| Biru utama | `#1E4E8C` | CTA, navigasi aktif, link, progress |
| Navy | `#143965` | Judul, teks utama, sidebar gelap |
| Teal | `#148B87` | Capaian/realisasi, aksen sekunder |
| Latar aplikasi | `#F4F7FA` | Background area internal |
| Latar kartu | `#FFFFFF` | Panel, card, modal |
| Garis | `#DCE5ED` | Border dan pemisah |
| Teks sekunder | `#65778B` | Caption, metadata, subtitle |
| Oranye | `#E78A31` | Sisa anggaran, peringatan, progres berjalan |
| Hijau | `#258050` | Selesai, aktif, tercapai |
| Merah | `#BD493B` | Error, hapus, tertinggal |

### 3.2 Gaya komponen

- Font utama: DM Sans.
- Kartu/panel: putih, border tipis, radius besar sekitar `rounded-2xl`,
  shadow ringan.
- Tombol: radius `rounded-xl`, label pendek, ikon di sisi kiri.
- Badge status: pill; status utama adalah `Belum Dikerjakan`,
  `Sedang Dikerjakan`, dan `Selesai Dikerjakan`.
- Tabel: header abu-abu muda, teks kecil, dapat scroll horizontal pada layar
  sempit.
- Modal: overlay gelap transparan, panel putih terpusat, maksimal sekitar 90%
  tinggi viewport, tombol tutup di kanan atas.
- Spasi utama: gunakan ritme 4/6/8 unit; setiap section diberi jarak jelas.

### 3.3 Status badge

| Status | Perlakuan visual |
|---|---|
| Belum Dikerjakan | Abu-abu muda |
| Sedang Dikerjakan | Biru muda |
| Selesai Dikerjakan | Hijau muda |
| Draft survey | Netral |
| Selesai Survey | Biru/teal |
| Diverifikasi | Hijau |
| Urgensi tinggi | Merah/oranye |

## 4. Shell area internal

Semua halaman internal menggunakan shell berikut:

### 4.1 Sidebar kiri

- Lebar desktop sekitar 256–288 px; tinggi penuh viewport.
- Gradient biru tua.
- Brand:
  - ikon gedung,
  - “SIMP-Kuningan”,
  - “Dinas PKPP Kab. Kuningan”.
- Label section: “MENU UTAMA”.
- Item navigasi berupa ikon + label.
- Item aktif memiliki background putih transparan.
- Kartu pengguna di bagian bawah:
  - nama,
  - role,
  - tombol “Keluar”.
- Mobile: sidebar menjadi drawer dari kiri, dengan backdrop gelap dan tombol
  tutup.

### 4.2 Topbar

- Tinggi sekitar 80 px, sticky, background putih, border bawah.
- Mobile: tombol hamburger.
- Area kiri:
  - judul view,
  - subjudul role dan instansi.
- Area kanan:
  - tombol lonceng notifikasi,
  - badge jumlah arahan bila ada,
  - chip avatar inisial,
  - nama dan role.
- Klik lonceng atau chip pengguna menuju “Profil & Notifikasi”.

### 4.3 Area konten

- Background `#F4F7FA`.
- Konten berada di tengah, maksimal sekitar 7xl.
- Padding desktop lebih besar dari mobile.
- Semua view memakai judul halaman dan panel putih yang konsisten.

## 5. Halaman publik: Landing / Transparansi

**File acuan:** `app/components/PublicLanding.tsx`

### 5.1 Header publik

- Sticky, putih semi-transparan dengan blur dan border bawah.
- Kiri: ikon landmark, “SIMP-KUNINGAN”, sublabel bidang.
- Tengah desktop: anchor “Proyek”, “Dokumentasi”, “Pencapaian Program”,
  “Lokasi”.
- Kanan: tombol “Login”.
- Navigasi tengah disembunyikan pada mobile.

### 5.2 Hero

- Banner gradient navy → biru.
- Eyebrow uppercase: “SISTEM INFORMASI MONITORING PERMUKIMAN”.
- Headline: “Pembangunan permukiman yang dapat dipantau bersama.”
- Paragraf penjelasan transparansi, akuntabilitas, target, realisasi,
  dokumentasi, dan anggaran.

### 5.3 Ringkasan publik

Empat kartu yang sedikit overlap ke bawah hero:

1. Program aktif — jumlah kegiatan.
2. Program selesai — jumlah kegiatan.
3. Total pagu — format rupiah.
4. Total penggunaan — format rupiah.

Masing-masing memiliki bar aksen warna di bagian atas.

### 5.4 Section “Proyek Pembangunan Permukiman” (`#proyek`)

- Eyebrow “TRANSPARANSI PELAKSANAAN”.
- Judul dan deskripsi.
- Panel filter:
  - pill “Semua Tahun” dan pill tahun dengan jumlah,
  - pill “Semua Bidang” dan kategori bidang,
  - ikon kalender dan layers.
- Grid kartu proyek:
  - tahun anggaran,
  - badge status,
  - kode kegiatan,
  - badge kategori,
  - nama kegiatan,
  - desa dan kecamatan,
  - target,
  - realisasi.
- Klik kartu mengarahkan pengguna ke login, sambil menyimpan proyek yang
  dipilih.
- State kosong: pesan bahwa tidak ada proyek yang cocok.

### 5.5 Section “Dokumentasi Kegiatan” (`#dokumentasi`)

- Background biru sangat muda.
- Grid empat kartu dokumentasi.
- Setiap kartu berisi:
  - foto besar,
  - nama kegiatan,
  - desa/lokasi.

### 5.6 Section “Pencapaian Program” (`#pencapaian`)

Gunakan komponen pencapaian pimpinan sebagai blok visual:

- filter periode tahunan, triwulan, atau bulanan,
- tahun,
- bulan atau triwulan sesuai mode,
- ringkasan capaian keseluruhan,
- bar horizontal per kategori dan satuan,
- label status “Tercapai”, “Sedang Berjalan”, atau “Tertinggal”,
- garis target 100%,
- catatan bila perhitungan periode bersifat proporsional,
- tombol ekspor CSV.

### 5.7 Section “Lokasi” (`#lokasi`)

- Layout dua kolom:
  - teks alamat/identitas Disperkimtan,
  - peta Leaflet.
- Peta menampilkan area Kabupaten Kuningan dan marker kantor.
- Mobile menjadi satu kolom; tinggi peta tetap memadai untuk disentuh.

## 6. Halaman login

**File acuan:** `app/components/LoginScreen.tsx`

- Desktop dua kolom:
  - kiri banner visual biru dengan ikon, headline, deskripsi, nama dinas,
  - kanan kartu form.
- Mobile hanya menampilkan kartu form.
- Kartu form:
  - ikon gedung,
  - judul “Masuk ke Sistem”,
  - deskripsi instansi,
  - tiga selector role: Admin, Operator, Pimpinan,
  - panel akun demo sesuai role,
  - input Username/Email,
  - input Kata Sandi dengan toggle tampil/sembunyi,
  - pesan error inline,
  - tombol “Masuk ke Aplikasi”,
  - tombol “Kembali ke halaman transparansi”.
- State wireframe:
  - role aktif,
  - input kosong,
  - kredensial salah,
  - login berhasil/toast.

## 7. Halaman internal per view

### 7.1 Dashboard

**Komponen:** `DashboardView`

Struktur umum:

- Judul dashboard sesuai role dan deskripsi role.
- Aksi kontekstual:
  - Admin: “Tambah Kegiatan”.
  - Pimpinan: “Tinjau Laporan”.
- Empat kartu statistik:
  - jumlah kegiatan,
  - kegiatan sedang dikerjakan,
  - kegiatan selesai,
  - pagu/penggunaan atau metrik terkait.
- Filter tahun dan kategori bidang.
- Grafik/bar chart capaian.
- Daftar atau tabel data program.

Tambahan Admin:

- pencarian data program,
- aksi lihat/hapus,
- daftar hasil survey yang dapat dikelola,
- modal konfirmasi hapus.

Tambahan Operator:

- ringkasan hanya untuk kegiatan yang dapat diakses operator,
- blok pesan/arahan yang belum ditindaklanjuti,
- akses ke kegiatan terkait.

Tambahan Pimpinan:

- blok pencapaian program berbasis periode,
- form “Saran & Arahan”:
  - pilih kegiatan,
  - isi pesan,
  - penerima operator,
  - tombol kirim.

### 7.2 Manajemen Pengguna (Admin)

**Komponen:** `UsersView`

- Header + tombol “Tambah Pengguna”.
- Panel toolbar:
  - pencarian nama/email/role,
  - tombol “Reset” saat pencarian aktif.
- Tabel:
  - Nama Lengkap,
  - Email,
  - Role,
  - Aksi.
- Aksi baris:
  - “Ubah”,
  - “Hapus” kecuali akun pengguna yang sedang login.
- State kosong: tidak ada pengguna yang cocok.
- Hapus membuka modal konfirmasi:
  - ikon bahaya,
  - nama pengguna,
  - tombol “Batal”,
  - tombol “Ya, Hapus”.

### 7.3 Master Kegiatan (Admin)

**Komponen:** `MasterActivitiesView`

- Header + “Tambah Kegiatan”.
- Filter tahun berbentuk pill dengan jumlah data.
- Filter kategori bidang berbentuk pill.
- Toolbar pencarian luas: kegiatan, jalan, desa, kecamatan, kategori, PJ.
- Tombol reset filter.
- Tabel master:
  - tahun/kode,
  - nama,
  - kategori,
  - lokasi desa/kecamatan,
  - operator/PJ,
  - pagu,
  - target/realisasi,
  - status,
  - aksi lihat/ubah/hapus.
- Konfirmasi hapus kegiatan.
- Klik baris dapat membuka detail program.

### 7.4 Data Program

**Komponen:** `ProgramsView`

Untuk Admin/Pimpinan labelnya “Data Program”; Operator memakai
“Kegiatan Saya / Data Program”.

- Header dan deskripsi.
- Filter tahun + jumlah.
- Filter kategori bidang.
- Toolbar:
  - pencarian,
  - status,
  - kecamatan,
  - sorting terbaru/terlama/nama/status,
  - reset filter.
- Bar metrik:
  - Pagu Total,
  - Penggunaan,
  - Sisa Anggaran,
  - Total Kegiatan.
- Tabel lebar dengan kolom:
  - Tahun/Kode,
  - Nama Kegiatan,
  - Kategori,
  - Desa/Kelurahan,
  - Kecamatan,
  - Operator/PJ,
  - Penyedia CV/PT,
  - Pagu,
  - Nilai Kontrak,
  - Target,
  - Realisasi,
  - Status,
  - Aksi.
- Operator:
  - kegiatan belum ditugaskan dapat memiliki aksi “Ambil”,
  - kegiatan selesai menampilkan kondisi terkunci,
  - klik menuju pengaturan jadwal/progres.
- Admin/Pimpinan klik menuju Detail Program.

### 7.5 Form Survey Lapangan (Operator)

**Komponen:** `SurveyView`

Gunakan tab:

1. **Form Survey**
2. **Daftar Survey**

Form dibagi menjadi blok:

- Identitas survey:
  - pilih program terkait,
  - nama kegiatan/lokasi,
  - kategori,
  - tanggal,
  - surveyor,
  - kontak pendamping.
- Lokasi:
  - kecamatan,
  - desa/kelurahan,
  - detail lokasi,
  - koordinat,
  - tombol ambil lokasi/GPS.
- Kondisi dan teknis:
  - kondisi,
  - tipe konstruksi,
  - panjang,
  - lebar,
  - luas/volume,
  - satuan,
  - estimasi biaya,
  - tingkat urgensi.
- Temuan:
  - uraian temuan,
  - rekomendasi.
- Dokumentasi:
  - upload foto,
  - preview/indikator foto tersedia.
- Status survey: Draft/Selesai Survey/Diverifikasi.
- Tombol simpan dan reset.

Daftar survey:

- pencarian,
- filter kecamatan,
- filter kondisi,
- kartu/tabel survey dengan tanggal, lokasi, kondisi, urgensi, status,
  dokumentasi, dan aksi lihat/ubah/hapus.
- Detail survey dapat dibuka sebagai modal.

### 7.6 Hasil Survey Operator (Admin)

**Komponen:** `AdminSurveyView`

Tampilan daftar memiliki:

- metrik total survey,
- jumlah belum dikonversi,
- jumlah sudah dikonversi,
- total estimasi biaya belum dikonversi,
- pencarian,
- filter kategori,
- filter status konversi,
- filter urgensi,
- filter kecamatan.

Detail hasil survey adalah layar turunan di dalam view:

- tombol kembali ke daftar,
- tombol “Cetak Lembar Survey”,
- banner status sudah/belum dikonversi,
- identitas survey,
- kondisi, lokasi, koordinat,
- ukuran/volume,
- temuan dan rekomendasi,
- dokumentasi,
- informasi program yang terhubung bila ada.

Konversi menjadi master kegiatan:

- modal konfirmasi/form dengan data survey terisi,
- nama kegiatan,
- kategori,
- pagu,
- target,
- satuan,
- kecamatan,
- desa,
- detail lokasi,
- tombol konversi dan batal.

### 7.7 Pengaturan Jadwal & Target (Operator)

**Komponen:** `ScheduleView`

- Tombol kembali ke kegiatan saya.
- Judul “Detail Kegiatan & Pengaturan”.
- Banner hijau terkunci bila kegiatan selesai.
- Selector kegiatan.
- Tombol “Pengaturan Jadwal & Target” bila belum terkunci.
- Lima metrik:
  - target awal,
  - target berjalan,
  - realisasi terakhir,
  - sisa target,
  - persentase/progres.
- Form update progres:
  - tanggal,
  - status,
  - tahap pekerjaan,
  - nilai realisasi,
  - keterangan,
  - dokumentasi foto wajib.
- Tombol simpan progres.
- Aksi tandai selesai dengan validasi 100% dan foto.
- Akses pencatatan biaya melalui modal biaya bila tersedia dari konteks.

### 7.8 Riwayat Progres (Operator)

**Komponen:** `HistoryView`

- Judul dan deskripsi.
- Filter tahun.
- Filter bidang.
- Selector kegiatan.
- Tabel riwayat:
  - tanggal update,
  - tahap pekerjaan,
  - nilai realisasi,
  - keterangan,
  - dokumentasi,
  - penginput.
- State kosong untuk kegiatan tanpa riwayat.

### 7.9 Laporan & Rekapitulasi

**Komponen:** `ReportsView`

- Header dengan aksi:
  - “Unduh Dokumen” (TXT),
  - “Unduh Excel” (CSV),
  - “Cetak”.
- Pada mode cetak: header dinas dan judul laporan tampil, toolbar disembunyikan.
- Filter tahun dan kategori bidang.
- Pencarian kegiatan/lokasi/kategori/PJ.
- Bar ringkasan:
  - Pagu Total,
  - Penggunaan,
  - Sisa Anggaran,
  - Total Kegiatan.
- Tabel laporan:
  - tahun/kode,
  - kegiatan,
  - kategori,
  - desa/kecamatan,
  - PJ,
  - penyedia,
  - kontrak,
  - pagu/penggunaan/sisa,
  - target/realisasi/satuan,
  - status,
  - update terakhir.

### 7.10 Detail Program

**Komponen:** `DetailView`

- Tombol “Kembali ke Daftar”.
- Untuk Pimpinan: tombol “Isi Saran & Arahan untuk Kegiatan Ini”.
- Header detail:
  - badge status,
  - nama kegiatan,
  - kode,
  - kategori,
  - kartu status pekerjaan dan sumber pembaruan.
- Progress bar capaian fisik:
  - persentase,
  - realisasi,
  - target.
- Grid atribut:
  - lokasi lengkap,
  - PJ,
  - penyedia,
  - direktur,
  - periode,
  - waktu pelaksanaan,
  - pagu,
  - nilai kontrak,
  - nomor kontrak,
  - satuan,
  - update terakhir,
  - keterangan terakhir.
- Section “Riwayat Realisasi” berupa tabel.
- Section grafik realisasi/target menggunakan bar chart.
- Dokumentasi berupa indikator foto atau lampiran bila tersedia.

### 7.11 Profil & Notifikasi

**Komponen:** `ProfileView`

- Informasi akun:
  - nama lengkap,
  - role akses,
  - email,
  - status aktif.
- Kotak pesan/arahan:
  - Operator: pesan masuk dari Pimpinan,
  - Pimpinan: arahan yang pernah dikirim,
  - Admin: rekap seluruh arahan.
- Setiap kartu arahan:
  - identitas pengirim,
  - tanggal,
  - badge tindak lanjut,
  - kegiatan terkait,
  - isi pesan,
  - tombol buka kegiatan.
- Operator memiliki aksi menandai arahan sudah ditindaklanjuti.
- Bila pending, tampil badge jumlah belum ditindaklanjuti.

## 8. Modal dan overlay

Semua modal memakai pola overlay gelap, panel putih, judul, tombol tutup, isi
form, error inline, dan footer aksi.

### 8.1 UserModal

- Mode tambah: “Tambah Pengguna Baru”.
- Mode ubah: “Ubah Data Pengguna”.
- Field:
  - Nama Lengkap,
  - Email Akun,
  - Role Hak Akses.
- Error validasi di bawah field.
- Footer: “Batal” dan “Simpan Pengguna”.

### 8.2 ActivityModal

- Mode tambah/ubah master kegiatan.
- Field:
  - kategori/jenis kegiatan,
  - nama kegiatan,
  - nilai pagu anggaran,
  - kecamatan,
  - desa/kelurahan,
  - detail lokasi/ruas jalan,
  - operator pelaksana opsional.
- Teks bantuan menjelaskan kegiatan yang belum ditugaskan.
- Footer: “Batal” dan “Simpan Master Kegiatan”.

### 8.3 ScheduleModal

- Pengaturan teknis dan target program.
- Field:
  - satuan,
  - target awal,
  - target volume berjalan,
  - penyedia,
  - direktur,
  - nilai kontrak,
  - nomor kontrak,
  - tanggal mulai,
  - tanggal selesai,
  - periode tahun,
  - lebar jalan bila relevan,
  - kondisi jalan bila relevan.
- Validasi tanggal, target, dan field spesifik jalan.
- Footer simpan/batal.

### 8.4 CostModal

- Pencatatan penggunaan biaya.
- Field:
  - tanggal,
  - tahap pekerjaan,
  - uraian biaya,
  - nominal,
  - bukti pembayaran/dokumentasi.
- Tampilkan ringkasan pagu, penggunaan, dan sisa anggaran.
- Footer simpan/batal.

### 8.5 Modal konfirmasi

Wireframe perlu menyediakan pola yang sama untuk:

- hapus pengguna,
- hapus kegiatan,
- hapus survey,
- konversi survey menjadi master kegiatan.

Gunakan judul yang spesifik, ringkasan objek, tombol batal, dan CTA destruktif
atau konversi yang jelas.

## 9. Feedback, error, dan state wajib

### 9.1 Toast

- Posisi kanan bawah desktop; tidak menutup konten utama.
- Sukses: navy dengan ikon centang teal.
- Error: merah tua dengan ikon peringatan.
- Pesan singkat dan otomatis menghilang.

Contoh label yang harus dipertahankan:

- “Data pengguna berhasil diperbarui.”
- “Master kegiatan baru berhasil disimpan.”
- “Realisasi berhasil disimpan dan ringkasan diperbarui.”
- “Perubahan gagal disimpan ke browser.”

### 9.2 State kosong

Sediakan area panel dengan border dashed atau teks terpusat untuk:

- tidak ada hasil pencarian,
- tidak ada program untuk operator,
- tidak ada riwayat progres,
- tidak ada survey,
- tidak ada proyek yang cocok dengan filter.

### 9.3 State validasi

- Error berada dekat form yang bermasalah.
- Jangan hanya mengandalkan warna; gunakan teks jelas.
- Tombol submit tetap mudah ditemukan.
- Foto wajib diberi indikator wajib untuk progres dan verifikasi.

### 9.4 State terkunci

- Kegiatan selesai menampilkan banner hijau dan ikon lock.
- Form/proses perubahan dinonaktifkan atau menolak penyimpanan.
- Status terkunci harus terlihat sebelum pengguna mengisi form.

## 10. Responsif dan aksesibilitas wireframe

### Desktop

- Sidebar selalu terlihat.
- Topbar dua sisi.
- Tabel boleh lebar dengan scroll horizontal terkontrol.
- Grid statistik 4 kolom, kartu proyek 3 kolom, dokumentasi 4 kolom.

### Tablet

- Grid turun menjadi 2 kolom.
- Filter boleh membungkus beberapa baris.
- Tabel tetap dapat digeser horizontal.

### Mobile

- Sidebar menjadi drawer.
- Topbar menampilkan hamburger, judul ringkas, notifikasi, dan avatar.
- Semua panel menjadi satu kolom.
- Tombol aksi boleh memenuhi lebar bila diperlukan.
- Form dua kolom berubah menjadi satu kolom.
- Modal memakai margin kecil dan scroll internal.
- Peta memiliki tinggi minimum dan tidak mengandalkan hover.

### Aksesibilitas

- Setiap input memiliki label.
- Ikon-only button memiliki accessible name.
- Status tidak disampaikan hanya melalui warna.
- Tabel memiliki header yang jelas.
- Fokus keyboard terlihat.
- Modal dapat ditutup dengan Escape.
- Foto, peta, dan grafik memiliki teks/label alternatif yang bermakna.

## 11. Checklist pembuatan wireframe

### Untuk setiap layar

- [ ] Judul, subtitle, dan role pemilik layar sudah ditulis.
- [ ] Sidebar dan topbar sesuai role sudah ada.
- [ ] CTA utama dan aksi sekunder sudah dibedakan.
- [ ] Filter, pencarian, reset, dan sorting sudah ditandai.
- [ ] Struktur data utama sudah diberi label kolom/field.
- [ ] Badge status dan warna maknanya konsisten.
- [ ] State kosong, error, sukses, loading konseptual, dan terkunci sudah
      dibuat.
- [ ] Versi mobile sudah ditentukan.

### Untuk halaman data

- [ ] Kolom tabel tidak hilang tanpa aturan responsif.
- [ ] Aksi baris diberi prioritas.
- [ ] Paginasi tidak diperlukan pada implementasi saat ini; jangan menambahkannya
      sebagai asumsi wireframe.
- [ ] Panel ringkasan anggaran memakai empat metrik yang konsisten.

### Untuk alur kritis

- [ ] Login: pilih role → isi kredensial → error/sukses.
- [ ] Admin: tambah/ubah/hapus pengguna.
- [ ] Admin: tambah/ubah/hapus master kegiatan.
- [ ] Operator: ambil kegiatan → atur target → input progres → tandai selesai.
- [ ] Operator: isi survey → simpan → ubah/hapus → lihat detail.
- [ ] Admin: lihat hasil survey → konversi menjadi master kegiatan.
- [ ] Pimpinan: lihat capaian → isi saran/arahan.
- [ ] Semua role: buka laporan → ekspor/cetak.

## 12. Referensi komponen

| Kebutuhan wireframe | File |
|---|---|
| Orkestrasi layar | `app/page.tsx` |
| Landing publik | `app/components/PublicLanding.tsx` |
| Login | `app/components/LoginScreen.tsx` |
| Sidebar | `app/components/Sidebar.tsx` |
| Topbar | `app/components/Topbar.tsx` |
| Dashboard | `app/components/views/DashboardView.tsx` |
| Pengguna | `app/components/views/UsersView.tsx` |
| Master kegiatan | `app/components/views/MasterActivitiesView.tsx` |
| Data program | `app/components/views/ProgramsView.tsx` |
| Survey operator | `app/components/views/SurveyView.tsx` |
| Hasil survey admin | `app/components/views/AdminSurveyView.tsx` |
| Jadwal dan progres | `app/components/views/ScheduleView.tsx` |
| Riwayat | `app/components/views/HistoryView.tsx` |
| Laporan | `app/components/views/ReportsView.tsx` |
| Detail program | `app/components/views/DetailView.tsx` |
| Profil/notifikasi | `app/components/views/ProfileView.tsx` |
| Modal | `app/components/Modals.tsx` |
| Toast | `app/components/Toast.tsx` |
| Grafik | `app/components/Charts.tsx` |
| Peta | `app/components/LeafletMap.tsx` |
| Pencapaian pimpinan | `app/components/PimpinanAchievementSection.tsx` |

# Permasalahan Database: Migrasi Gagal dan Schema Drift

Dokumen ini menjelaskan penyebab, bukti, dampak, dan langkah perbaikan atas masalah database
yang muncul saat menjalankan `prisma migrate deploy` dan saat aplikasi berjalan.

- **Status**: belum diperbaiki di database (menunggu backup + persetujuan)
- **Lingkungan yang terdampak**: database `kp_db` di `localhost:3306` (MySQL/MariaDB)
- **Sifat dokumen**: analisis dan prosedur; tidak ada perintah yang dijalankan ke database

---

## 1. Ringkasan

Ada dua masalah yang saling berkaitan:

1. **Migrasi `20261121065320_add_user_role_index` gagal** karena index `User_role_idx`
   sudah ada di database, sehingga `CREATE INDEX` ditolak (MySQL error 1061).
2. **Empat kolom yang diminta schema belum ada di database**, yaitu
   `ProgramHistory.storageKey`, `ProgramHistory.originalName`,
   `ProgramProgress.storageKey`, dan `ProgramProgress.originalName`.

Penyebab dasarnya sama: **database pernah diubah di luar alur migration** (kemungkinan
besar lewat `prisma db push` atau perubahan manual), sehingga isi database tidak lagi sama
dengan riwayat migration di repository. Prisma lalu mencoba "mengejar" kondisi schema dan
bertabrakan dengan objek yang sudah terlanjur dibuat.

`NODE_ENV=development` **bukan** penyebab masalah ini.

---

## 2. Gejala yang Terlihat

### 2.1 Saat menjalankan migrasi

```text
Applying migration `20261121000000_remove_pj_from_program`
Applying migration `20261121065320_add_user_role_index`
Error: P3018
A migration failed to apply. New migrations cannot be applied before the error is recovered from.

Migration name: 20261121065320_add_user_role_index
Database error code: 1061
Database error:
Duplicate key name 'User_role_idx'
```

Artinya: migration keenam berhasil, migration ketujuh gagal, dan Prisma mengunci proses
migrasi sampai masalah ini diselesaikan (P3018/P3009). Selama status gagal ini ada,
`migrate deploy` berikutnya tidak akan menjalankan migration baru.

### 2.2 Saat aplikasi berjalan

```text
Unknown column 'ProgramHistory.storageKey' in 'field list'
```

Error serupa dapat muncul untuk `ProgramProgress.storageKey`. Ini terjadi karena Prisma
Client versi sekarang meminta kolom tersebut pada query program (relasi riwayat dan
progres), tetapi kolomnya tidak ada di tabel.

---

## 3. Akar Masalah

### 3.1 Index `User_role_idx` sudah ada sebelum migration

Migration terakhir berisi satu perintah:

```sql
-- prisma/migrations/20261121065320_add_user_role_index/migration.sql:2
CREATE INDEX `User_role_idx` ON `User`(`role`);
```

Di schema, index ini berasal dari `@@index([role])` pada model `User`
(`prisma/schema.prisma`). Migration init tidak membuat index tersebut. Artinya index ini
dibuat setelah init, di luar migration yang tercatat — paling mungkin lewat `db push`.

Karena index sudah ada, `CREATE INDEX` dengan nama yang sama gagal.

### 3.2 Kolom metadata foto tidak pernah dibuat oleh migration

Schema saat ini memiliki empat kolom nullable:

| Model | Kolom | Lokasi di schema |
| --- | --- | --- |
| `ProgramHistory` | `storageKey VARCHAR(512) NULL` | `prisma/schema.prisma` |
| `ProgramHistory` | `originalName VARCHAR(255) NULL` | `prisma/schema.prisma` |
| `ProgramProgress` | `storageKey VARCHAR(512) NULL` | `prisma/schema.prisma` |
| `ProgramProgress` | `originalName VARCHAR(255) NULL` | `prisma/schema.prisma` |

Namun tidak ada migration yang menambahkannya:

- Tabel `ProgramHistory` dibuat di `prisma/migrations/20261020091409_init_database/migration.sql`
  (sekitar baris 95) tanpa kedua kolom itu.
- Tabel `ProgramProgress` dibuat di
  `prisma/migrations/20261030130000_add_program_survey_workflow/migration.sql`
  (sekitar baris 95) juga tanpa kedua kolom itu.

Kolom `storageKey`/`originalName` yang **ada** di migration workflow hanya milik
`ProgramCostDocument` dan `SurveyPhoto`, bukan milik `ProgramHistory`/`ProgramProgress`.

Jadi schema sudah berubah (field ditambahkan), tetapi migration-nya tidak pernah dibuat.

### 3.3 Kesimpulan drift

| Objek | Schema | Migration | Database |
| --- | --- | --- | --- |
| `User_role_idx` | ada | ada (migration gagal) | **sudah ada** |
| `ProgramHistory.storageKey` | ada | tidak ada | **tidak ada** |
| `ProgramHistory.originalName` | ada | tidak ada | **tidak ada** |
| `ProgramProgress.storageKey` | ada | tidak ada | **tidak ada** |
| `ProgramProgress.originalName` | ada | tidak ada | **tidak ada** |

Inilah definisi schema drift: schema aplikasi, riwayat migration, dan isi database tidak
lagi sepakat.

---

## 4. Dampak

1. **Deployment macet.** Migration baru tidak bisa dijalankan sampai migration gagal
   di-resolve.
2. **Aplikasi error saat membuka data program.** Query yang menyertakan riwayat/progres
   meminta kolom yang tidak ada.
3. **Risiko kehilangan data jika ditangani keliru.** `migrate reset` atau
   `db push --accept-data-loss` akan menghapus/menimpa data produksi.
4. **Ketidakpastian kondisi database.** Karena perubahan pernah dilakukan di luar
   migration, masih mungkin ada perbedaan lain yang belum terdeteksi.

---

## 5. Diagnosis Aman (Read-Only)

Jalankan hanya perintah baca. Jangan menjalankan `migrate deploy`, `migrate reset`, atau
`db push` sebelum backup selesai.

### 5.1 Status migration

```bash
npx prisma migrate status
```

Status yang diharapkan saat ini: 6 migration applied, 1 migration failed
(`20261121065320_add_user_role_index`).

### 5.2 Cek index yang sudah ada

```sql
SELECT INDEX_NAME
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'User'
  AND INDEX_NAME = 'User_role_idx';
```

Jika ada satu baris, index memang sudah ada dan `resolve --applied` adalah langkah yang
tepat.

### 5.3 Cek kolom yang hilang

```sql
SELECT TABLE_NAME, COLUMN_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('ProgramHistory', 'ProgramProgress')
  AND COLUMN_NAME IN ('storageKey', 'originalName')
ORDER BY TABLE_NAME, COLUMN_NAME;
```

Jika hasilnya kosong (atau hanya sebagian), migration kolom baru memang diperlukan.

### 5.4 Cek riwayat migration

```sql
SELECT migration_name, finished_at, rolled_back_at, applied_steps_count
FROM _prisma_migrations
ORDER BY started_at;
```

Baris dengan `finished_at` NULL dan `rolled_back_at` NULL adalah migration yang gagal.
Kolom `logs` pada baris tersebut menyimpan pesan error aslinya.

### 5.5 Deteksi drift lain (opsional, read-only)

```bash
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```

Perintah ini memakai konfigurasi database yang sama dengan CLI (tanpa mengeksekusi SQL) dan
menampilkan perbedaan antara isi database dan schema. Untuk CI, tambahkan `--exit-code`
agar pipeline gagal bila ada drift.

---

## 6. Langkah Perbaikan untuk Produksi

Urutan ini disusun agar tidak ada data yang hilang.

### Langkah 0 — Backup

```bash
mysqldump -u <user> -p --single-transaction --routines --triggers kp_db > kp_db_backup.sql
```

Simpan backup di lokasi terpisah dan pastikan ukurannya wajar sebelum melanjutkan.

### Langkah 1 — Konfirmasi kondisi database

Jalankan query pada bagian 5.2 dan 5.3. Jangan lanjut jika hasilnya tidak sesuai dengan
asumsi (misalnya index tidak ada, atau kolom ternyata sudah ada).

### Langkah 2 — Tandai migration index sebagai applied

Karena index `User_role_idx` sudah ada, isi migration tersebut sebenarnya sudah terpenuhi.

```bash
npx prisma migrate resolve --applied "20261121065320_add_user_role_index"
```

Perintah ini **hanya mencatat status** di `_prisma_migrations`; tidak mengubah tabel dan
tidak menghapus data.

> Jangan memilih `--rolled-back`, kecuali SQL migration-nya lebih dulu diubah menjadi
> idempotent. Jika di-rollback tanpa perubahan, `migrate deploy` berikutnya akan
> mengulang `CREATE INDEX` dan gagal lagi dengan error yang sama.

### Langkah 3 — Tambahkan migration untuk kolom yang hilang

Buat folder migration baru di repository, misalnya:

```text
prisma/migrations/20261124000000_add_photo_metadata_to_history_and_progress/migration.sql
```

Isi:

```sql
ALTER TABLE `ProgramHistory`
  ADD COLUMN `storageKey` VARCHAR(512) NULL,
  ADD COLUMN `originalName` VARCHAR(255) NULL;

ALTER TABLE `ProgramProgress`
  ADD COLUMN `storageKey` VARCHAR(512) NULL,
  ADD COLUMN `originalName` VARCHAR(255) NULL;
```

Kolom dibuat `NULL` agar baris lama tetap valid dan tidak perlu mengisi data dummy.

Catatan pembuatan file:

- Idealnya dibuat dengan `npx prisma migrate dev --create-only --name add_photo_metadata_to_history_and_progress`
  di database lokal yang bersih, lalu SQL-nya direview.
- Jika `migrate dev` menawarkan reset karena drift, **jangan** diterima pada database
  produksi. Buat folder dan file migration secara manual, lalu review.
- Jangan mengedit migration lama yang sudah pernah sukses di lingkungan lain, karena
  Prisma memeriksa checksum migration yang sudah tercatat.

### Langkah 4 — Terapkan migration

```bash
npx prisma migrate status
npx prisma migrate deploy
```

Pastikan status bersih sebelum dan sesudah.

### Langkah 5 — Sinkronkan Prisma Client

```bash
npx prisma generate
```

Lalu restart proses aplikasi (`npm run build && npm start` untuk produksi) agar client
baru dipakai.

### Langkah 6 — Verifikasi

1. `npx prisma migrate status` → semua migration applied, tidak ada yang failed.
2. Query 5.3 → empat kolom muncul.
3. Buka halaman yang menampilkan program, riwayat, dan progres → tidak ada error
   `Unknown column`.
4. Cek log aplikasi untuk error Prisma `P2022` (kolom tidak ditemukan).

---

## 7. Opsi untuk Lingkungan Development

Jika ada database lokal yang juga drift dan datanya tidak penting:

- Cara cepat: `npx prisma db push` lalu `npx prisma generate`.
- Cara bersih: `npx prisma migrate reset` lalu `npx prisma migrate deploy` dan seed ulang.

Keduanya **hanya** untuk database lokal/sekali pakai. Jangan pernah dijalankan pada
database produksi atau database bersama.

---

## 8. Larangan

| Perintah | Alasan |
| --- | --- |
| `prisma migrate reset` | Menghapus seluruh isi database. |
| `prisma db push` di produksi | Mengubah struktur tanpa riwayat migration dan dapat memicu drift baru. |
| `prisma db push --accept-data-loss` | Berpotensi menghapus kolom/data. |
| Mengedit migration yang sudah applied | Checksum berubah; Prisma menandai migration termodifikasi di lingkungan lain. |
| `migrate resolve --applied` tanpa verifikasi | Bisa menandai migration selesai padahal efeknya belum ada. |

---

## 9. Pencegahan

1. **Satu alur perubahan**: semua perubahan schema lewat `prisma migrate`, bukan `db push`,
   untuk database bersama.
2. **Review SQL migration** sebelum deploy, terutama `DROP`, `ALTER`, dan index.
3. **Cek status sebelum deploy** di pipeline:
   ```bash
   npx prisma migrate status
   ```
4. **Deteksi drift di CI** dengan `prisma migrate diff` terhadap database uji.
5. **Satu sumber konfigurasi database**: runtime (`lib/config.ts`) dan Prisma CLI
   (`prisma7.config.ts`) sekarang sama-sama memakai `DATABASE_HOST`, `DATABASE_PORT`,
   `DATABASE_USER`, `DATABASE_PASSWORD`, dan `DATABASE_NAME`.
6. **Jangan simpan `DATABASE_URL` sebagai sumber kedua** di `.env`; nilai itu tidak dipakai
   lagi oleh konfigurasi Prisma dan hanya menimbulkan kebingungan.
7. **Backup otomatis** sebelum setiap deployment yang menyentuh struktur database.
8. **Batasi akses** `db push`/`migrate reset` hanya untuk lingkungan lokal.

Catatan kecil: `getDatabaseUrl()` di `lib/config.ts` belum meng-encode `user` seperti
`prisma7.config.ts`. Jika username mengandung karakter khusus, keduanya bisa menghasilkan
URL berbeda. Sebaiknya disamakan agar benar-benar satu sumber.

---

## 10. Ringkasan Tindakan

| No | Tindakan | Status |
| --- | --- | --- |
| 1 | Backup database produksi | belum |
| 2 | Verifikasi index dan kolom (read-only) | belum |
| 3 | `migrate resolve --applied` untuk migration index | belum |
| 4 | Tambah migration kolom `storageKey`/`originalName` | belum (perlu perubahan repository) |
| 5 | `prisma migrate deploy` | belum |
| 6 | `prisma generate` + restart aplikasi | belum |
| 7 | Verifikasi aplikasi dan status migration | belum |

Dokumen ini tidak mengubah database maupun file migration. Langkah 3–6 memerlukan backup
dan persetujuan pemilik database.

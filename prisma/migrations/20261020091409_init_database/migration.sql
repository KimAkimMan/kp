-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` ENUM('Admin', 'Operator', 'Pimpinan') NOT NULL,
    `passwordHash` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgramCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ProgramCategory_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Unit_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kecamatan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Kecamatan_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Program` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `namaKegiatan` VARCHAR(255) NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `categoryId` INTEGER NULL,
    `lokasi` TEXT NOT NULL,
    `kecamatan` VARCHAR(191) NULL,
    `kecamatanId` INTEGER NULL,
    `desaKelurahan` VARCHAR(191) NULL,
    `detailLokasi` TEXT NULL,
    `pj` VARCHAR(191) NOT NULL,
    `operatorPengelola` VARCHAR(191) NULL,
    `operatorPengelolaId` INTEGER NULL,
    `penanggungJawabDinas` VARCHAR(191) NULL,
    `periode` VARCHAR(191) NOT NULL,
    `jadwal` VARCHAR(191) NULL,
    `satuan` VARCHAR(191) NOT NULL,
    `unitId` INTEGER NULL,
    `targetAwal` DECIMAL(15, 3) NOT NULL,
    `target` DECIMAL(15, 3) NOT NULL,
    `targetVolume` DECIMAL(15, 3) NULL,
    `realisasi` DECIMAL(15, 3) NOT NULL,
    `realisasiVolume` DECIMAL(15, 3) NULL,
    `status` ENUM('Belum Dikerjakan', 'Sedang Dikerjakan', 'Selesai Dikerjakan') NOT NULL,
    `update` VARCHAR(191) NOT NULL,
    `sumber` TEXT NOT NULL,
    `catatan` TEXT NOT NULL,
    `pagu` DECIMAL(18, 2) NOT NULL,
    `penggunaan` DECIMAL(18, 2) NOT NULL,
    `penggunaanBiaya` DECIMAL(18, 2) NULL,
    `penyedia` VARCHAR(255) NULL,
    `direktur` VARCHAR(191) NULL,
    `nilaiKontrak` DECIMAL(18, 2) NULL,
    `noKontrak` VARCHAR(191) NULL,
    `lebarJalan` DECIMAL(15, 3) NULL,
    `kondisiJalan` VARCHAR(191) NULL,
    `tanggalMulai` DATETIME(3) NULL,
    `tanggalSelesai` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Program_kode_key`(`kode`),
    INDEX `Program_operatorPengelolaId_idx`(`operatorPengelolaId`),
    INDEX `Program_categoryId_idx`(`categoryId`),
    INDEX `Program_kecamatanId_idx`(`kecamatanId`),
    INDEX `Program_unitId_idx`(`unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgramHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `programId` INTEGER NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `tahap` VARCHAR(255) NOT NULL,
    `nilai` DECIMAL(15, 3) NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,
    `keterangan` TEXT NOT NULL,
    `foto` BOOLEAN NOT NULL DEFAULT false,
    `penginput` VARCHAR(191) NOT NULL,
    `inputById` INTEGER NULL,
    `status` ENUM('Belum Dikerjakan', 'Sedang Dikerjakan', 'Selesai Dikerjakan') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProgramHistory_programId_idx`(`programId`),
    INDEX `ProgramHistory_inputById_idx`(`inputById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgramCost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `programId` INTEGER NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `uraian` TEXT NOT NULL,
    `nominal` DECIMAL(18, 2) NOT NULL,
    `input` VARCHAR(191) NOT NULL,
    `inputById` INTEGER NULL,
    `bukti` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProgramCost_programId_idx`(`programId`),
    INDEX `ProgramCost_inputById_idx`(`inputById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FieldSurvey` (
    `id` VARCHAR(191) NOT NULL,
    `kodeSurvey` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `surveyor` VARCHAR(191) NOT NULL,
    `surveyorId` INTEGER NULL,
    `programId` INTEGER NULL,
    `namaKegiatan` VARCHAR(255) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `kecamatan` VARCHAR(191) NOT NULL,
    `kecamatanId` INTEGER NULL,
    `desaKelurahan` VARCHAR(191) NOT NULL,
    `detailLokasi` TEXT NOT NULL,
    `koordinat` VARCHAR(100) NULL,
    `kondisi` ENUM('Baik', 'Rusak Ringan', 'Rusak Sedang', 'Rusak Berat') NOT NULL,
    `panjang` DECIMAL(15, 3) NULL,
    `lebar` DECIMAL(15, 3) NULL,
    `luasVolume` DECIMAL(15, 3) NULL,
    `satuan` VARCHAR(191) NULL,
    `tipeKonstruksi` VARCHAR(255) NULL,
    `estimasiBiaya` DECIMAL(18, 2) NULL,
    `tingkatUrgensi` ENUM('Rendah', 'Sedang', 'Tinggi / Mendesak') NOT NULL,
    `uraianTemuan` TEXT NOT NULL,
    `rekomendasi` TEXT NOT NULL,
    `kontakPendamping` VARCHAR(255) NULL,
    `foto` BOOLEAN NOT NULL DEFAULT false,
    `fotoUrl` TEXT NULL,
    `status` ENUM('Draft', 'Selesai Survey', 'Diverifikasi') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FieldSurvey_kodeSurvey_key`(`kodeSurvey`),
    INDEX `FieldSurvey_surveyorId_idx`(`surveyorId`),
    INDEX `FieldSurvey_programId_idx`(`programId`),
    INDEX `FieldSurvey_kecamatanId_idx`(`kecamatanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdviceRecord` (
    `id` VARCHAR(191) NOT NULL,
    `idKegiatan` INTEGER NOT NULL,
    `namaKegiatan` VARCHAR(255) NOT NULL,
    `identitasPimpinan` VARCHAR(191) NOT NULL,
    `pimpinanId` INTEGER NULL,
    `operatorPenerima` VARCHAR(191) NOT NULL,
    `operatorId` INTEGER NULL,
    `isi` TEXT NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AdviceRecord_idKegiatan_idx`(`idKegiatan`),
    INDEX `AdviceRecord_pimpinanId_idx`(`pimpinanId`),
    INDEX `AdviceRecord_operatorId_idx`(`operatorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Program` ADD CONSTRAINT `Program_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ProgramCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Program` ADD CONSTRAINT `Program_kecamatanId_fkey` FOREIGN KEY (`kecamatanId`) REFERENCES `Kecamatan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Program` ADD CONSTRAINT `Program_operatorPengelolaId_fkey` FOREIGN KEY (`operatorPengelolaId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Program` ADD CONSTRAINT `Program_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramHistory` ADD CONSTRAINT `ProgramHistory_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `Program`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramHistory` ADD CONSTRAINT `ProgramHistory_inputById_fkey` FOREIGN KEY (`inputById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramCost` ADD CONSTRAINT `ProgramCost_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `Program`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramCost` ADD CONSTRAINT `ProgramCost_inputById_fkey` FOREIGN KEY (`inputById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FieldSurvey` ADD CONSTRAINT `FieldSurvey_surveyorId_fkey` FOREIGN KEY (`surveyorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FieldSurvey` ADD CONSTRAINT `FieldSurvey_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `Program`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FieldSurvey` ADD CONSTRAINT `FieldSurvey_kecamatanId_fkey` FOREIGN KEY (`kecamatanId`) REFERENCES `Kecamatan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdviceRecord` ADD CONSTRAINT `AdviceRecord_idKegiatan_fkey` FOREIGN KEY (`idKegiatan`) REFERENCES `Program`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdviceRecord` ADD CONSTRAINT `AdviceRecord_pimpinanId_fkey` FOREIGN KEY (`pimpinanId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdviceRecord` ADD CONSTRAINT `AdviceRecord_operatorId_fkey` FOREIGN KEY (`operatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

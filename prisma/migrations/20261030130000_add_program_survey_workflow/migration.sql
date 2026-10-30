-- AlterTable
ALTER TABLE `User` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `lastLoginAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Program` ADD COLUMN `createdById` INTEGER NULL,
    ADD COLUMN `periodId` INTEGER NULL,
    ADD COLUMN `villageId` INTEGER NULL;

-- AlterTable
ALTER TABLE `AuditLog` ADD COLUMN `ipAddress` VARCHAR(64) NULL,
    ADD COLUMN `requestId` VARCHAR(191) NULL,
    ADD COLUMN `userAgent` TEXT NULL;

-- AlterTable
ALTER TABLE `ProgramCost` ADD COLUMN `kategori` VARCHAR(191) NULL,
    ADD COLUMN `rejectionReason` TEXT NULL,
    ADD COLUMN `status` ENUM('Draft', 'Diajukan', 'Diverifikasi', 'Ditolak') NOT NULL DEFAULT 'Diajukan',
    ADD COLUMN `verifiedAt` DATETIME(3) NULL,
    ADD COLUMN `verifiedById` INTEGER NULL;

-- AlterTable
ALTER TABLE `FieldSurvey` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `rejectionReason` TEXT NULL,
    ADD COLUMN `submittedAt` DATETIME(3) NULL,
    ADD COLUMN `verifiedAt` DATETIME(3) NULL,
    ADD COLUMN `verifiedById` INTEGER NULL,
    ADD COLUMN `villageId` INTEGER NULL,
    MODIFY `status` ENUM('Draft', 'Selesai Survey', 'Menunggu Verifikasi', 'Perlu Revisi', 'Diverifikasi', 'Dikonversi') NOT NULL;

-- CreateTable
CREATE TABLE `Village` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `kecamatanId` INTEGER NOT NULL,

    INDEX `Village_kecamatanId_idx`(`kecamatanId`),
    UNIQUE INDEX `Village_kecamatanId_nama_key`(`kecamatanId`, `nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Period` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `tahun` INTEGER NOT NULL,
    `tanggalMulai` DATETIME(3) NULL,
    `tanggalSelesai` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Period_tahun_idx`(`tahun`),
    INDEX `Period_isActive_idx`(`isActive`),
    UNIQUE INDEX `Period_nama_tahun_key`(`nama`, `tahun`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgramAssignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `programId` INTEGER NOT NULL,
    `operatorId` INTEGER NOT NULL,
    `assignedById` INTEGER NULL,
    `status` ENUM('Ditugaskan', 'Diterima', 'Ditolak', 'Dilepas') NOT NULL DEFAULT 'Ditugaskan',
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acceptedAt` DATETIME(3) NULL,
    `releasedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,

    INDEX `ProgramAssignment_programId_status_idx`(`programId`, `status`),
    INDEX `ProgramAssignment_operatorId_status_idx`(`operatorId`, `status`),
    INDEX `ProgramAssignment_assignedById_idx`(`assignedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgramCostDocument` (
    `id` VARCHAR(191) NOT NULL,
    `costId` INTEGER NOT NULL,
    `storageKey` VARCHAR(512) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(127) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `uploadedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProgramCostDocument_costId_idx`(`costId`),
    INDEX `ProgramCostDocument_uploadedById_idx`(`uploadedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgramProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `programId` INTEGER NOT NULL,
    `reportedById` INTEGER NULL,
    `verifiedById` INTEGER NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `tahap` VARCHAR(255) NOT NULL,
    `volume` DECIMAL(15, 3) NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,
    `persentase` DECIMAL(5, 2) NULL,
    `keterangan` TEXT NOT NULL,
    `status` ENUM('Draft', 'Diajukan', 'Diverifikasi', 'Ditolak') NOT NULL DEFAULT 'Diajukan',
    `verifiedAt` DATETIME(3) NULL,
    `rejectionReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProgramProgress_programId_tanggal_idx`(`programId`, `tanggal`),
    INDEX `ProgramProgress_reportedById_idx`(`reportedById`),
    INDEX `ProgramProgress_verifiedById_idx`(`verifiedById`),
    INDEX `ProgramProgress_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SurveyPhoto` (
    `id` VARCHAR(191) NOT NULL,
    `surveyId` VARCHAR(191) NOT NULL,
    `storageKey` VARCHAR(512) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(127) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `caption` VARCHAR(255) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `uploadedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SurveyPhoto_surveyId_idx`(`surveyId`),
    INDEX `SurveyPhoto_uploadedById_idx`(`uploadedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SurveyReview` (
    `id` VARCHAR(191) NOT NULL,
    `surveyId` VARCHAR(191) NOT NULL,
    `reviewerId` INTEGER NOT NULL,
    `decision` ENUM('Disetujui', 'Ditolak', 'Perlu Revisi') NOT NULL,
    `notes` TEXT NULL,
    `reviewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SurveyReview_surveyId_reviewedAt_idx`(`surveyId`, `reviewedAt`),
    INDEX `SurveyReview_reviewerId_idx`(`reviewerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SurveyStatusHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `surveyId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('Draft', 'Selesai Survey', 'Menunggu Verifikasi', 'Perlu Revisi', 'Diverifikasi', 'Dikonversi') NULL,
    `toStatus` ENUM('Draft', 'Selesai Survey', 'Menunggu Verifikasi', 'Perlu Revisi', 'Diverifikasi', 'Dikonversi') NOT NULL,
    `changedById` INTEGER NULL,
    `reason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SurveyStatusHistory_surveyId_createdAt_idx`(`surveyId`, `createdAt`),
    INDEX `SurveyStatusHistory_changedById_idx`(`changedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SurveyProgramLink` (
    `id` VARCHAR(191) NOT NULL,
    `surveyId` VARCHAR(191) NOT NULL,
    `programId` INTEGER NOT NULL,
    `linkedById` INTEGER NULL,
    `relationType` VARCHAR(32) NOT NULL,
    `linkedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SurveyProgramLink_programId_idx`(`programId`),
    INDEX `SurveyProgramLink_linkedById_idx`(`linkedById`),
    UNIQUE INDEX `SurveyProgramLink_surveyId_programId_key`(`surveyId`, `programId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdviceReply` (
    `id` VARCHAR(191) NOT NULL,
    `adviceId` VARCHAR(191) NOT NULL,
    `authorId` INTEGER NOT NULL,
    `isi` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AdviceReply_adviceId_createdAt_idx`(`adviceId`, `createdAt`),
    INDEX `AdviceReply_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Program_periodId_idx` ON `Program`(`periodId`);

-- CreateIndex
CREATE INDEX `Program_villageId_idx` ON `Program`(`villageId`);

-- CreateIndex
CREATE INDEX `Program_createdById_idx` ON `Program`(`createdById`);

-- CreateIndex
CREATE INDEX `ProgramCost_status_idx` ON `ProgramCost`(`status`);

-- CreateIndex
CREATE INDEX `ProgramCost_verifiedById_idx` ON `ProgramCost`(`verifiedById`);

-- CreateIndex
CREATE INDEX `FieldSurvey_villageId_idx` ON `FieldSurvey`(`villageId`);

-- CreateIndex
CREATE INDEX `FieldSurvey_verifiedById_idx` ON `FieldSurvey`(`verifiedById`);

-- CreateIndex
CREATE INDEX `FieldSurvey_deletedAt_idx` ON `FieldSurvey`(`deletedAt`);

-- AddForeignKey
ALTER TABLE `Village` ADD CONSTRAINT `Village_kecamatanId_fkey` FOREIGN KEY (`kecamatanId`) REFERENCES `Kecamatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Program` ADD CONSTRAINT `Program_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `Period`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Program` ADD CONSTRAINT `Program_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Program` ADD CONSTRAINT `Program_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Program` ADD CONSTRAINT `Program_deletedById_fkey` FOREIGN KEY (`deletedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramAssignment` ADD CONSTRAINT `ProgramAssignment_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `Program`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramAssignment` ADD CONSTRAINT `ProgramAssignment_operatorId_fkey` FOREIGN KEY (`operatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramAssignment` ADD CONSTRAINT `ProgramAssignment_assignedById_fkey` FOREIGN KEY (`assignedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramCost` ADD CONSTRAINT `ProgramCost_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramCostDocument` ADD CONSTRAINT `ProgramCostDocument_costId_fkey` FOREIGN KEY (`costId`) REFERENCES `ProgramCost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramCostDocument` ADD CONSTRAINT `ProgramCostDocument_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramProgress` ADD CONSTRAINT `ProgramProgress_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `Program`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramProgress` ADD CONSTRAINT `ProgramProgress_reportedById_fkey` FOREIGN KEY (`reportedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramProgress` ADD CONSTRAINT `ProgramProgress_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FieldSurvey` ADD CONSTRAINT `FieldSurvey_villageId_fkey` FOREIGN KEY (`villageId`) REFERENCES `Village`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FieldSurvey` ADD CONSTRAINT `FieldSurvey_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyPhoto` ADD CONSTRAINT `SurveyPhoto_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `FieldSurvey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyPhoto` ADD CONSTRAINT `SurveyPhoto_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyReview` ADD CONSTRAINT `SurveyReview_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `FieldSurvey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyReview` ADD CONSTRAINT `SurveyReview_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyStatusHistory` ADD CONSTRAINT `SurveyStatusHistory_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `FieldSurvey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyStatusHistory` ADD CONSTRAINT `SurveyStatusHistory_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyProgramLink` ADD CONSTRAINT `SurveyProgramLink_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `FieldSurvey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyProgramLink` ADD CONSTRAINT `SurveyProgramLink_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `Program`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyProgramLink` ADD CONSTRAINT `SurveyProgramLink_linkedById_fkey` FOREIGN KEY (`linkedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdviceReply` ADD CONSTRAINT `AdviceReply_adviceId_fkey` FOREIGN KEY (`adviceId`) REFERENCES `AdviceRecord`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdviceReply` ADD CONSTRAINT `AdviceReply_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Session_tokenHash_key`(`tokenHash`),
    INDEX `Session_userId_idx`(`userId`),
    INDEX `Session_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddIndex
CREATE INDEX `Program_status_idx` ON `Program`(`status`);
CREATE INDEX `Program_createdAt_idx` ON `Program`(`createdAt`);
CREATE INDEX `FieldSurvey_status_idx` ON `FieldSurvey`(`status`);
CREATE INDEX `FieldSurvey_createdAt_idx` ON `FieldSurvey`(`createdAt`);
CREATE INDEX `AdviceRecord_status_idx` ON `AdviceRecord`(`status`);
CREATE INDEX `AdviceRecord_tanggal_idx` ON `AdviceRecord`(`tanggal`);

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

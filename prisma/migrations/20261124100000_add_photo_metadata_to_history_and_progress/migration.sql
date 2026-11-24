-- Kolom metadata foto untuk riwayat dan progres program.
-- Dibuat nullable agar baris lama tetap valid.
ALTER TABLE `ProgramHistory`
  ADD COLUMN `storageKey` VARCHAR(512) NULL,
  ADD COLUMN `originalName` VARCHAR(255) NULL;

ALTER TABLE `ProgramProgress`
  ADD COLUMN `storageKey` VARCHAR(512) NULL,
  ADD COLUMN `originalName` VARCHAR(255) NULL;

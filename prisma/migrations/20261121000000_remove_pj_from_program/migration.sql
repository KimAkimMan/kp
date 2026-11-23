-- Remove `pj` (penanggung jawab string) from Program model.
-- Replaced by `operatorPengelola` + `operatorPengelolaId` which have proper
-- foreign-key relationship to User table.
ALTER TABLE `Program` DROP COLUMN `pj`;

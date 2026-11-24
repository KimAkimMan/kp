-- Selaraskan tipe kolom fotoUrl dengan schema (@db.LongText).
-- Hanya memperlebar tipe (TEXT -> LONGTEXT); data lama tetap aman.
ALTER TABLE `FieldSurvey`
  MODIFY COLUMN `fotoUrl` LONGTEXT NULL;

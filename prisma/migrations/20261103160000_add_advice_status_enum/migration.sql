-- Normalize advice workflow status values before constraining the column.
UPDATE `AdviceRecord`
SET `status` = 'Belum ditindaklanjuti'
WHERE `status` IS NULL
   OR `status` NOT IN ('Belum ditindaklanjuti', 'Sudah ditindaklanjuti');

ALTER TABLE `AdviceRecord`
MODIFY `status` ENUM('Belum ditindaklanjuti', 'Sudah ditindaklanjuti') NOT NULL;

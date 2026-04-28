ALTER TABLE schedule_blocks ADD COLUMN start_minute INTEGER;
ALTER TABLE schedule_blocks ADD COLUMN end_minute INTEGER;

UPDATE schedule_blocks
SET
  start_minute = start_hour * 60,
  end_minute = end_hour * 60
WHERE start_minute IS NULL OR end_minute IS NULL;

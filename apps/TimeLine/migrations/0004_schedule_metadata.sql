ALTER TABLE schedules ADD COLUMN instructor TEXT;
ALTER TABLE schedules ADD COLUMN notes TEXT;

ALTER TABLE schedule_overrides ADD COLUMN instructor TEXT;
ALTER TABLE schedule_overrides ADD COLUMN notes TEXT;

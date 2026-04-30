ALTER TABLE schedule_blocks ADD COLUMN group_id TEXT;

CREATE INDEX idx_blocks_group ON schedule_blocks(group_id);

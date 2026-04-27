PRAGMA foreign_keys = OFF;

ALTER TABLE schedule_blocks RENAME TO schedule_blocks_legacy;

CREATE TABLE schedule_blocks (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  cohort_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('class', 'club', 'event', 'open_lab')),
  title TEXT NOT NULL CHECK (trim(title) <> ''),
  description TEXT,
  color TEXT,
  organizer TEXT,
  start_hour INTEGER NOT NULL CHECK (start_hour BETWEEN 8 AND 19),
  end_hour INTEGER NOT NULL CHECK (end_hour BETWEEN 9 AND 20),
  recurrence TEXT NOT NULL DEFAULT 'one_time' CHECK (recurrence IN ('one_time', 'daily', 'weekly')),
  specific_date TEXT,
  days_of_week TEXT CHECK (days_of_week IS NULL OR json_valid(days_of_week)),
  valid_from TEXT NOT NULL,
  valid_until TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (end_hour > start_hour),
  CHECK (
    (recurrence = 'one_time' AND specific_date IS NOT NULL)
    OR (recurrence = 'weekly' AND days_of_week IS NOT NULL)
    OR (recurrence = 'daily')
  ),
  CHECK (valid_until IS NULL OR valid_from <= valid_until),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (cohort_id) REFERENCES cohorts(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO schedule_blocks (
  id,
  room_id,
  cohort_id,
  type,
  title,
  description,
  color,
  organizer,
  start_hour,
  end_hour,
  recurrence,
  specific_date,
  days_of_week,
  valid_from,
  valid_until,
  is_active,
  created_by,
  created_at,
  updated_at
)
SELECT
  id,
  room_id,
  cohort_id,
  type,
  title,
  description,
  color,
  organizer,
  start_hour,
  end_hour,
  recurrence,
  specific_date,
  days_of_week,
  valid_from,
  valid_until,
  is_active,
  created_by,
  created_at,
  updated_at
FROM schedule_blocks_legacy;

DROP TABLE schedule_blocks_legacy;

CREATE INDEX idx_blocks_room ON schedule_blocks(room_id);
CREATE INDEX idx_blocks_type ON schedule_blocks(type);
CREATE INDEX idx_blocks_date ON schedule_blocks(specific_date);
CREATE INDEX idx_blocks_valid ON schedule_blocks(valid_from, valid_until);
CREATE INDEX idx_blocks_cohort ON schedule_blocks(cohort_id);

PRAGMA foreign_keys = ON;

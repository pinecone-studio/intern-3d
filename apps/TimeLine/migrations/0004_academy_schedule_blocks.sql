PRAGMA foreign_keys = ON;

ALTER TABLE rooms ADD COLUMN imac_count INTEGER NOT NULL DEFAULT 25;
ALTER TABLE rooms ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1));
ALTER TABLE rooms ADD COLUMN notes TEXT;

UPDATE rooms
SET imac_count = CASE
  WHEN type = 'event_hall' THEN 0
  WHEN capacity > 0 THEN capacity
  ELSE 25
END;

CREATE TABLE cohorts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (trim(name) <> ''),
  room_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (start_date <= end_date),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
);

CREATE INDEX idx_cohorts_room_dates ON cohorts(room_id, start_date, end_date);
CREATE INDEX idx_cohorts_status ON cohorts(status);

CREATE TABLE schedule_blocks (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  cohort_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('class', 'club', 'event', 'open_lab')),
  title TEXT NOT NULL CHECK (trim(title) <> ''),
  description TEXT,
  color TEXT,
  organizer TEXT,
  start_hour INTEGER NOT NULL CHECK (start_hour BETWEEN 9 AND 19),
  end_hour INTEGER NOT NULL CHECK (end_hour BETWEEN 10 AND 20),
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

CREATE INDEX idx_blocks_room ON schedule_blocks(room_id);
CREATE INDEX idx_blocks_type ON schedule_blocks(type);
CREATE INDEX idx_blocks_date ON schedule_blocks(specific_date);
CREATE INDEX idx_blocks_valid ON schedule_blocks(valid_from, valid_until);
CREATE INDEX idx_blocks_cohort ON schedule_blocks(cohort_id);

INSERT INTO schedule_blocks (
  id,
  room_id,
  type,
  title,
  start_hour,
  end_hour,
  recurrence,
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
  CASE type
    WHEN 'open' THEN 'open_lab'
    ELSE type
  END,
  title,
  CAST(substr(start_time, 1, 2) AS INTEGER),
  CAST(substr(end_time, 1, 2) AS INTEGER),
  CASE
    WHEN json_array_length(days_of_week) >= 5 THEN 'daily'
    ELSE 'weekly'
  END,
  days_of_week,
  start_date,
  end_date,
  1,
  created_by,
  created_at,
  created_at
FROM schedules
WHERE CAST(substr(end_time, 1, 2) AS INTEGER) > CAST(substr(start_time, 1, 2) AS INTEGER);

INSERT INTO schedule_blocks (
  id,
  room_id,
  type,
  title,
  start_hour,
  end_hour,
  recurrence,
  specific_date,
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
  CASE type
    WHEN 'closed' THEN 'event'
    WHEN 'open' THEN 'open_lab'
    ELSE type
  END,
  title,
  CAST(substr(start_time, 1, 2) AS INTEGER),
  CAST(substr(end_time, 1, 2) AS INTEGER),
  'one_time',
  date,
  date,
  date,
  1,
  created_by,
  created_at,
  created_at
FROM schedule_overrides
WHERE CAST(substr(end_time, 1, 2) AS INTEGER) > CAST(substr(start_time, 1, 2) AS INTEGER);

PRAGMA foreign_keys = OFF;

ALTER TABLE rooms RENAME TO rooms_legacy;
ALTER TABLE schedule_events RENAME TO schedule_events_legacy;
ALTER TABLE devices RENAME TO devices_legacy;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (trim(name) <> ''),
  email TEXT NOT NULL UNIQUE CHECK (trim(email) <> ''),
  role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (trim(name) <> ''),
  floor INTEGER NOT NULL CHECK (floor >= 1),
  type TEXT NOT NULL CHECK (type IN ('lab', 'event_hall')),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schedules (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  title TEXT NOT NULL CHECK (trim(title) <> ''),
  type TEXT NOT NULL CHECK (type IN ('class', 'club', 'open')),
  days_of_week TEXT NOT NULL CHECK (json_valid(days_of_week)),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (start_time < end_time),
  CHECK (start_date <= end_date),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE schedule_overrides (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('class', 'club', 'open', 'closed')),
  title TEXT NOT NULL CHECK (trim(title) <> ''),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (start_time < end_time),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE device_assignments (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  device_name TEXT NOT NULL CHECK (trim(device_name) <> ''),
  user_id TEXT,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_schedules_room_id ON schedules(room_id);
CREATE INDEX idx_schedules_room_date_range ON schedules(room_id, start_date, end_date);
CREATE INDEX idx_schedule_overrides_room_date ON schedule_overrides(room_id, date);
CREATE INDEX idx_schedule_overrides_room_date_time ON schedule_overrides(room_id, date, start_time, end_time);
CREATE INDEX idx_device_assignments_room_id ON device_assignments(room_id);
CREATE UNIQUE INDEX idx_device_assignments_room_device ON device_assignments(room_id, device_name);
CREATE UNIQUE INDEX idx_device_assignments_user_id ON device_assignments(user_id) WHERE user_id IS NOT NULL;

INSERT OR IGNORE INTO users (id, name, email, role, created_at) VALUES
  ('admin-1', 'Ariun Admin', 'admin@school.local', 'admin', CURRENT_TIMESTAMP),
  ('student-1', 'Maya Student', 'maya.student@school.local', 'student', CURRENT_TIMESTAMP),
  ('student-2', 'Noah Student', 'noah.student@school.local', 'student', CURRENT_TIMESTAMP),
  ('student-3', 'Lena Student', 'lena.student@school.local', 'student', CURRENT_TIMESTAMP);

INSERT INTO rooms (id, name, floor, type, capacity, created_at)
SELECT
  id,
  number,
  floor,
  CASE
    WHEN type = 'event-hall' THEN 'event_hall'
    ELSE type
  END,
  CASE
    WHEN type = 'event-hall' THEN 80
    WHEN number IN ('301', '401') THEN 32
    WHEN number IN ('302', '305', '402') THEN 28
    WHEN number IN ('303', '403') THEN 30
    ELSE 24
  END,
  COALESCE(created_at, CURRENT_TIMESTAMP)
FROM rooms_legacy;

INSERT INTO schedules (
  id,
  room_id,
  title,
  type,
  days_of_week,
  start_time,
  end_time,
  start_date,
  end_date,
  created_by,
  created_at
)
SELECT
  id,
  room_id,
  title,
  CASE
    WHEN type = 'openlab' THEN 'open'
    ELSE type
  END,
  CASE
    WHEN json_valid(days_of_week) THEN days_of_week
    WHEN day_of_week IS NOT NULL THEN json_array(day_of_week)
    ELSE json_array()
  END,
  start_time,
  end_time,
  COALESCE(valid_from, '2026-01-01'),
  COALESCE(valid_until, '2026-12-31'),
  'admin-1',
  COALESCE(created_at, CURRENT_TIMESTAMP)
FROM schedule_events_legacy
WHERE is_override = 0
  AND type IN ('class', 'club', 'openlab');

INSERT INTO schedule_overrides (
  id,
  room_id,
  date,
  start_time,
  end_time,
  type,
  title,
  created_by,
  created_at
)
SELECT
  id,
  room_id,
  COALESCE(date, valid_from, '2026-01-01'),
  start_time,
  end_time,
  CASE
    WHEN type = 'openlab' THEN 'open'
    ELSE type
  END,
  title,
  'admin-1',
  COALESCE(created_at, CURRENT_TIMESTAMP)
FROM schedule_events_legacy
WHERE is_override = 1
  AND type IN ('class', 'club', 'openlab', 'closed');

INSERT INTO device_assignments (id, room_id, device_name, user_id)
SELECT
  id,
  room_id,
  name,
  CASE
    WHEN assigned_to IN ('admin-1', 'student-1', 'student-2', 'student-3') THEN assigned_to
    ELSE NULL
  END
FROM devices_legacy;

DROP VIEW IF EXISTS room_current_status;

CREATE VIEW room_current_status AS
WITH
  current_context AS (
    SELECT
      DATE('now', 'localtime') AS current_date,
      TIME('now', 'localtime') AS current_time
  ),
  day_offsets(offset) AS (
    SELECT 0
    UNION ALL
    SELECT offset + 1
    FROM day_offsets
    WHERE offset < 7
  ),
  day_cursor AS (
    SELECT DATE('now', 'localtime', '+' || offset || ' day') AS day
    FROM day_offsets
  ),
  active_override_ranked AS (
    SELECT
      o.room_id,
      o.type,
      o.title,
      ROW_NUMBER() OVER (
        PARTITION BY o.room_id
        ORDER BY
          CASE o.type
            WHEN 'closed' THEN 4
            WHEN 'class' THEN 3
            WHEN 'club' THEN 2
            WHEN 'open' THEN 1
          END DESC,
          o.start_time ASC,
          o.created_at DESC
      ) AS rn
    FROM schedule_overrides o
    JOIN current_context c
      ON o.date = c.current_date
    WHERE o.start_time <= c.current_time
      AND o.end_time > c.current_time
  ),
  active_schedule_ranked AS (
    SELECT
      s.room_id,
      s.type,
      s.title,
      ROW_NUMBER() OVER (
        PARTITION BY s.room_id
        ORDER BY
          CASE s.type
            WHEN 'class' THEN 3
            WHEN 'club' THEN 2
            WHEN 'open' THEN 1
          END DESC,
          s.start_time ASC,
          s.created_at DESC
      ) AS rn
    FROM schedules s
    JOIN current_context c
    WHERE c.current_date BETWEEN s.start_date AND s.end_date
      AND s.start_time <= c.current_time
      AND s.end_time > c.current_time
      AND EXISTS (
        SELECT 1
        FROM json_each(s.days_of_week) d
        WHERE CAST(d.value AS INTEGER) = ((CAST(STRFTIME('%w', c.current_date) AS INTEGER) + 6) % 7) + 1
      )
  ),
  next_override_ranked AS (
    SELECT
      o.room_id,
      o.type,
      o.title,
      DATETIME(o.date || ' ' || o.start_time) AS starts_at,
      ROW_NUMBER() OVER (
        PARTITION BY o.room_id
        ORDER BY DATETIME(o.date || ' ' || o.start_time) ASC, o.created_at DESC
      ) AS rn
    FROM schedule_overrides o
    JOIN current_context c
    WHERE DATETIME(o.date || ' ' || o.start_time) > DATETIME(c.current_date || ' ' || c.current_time)
  ),
  next_schedule_candidates AS (
    SELECT
      s.room_id,
      s.type,
      s.title,
      DATETIME(day_cursor.day || ' ' || s.start_time) AS starts_at,
      s.created_at
    FROM schedules s
    JOIN current_context c
    JOIN day_cursor
    WHERE day_cursor.day BETWEEN s.start_date AND s.end_date
      AND DATETIME(day_cursor.day || ' ' || s.start_time) > DATETIME(c.current_date || ' ' || c.current_time)
      AND EXISTS (
        SELECT 1
        FROM json_each(s.days_of_week) d
        WHERE CAST(d.value AS INTEGER) = ((CAST(STRFTIME('%w', day_cursor.day) AS INTEGER) + 6) % 7) + 1
      )
  ),
  next_schedule_ranked AS (
    SELECT
      room_id,
      type,
      title,
      starts_at,
      ROW_NUMBER() OVER (
        PARTITION BY room_id
        ORDER BY starts_at ASC, created_at DESC
      ) AS rn
    FROM next_schedule_candidates
  ),
  next_event_ranked AS (
    SELECT
      room_id,
      type,
      title,
      starts_at,
      ROW_NUMBER() OVER (
        PARTITION BY room_id
        ORDER BY starts_at ASC, source_priority DESC
      ) AS rn
    FROM (
      SELECT room_id, type, title, starts_at, 2 AS source_priority
      FROM next_override_ranked
      WHERE rn = 1

      UNION ALL

      SELECT room_id, type, title, starts_at, 1 AS source_priority
      FROM next_schedule_ranked
      WHERE rn = 1
    )
  )
SELECT
  r.id AS room_id,
  COALESCE(ao.type, s.type, 'open') AS current_status,
  COALESCE(ao.title, s.title, 'Available') AS current_event,
  CASE
    WHEN ne.room_id IS NULL THEN NULL
    ELSE ne.title || ' [' || ne.type || '] @ ' || STRFTIME('%Y-%m-%d %H:%M', ne.starts_at)
  END AS next_event
FROM rooms r
LEFT JOIN active_override_ranked ao
  ON ao.room_id = r.id
 AND ao.rn = 1
LEFT JOIN active_schedule_ranked s
  ON s.room_id = r.id
 AND s.rn = 1
LEFT JOIN next_event_ranked ne
  ON ne.room_id = r.id
 AND ne.rn = 1;

DROP TABLE devices_legacy;
DROP TABLE schedule_events_legacy;
DROP TABLE rooms_legacy;

PRAGMA foreign_keys = ON;

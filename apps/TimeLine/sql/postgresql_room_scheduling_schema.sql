BEGIN;

-- ============================================================================
-- Internal Room Scheduling System
-- PostgreSQL schema for rooms, recurring schedules, date overrides,
-- and iMac assignment tracking.
--
-- Core resolution model:
-- 1. Check active override for the room/date/time
-- 2. Else check active recurring weekly schedule
-- 3. Else treat the room as open
--
-- Recurring schedules are stored as rules, not expanded into daily rows.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'student');
CREATE TYPE room_type AS ENUM ('lab', 'event_hall');
CREATE TYPE event_type AS ENUM ('class', 'club', 'open', 'closed');

-- Used to resolve overlapping events. For recurring schedules, "closed" is
-- disallowed. It remains available for overrides where it should win.
CREATE OR REPLACE FUNCTION event_type_priority(input_type event_type)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE input_type
    WHEN 'closed' THEN 400
    WHEN 'class' THEN 300
    WHEN 'club' THEN 200
    WHEN 'open' THEN 100
  END;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (btrim(name) <> ''),
  email text NOT NULL CHECK (btrim(email) <> ''),
  role user_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (btrim(name) <> ''),
  floor integer NOT NULL CHECK (floor >= 1),
  type room_type NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (btrim(title) <> ''),
  type event_type NOT NULL,
  days_of_week integer[] NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT schedules_valid_time_range CHECK (start_time < end_time),
  CONSTRAINT schedules_valid_date_range CHECK (start_date <= end_date),
  CONSTRAINT schedules_non_empty_days CHECK (cardinality(days_of_week) > 0),
  CONSTRAINT schedules_valid_days_of_week
    CHECK (days_of_week <@ ARRAY[1, 2, 3, 4, 5, 6, 7]::integer[]),
  CONSTRAINT schedules_allowed_type CHECK (type IN ('class', 'club', 'open'))
);

CREATE TABLE schedule_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  type event_type NOT NULL,
  title text NOT NULL CHECK (btrim(title) <> ''),
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT schedule_overrides_valid_time_range CHECK (start_time < end_time)
);

-- Represents each iMac in a room plus its optional current user assignment.
CREATE TABLE device_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  device_name text NOT NULL CHECK (btrim(device_name) <> ''),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES AND UNIQUENESS
-- ============================================================================

CREATE UNIQUE INDEX idx_users_email ON users (lower(email));
CREATE UNIQUE INDEX idx_rooms_name ON rooms(name);

CREATE INDEX idx_schedules_room_id ON schedules(room_id);
CREATE INDEX idx_schedules_room_date_range ON schedules(room_id, start_date, end_date);
CREATE INDEX idx_schedules_days_of_week_gin ON schedules USING gin (days_of_week);

CREATE INDEX idx_schedule_overrides_room_date ON schedule_overrides(room_id, date);
CREATE INDEX idx_schedule_overrides_room_date_time
  ON schedule_overrides(room_id, date, start_time, end_time);

CREATE INDEX idx_device_assignments_room_id ON device_assignments(room_id);
CREATE UNIQUE INDEX idx_device_assignments_room_device
  ON device_assignments(room_id, device_name);
CREATE UNIQUE INDEX idx_device_assignments_user_id
  ON device_assignments(user_id)
  WHERE user_id IS NOT NULL;

-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO users (id, name, email, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Ariun Admin', 'admin@school.local', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'Maya Student', 'maya.student@school.local', 'student'),
  ('33333333-3333-3333-3333-333333333333', 'Noah Student', 'noah.student@school.local', 'student'),
  ('44444444-4444-4444-4444-444444444444', 'Lena Student', 'lena.student@school.local', 'student');

INSERT INTO rooms (id, name, floor, type, capacity) VALUES
  ('30100000-0000-0000-0000-000000000001', '301', 3, 'lab', 32),
  ('30200000-0000-0000-0000-000000000002', '302', 3, 'lab', 28),
  ('30300000-0000-0000-0000-000000000003', '303', 3, 'lab', 30),
  ('30400000-0000-0000-0000-000000000004', '304', 3, 'lab', 26),
  ('30500000-0000-0000-0000-000000000005', '305', 3, 'lab', 24),
  ('40100000-0000-0000-0000-000000000006', '401', 4, 'lab', 36),
  ('40200000-0000-0000-0000-000000000007', '402', 4, 'event_hall', 80),
  ('40300000-0000-0000-0000-000000000008', '403', 4, 'lab', 34);

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
  created_by
) VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    '30100000-0000-0000-0000-000000000001',
    'Physics 101',
    'class',
    ARRAY[1, 3, 5],
    '08:00',
    '09:30',
    DATE '2026-01-12',
    DATE '2026-12-18',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '30200000-0000-0000-0000-000000000002',
    'Chemistry Lab',
    'class',
    ARRAY[2, 4],
    '10:00',
    '12:00',
    DATE '2026-01-12',
    DATE '2026-12-18',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    '40100000-0000-0000-0000-000000000006',
    'Advanced Mathematics',
    'class',
    ARRAY[1, 3, 5],
    '13:00',
    '14:30',
    DATE '2026-01-12',
    DATE '2026-12-18',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '50000000-0000-0000-0000-000000000004',
    '30300000-0000-0000-0000-000000000003',
    'Robotics Club',
    'club',
    ARRAY[2, 4],
    '15:30',
    '17:00',
    DATE '2026-01-12',
    DATE '2026-12-18',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '50000000-0000-0000-0000-000000000005',
    '40200000-0000-0000-0000-000000000007',
    'Debate Society',
    'club',
    ARRAY[3, 5],
    '16:00',
    '17:30',
    DATE '2026-01-12',
    DATE '2026-12-18',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '50000000-0000-0000-0000-000000000006',
    '30400000-0000-0000-0000-000000000004',
    'Open Study Lab',
    'open',
    ARRAY[1, 2, 3, 4, 5],
    '09:00',
    '12:00',
    DATE '2026-01-12',
    DATE '2026-12-18',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '50000000-0000-0000-0000-000000000007',
    '30500000-0000-0000-0000-000000000005',
    'Weekend Open Access',
    'open',
    ARRAY[6],
    '10:00',
    '14:00',
    DATE '2026-01-12',
    DATE '2026-12-18',
    '11111111-1111-1111-1111-111111111111'
  );

INSERT INTO schedule_overrides (
  id,
  room_id,
  date,
  start_time,
  end_time,
  type,
  title,
  created_by
) VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    '30100000-0000-0000-0000-000000000001',
    DATE '2026-04-24',
    '08:00',
    '12:00',
    'closed',
    'Projector Maintenance',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '30300000-0000-0000-0000-000000000003',
    DATE '2026-04-27',
    '14:00',
    '16:00',
    'class',
    'Make-up Programming Lab',
    '11111111-1111-1111-1111-111111111111'
  );

-- Six iMacs per room. One device is assigned to Maya Student.
INSERT INTO device_assignments (room_id, device_name, user_id)
SELECT
  r.id,
  format('iMac-%s', lpad(series.device_no::text, 2, '0')),
  CASE
    WHEN r.name = '301' AND series.device_no = 1
      THEN '22222222-2222-2222-2222-222222222222'::uuid
    ELSE NULL
  END
FROM rooms AS r
CROSS JOIN generate_series(1, 6) AS series(device_no)
ORDER BY r.name, series.device_no;

-- ============================================================================
-- VIEW: room_current_status
-- ============================================================================

-- Resolution order:
-- 1. Active override on the exact date/time
-- 2. Active recurring schedule
-- 3. Fallback status = open
--
-- next_event is the nearest future override or recurring occurrence.
CREATE OR REPLACE VIEW room_current_status AS
WITH context AS (
  SELECT
    localtimestamp AS ts_now,
    localtimestamp::date AS current_date,
    localtimestamp::time AS current_time,
    EXTRACT(ISODOW FROM localtimestamp::date)::integer AS current_isodow
),
active_override AS (
  SELECT DISTINCT ON (o.room_id)
    o.room_id,
    o.type,
    o.title
  FROM schedule_overrides AS o
  CROSS JOIN context AS c
  WHERE o.date = c.current_date
    AND o.start_time <= c.current_time
    AND o.end_time > c.current_time
  ORDER BY
    o.room_id,
    event_type_priority(o.type) DESC,
    o.start_time ASC,
    o.created_at DESC
),
active_schedule AS (
  SELECT DISTINCT ON (s.room_id)
    s.room_id,
    s.type,
    s.title
  FROM schedules AS s
  CROSS JOIN context AS c
  WHERE c.current_date BETWEEN s.start_date AND s.end_date
    AND s.days_of_week @> ARRAY[c.current_isodow]
    AND s.start_time <= c.current_time
    AND s.end_time > c.current_time
  ORDER BY
    s.room_id,
    event_type_priority(s.type) DESC,
    s.start_time ASC,
    s.created_at DESC
),
next_override AS (
  SELECT DISTINCT ON (o.room_id)
    o.room_id,
    o.type,
    o.title,
    (o.date + o.start_time) AS starts_at,
    o.created_at
  FROM schedule_overrides AS o
  CROSS JOIN context AS c
  WHERE (o.date + o.start_time) > c.ts_now
  ORDER BY
    o.room_id,
    (o.date + o.start_time) ASC,
    event_type_priority(o.type) DESC,
    o.created_at DESC
),
next_schedule_candidates AS (
  SELECT
    s.room_id,
    s.type,
    s.title,
    (occurrence_day + s.start_time) AS starts_at,
    s.created_at
  FROM schedules AS s
  CROSS JOIN context AS c
  CROSS JOIN LATERAL (
    SELECT generated_day::date AS occurrence_day
    FROM generate_series(
      GREATEST(s.start_date, c.current_date)::timestamp,
      LEAST(s.end_date, c.current_date + 7)::timestamp,
      interval '1 day'
    ) AS generated_day
  ) AS upcoming_days
  WHERE s.days_of_week @> ARRAY[EXTRACT(ISODOW FROM occurrence_day)::integer]
    AND (occurrence_day + s.start_time) > c.ts_now
),
next_schedule AS (
  SELECT DISTINCT ON (room_id)
    room_id,
    type,
    title,
    starts_at,
    created_at
  FROM next_schedule_candidates
  ORDER BY
    room_id,
    starts_at ASC,
    event_type_priority(type) DESC,
    created_at DESC
),
next_event AS (
  SELECT DISTINCT ON (candidate.room_id)
    candidate.room_id,
    candidate.type,
    candidate.title,
    candidate.starts_at
  FROM (
    SELECT
      room_id,
      type,
      title,
      starts_at,
      created_at,
      2 AS source_priority
    FROM next_override
    UNION ALL
    SELECT
      room_id,
      type,
      title,
      starts_at,
      created_at,
      1 AS source_priority
    FROM next_schedule
  ) AS candidate
  ORDER BY
    candidate.room_id,
    candidate.starts_at ASC,
    candidate.source_priority DESC,
    event_type_priority(candidate.type) DESC,
    candidate.created_at DESC
)
SELECT
  r.id AS room_id,
  COALESCE(ao.type, rs.type, 'open'::event_type) AS current_status,
  COALESCE(ao.title, rs.title, 'Available') AS current_event,
  CASE
    WHEN ne.room_id IS NULL THEN NULL
    ELSE format(
      '%s [%s] @ %s',
      ne.title,
      ne.type,
      to_char(ne.starts_at, 'YYYY-MM-DD HH24:MI')
    )
  END AS next_event
FROM rooms AS r
LEFT JOIN active_override AS ao
  ON ao.room_id = r.id
LEFT JOIN active_schedule AS rs
  ON rs.room_id = r.id
LEFT JOIN next_event AS ne
  ON ne.room_id = r.id;

COMMIT;

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  floor INTEGER NOT NULL CHECK (floor IN (3, 4)),
  type TEXT NOT NULL CHECK (type IN ('lab', 'event-hall')),
  status TEXT NOT NULL CHECK (status IN ('available', 'class', 'club', 'closed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule_events (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('class', 'club', 'openlab', 'closed')),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  day_of_week INTEGER,
  days_of_week TEXT NOT NULL DEFAULT '[]',
  date TEXT,
  is_override INTEGER NOT NULL DEFAULT 0 CHECK (is_override IN (0, 1)),
  instructor TEXT,
  notes TEXT,
  valid_from TEXT,
  valid_until TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rooms_floor ON rooms(floor);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_schedule_events_room_id ON schedule_events(room_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_date ON schedule_events(date);
CREATE INDEX IF NOT EXISTS idx_schedule_events_day_of_week ON schedule_events(day_of_week);

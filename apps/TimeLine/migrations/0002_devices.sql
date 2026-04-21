CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  room_id TEXT NOT NULL,
  room_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'assigned', 'maintenance')),
  assigned_to TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_devices_room_id ON devices(room_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);

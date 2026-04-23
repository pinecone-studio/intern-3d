CREATE TABLE IF NOT EXISTS form_options (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, value)
);

INSERT OR IGNORE INTO form_options (id, category, value, sort_order) VALUES
  ('teacher-1', 'teacher', 'Багш Сараа Ким', 10),
  ('teacher-2', 'teacher', 'Бат-Эрдэнэ багш', 20),
  ('teacher-3', 'teacher', 'Нараа багш', 30),
  ('teacher-4', 'teacher', 'Темүүлэн багш', 40),
  ('day-1', 'allowed_day', 'Даваа, Лхагва, Баасан', 10),
  ('day-2', 'allowed_day', 'Мягмар, Пүрэв', 20),
  ('day-3', 'allowed_day', 'Лхагва, Бямба', 30),
  ('day-4', 'allowed_day', 'Даваа, Мягмар, Пүрэв', 40),
  ('grade-1', 'grade_range', '6A - 7B анги', 10),
  ('grade-2', 'grade_range', '6A - 6C анги', 20),
  ('grade-3', 'grade_range', '7A - 8B анги', 30),
  ('grade-4', 'grade_range', '9A - 10B анги', 40);

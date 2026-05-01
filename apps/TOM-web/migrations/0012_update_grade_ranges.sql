UPDATE form_options
SET value = '3A анги',
    sort_order = 10,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'grade-1' AND category = 'grade_range';

UPDATE form_options
SET value = '3B анги',
    sort_order = 20,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'grade-2' AND category = 'grade_range';

UPDATE form_options
SET value = '3D анги',
    sort_order = 30,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'grade-3' AND category = 'grade_range';

UPDATE form_options
SET value = '3C анги',
    sort_order = 40,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'grade-4' AND category = 'grade_range';

INSERT OR IGNORE INTO form_options (id, category, value, sort_order) VALUES
  ('grade-1', 'grade_range', '3A анги', 10),
  ('grade-2', 'grade_range', '3B анги', 20),
  ('grade-3', 'grade_range', '3D анги', 30),
  ('grade-4', 'grade_range', '3C анги', 40);

CREATE TABLE IF NOT EXISTS event_post_likes (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES event_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_post_likes_post_user ON event_post_likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_event_post_likes_post_id ON event_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_event_post_likes_user_id ON event_post_likes(user_id);


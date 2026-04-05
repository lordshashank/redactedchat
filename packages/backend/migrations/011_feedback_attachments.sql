CREATE TABLE IF NOT EXISTS feedback_attachments (
  post_id    UUID NOT NULL REFERENCES feedback_posts(id) ON DELETE CASCADE,
  upload_key TEXT NOT NULL REFERENCES uploads(key) ON DELETE CASCADE,
  position   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, upload_key)
);

CREATE INDEX IF NOT EXISTS idx_feedback_attachments_post_id ON feedback_attachments(post_id);

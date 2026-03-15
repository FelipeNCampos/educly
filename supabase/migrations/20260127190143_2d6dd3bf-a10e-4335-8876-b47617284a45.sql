-- Create rate limiting table for landing chat
CREATE TABLE landing_chat_rate_limits (
  ip_address TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (but allow service role access for edge functions)
ALTER TABLE landing_chat_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create index for efficient cleanup of old records
CREATE INDEX idx_rate_limit_window ON landing_chat_rate_limits(window_start);

-- Create policy to allow edge functions (service role) full access
-- No user-level policies needed since this is only accessed by edge functions
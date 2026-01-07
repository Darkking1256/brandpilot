-- Recurring Posts Migration
-- Schedule repeating content automatically

CREATE TABLE IF NOT EXISTS recurring_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube')),
  image_url TEXT,
  link_url TEXT,
  recurrence_pattern TEXT NOT NULL CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'custom')),
  recurrence_config JSONB, -- { days: [1,3,5], time: "10:00", timezone: "UTC", interval: 1 }
  start_date DATE NOT NULL,
  end_date DATE, -- NULL for infinite
  time_slot TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT TRUE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  total_runs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON recurring_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_active ON recurring_posts(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_next_run ON recurring_posts(next_run_at);

-- Track generated posts from recurring templates
ALTER TABLE posts ADD COLUMN IF NOT EXISTS recurring_template_id UUID REFERENCES recurring_posts(id);

-- Enable RLS
ALTER TABLE recurring_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on recurring_posts for development"
  ON recurring_posts FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_recurring_posts_updated_at
  BEFORE UPDATE ON recurring_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


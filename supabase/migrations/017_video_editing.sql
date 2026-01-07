-- Video Editing Migration
-- Video projects and editing state

CREATE TABLE IF NOT EXISTS video_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_video_url TEXT NOT NULL,
  edited_video_url TEXT,
  duration INTEGER, -- in seconds
  status TEXT NOT NULL CHECK (status IN ('editing', 'processing', 'completed', 'failed')),
  edits JSONB, -- { trim: { start: 0, end: 30 }, filters: [], captions: [], transitions: [] }
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_projects_user_id ON video_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_video_projects_status ON video_projects(status);

-- Enable RLS
ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on video_projects for development"
  ON video_projects FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_video_projects_updated_at
  BEFORE UPDATE ON video_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


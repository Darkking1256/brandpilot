-- Quick Features Migration
-- Adds support for comment templates, post recycling, and other quick features

-- Comment templates table
CREATE TABLE IF NOT EXISTS comment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comment_templates_user_id ON comment_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_templates_category ON comment_templates(category);

-- Post recycling tracking
ALTER TABLE posts ADD COLUMN IF NOT EXISTS recycled_from UUID REFERENCES posts(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS recycle_count INTEGER DEFAULT 0;

-- Content suggestions tracking (optional - for analytics)
CREATE TABLE IF NOT EXISTS content_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  platform TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('trending', 'seasonal', 'evergreen', 'promotional')),
  reason TEXT,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_suggestions_user_id ON content_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_platform ON content_suggestions(platform);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_category ON content_suggestions(category);

-- Enable RLS
ALTER TABLE comment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for development (replace with proper auth policies later)
CREATE POLICY "Allow all operations on comment_templates for development"
  ON comment_templates FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on content_suggestions for development"
  ON content_suggestions FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comment_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_templates_updated_at
  BEFORE UPDATE ON comment_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_templates_updated_at();


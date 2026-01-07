-- Social Listening Migration
-- Brand mention tracking and monitoring

CREATE TABLE IF NOT EXISTS brand_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube')),
  mention_type TEXT NOT NULL CHECK (mention_type IN ('hashtag', 'keyword', 'username', 'url')),
  keyword TEXT NOT NULL, -- The term being tracked
  platform_post_id TEXT NOT NULL,
  platform_user_id TEXT NOT NULL,
  platform_username TEXT NOT NULL,
  content TEXT NOT NULL,
  post_url TEXT NOT NULL,
  media_urls TEXT[],
  engagement_count INTEGER DEFAULT 0,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  language TEXT,
  location TEXT,
  is_responded BOOLEAN DEFAULT FALSE,
  response_priority TEXT CHECK (response_priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentions_user_id ON brand_mentions(user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_keyword ON brand_mentions(keyword);
CREATE INDEX IF NOT EXISTS idx_mentions_platform ON brand_mentions(platform);
CREATE INDEX IF NOT EXISTS idx_mentions_sentiment ON brand_mentions(sentiment);
CREATE INDEX IF NOT EXISTS idx_mentions_detected_at ON brand_mentions(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentions_priority ON brand_mentions(response_priority);

-- Tracking keywords/hashtags
CREATE TABLE IF NOT EXISTS tracking_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  keyword_type TEXT NOT NULL CHECK (keyword_type IN ('hashtag', 'keyword', 'username', 'url')),
  platforms TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  alert_on_mention BOOLEAN DEFAULT TRUE,
  min_engagement_threshold INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_keywords_user_id ON tracking_keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_keywords_active ON tracking_keywords(is_active);

-- Enable RLS
ALTER TABLE brand_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on brand_mentions for development"
  ON brand_mentions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on tracking_keywords for development"
  ON tracking_keywords FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_tracking_keywords_updated_at
  BEFORE UPDATE ON tracking_keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


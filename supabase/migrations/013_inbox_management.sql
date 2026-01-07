-- Inbox Management Migration
-- Unified inbox for comments, DMs, mentions across all platforms

CREATE TABLE IF NOT EXISTS inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube')),
  message_type TEXT NOT NULL CHECK (message_type IN ('comment', 'dm', 'mention', 'reply')),
  platform_message_id TEXT NOT NULL,
  platform_post_id TEXT, -- Original post if this is a comment/reply
  sender_id TEXT NOT NULL,
  sender_username TEXT NOT NULL,
  sender_avatar_url TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  requires_response BOOLEAN DEFAULT FALSE,
  responded_at TIMESTAMP WITH TIME ZONE,
  response_id UUID, -- Link to response message
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform, platform_message_id)
);

CREATE INDEX IF NOT EXISTS idx_inbox_user_id ON inbox_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_inbox_platform ON inbox_messages(platform);
CREATE INDEX IF NOT EXISTS idx_inbox_type ON inbox_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_inbox_read ON inbox_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_inbox_created_at ON inbox_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_sentiment ON inbox_messages(sentiment);

-- Message threads/conversations
CREATE TABLE IF NOT EXISTS inbox_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_thread_id TEXT,
  participant_ids TEXT[],
  last_message_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threads_user_id ON inbox_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_platform ON inbox_threads(platform);

-- Add thread_id to messages
ALTER TABLE inbox_messages ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES inbox_threads(id);

-- Enable RLS
ALTER TABLE inbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on inbox_messages for development"
  ON inbox_messages FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on inbox_threads for development"
  ON inbox_threads FOR ALL USING (true) WITH CHECK (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_inbox_messages_updated_at
  BEFORE UPDATE ON inbox_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inbox_threads_updated_at
  BEFORE UPDATE ON inbox_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


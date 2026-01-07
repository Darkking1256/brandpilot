-- Auto-Reply Migration
-- Automated response rules and tracking

CREATE TABLE IF NOT EXISTS auto_reply_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('keyword', 'sentiment', 'hashtag', 'mention', 'dm', 'comment')),
  trigger_config JSONB NOT NULL, -- { keywords: ["help", "support"], match_type: "contains" }
  platforms TEXT[] NOT NULL,
  response_template_id UUID REFERENCES comment_templates(id),
  response_content TEXT NOT NULL,
  conditions JSONB, -- { min_engagement: 10, language: "en" }
  cooldown_hours INTEGER DEFAULT 24, -- Don't reply to same user within X hours
  max_replies_per_day INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auto_reply_user_id ON auto_reply_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_reply_active ON auto_reply_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_auto_reply_trigger_type ON auto_reply_rules(trigger_type);

-- Track auto-replies sent
CREATE TABLE IF NOT EXISTS auto_reply_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES auto_reply_rules(id) ON DELETE CASCADE,
  message_id UUID REFERENCES inbox_messages(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_content TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auto_reply_logs_rule_id ON auto_reply_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_auto_reply_logs_message_id ON auto_reply_logs(message_id);
CREATE INDEX IF NOT EXISTS idx_auto_reply_logs_sent_at ON auto_reply_logs(sent_at DESC);

-- Enable RLS
ALTER TABLE auto_reply_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_reply_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on auto_reply_rules for development"
  ON auto_reply_rules FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on auto_reply_logs for development"
  ON auto_reply_logs FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_auto_reply_rules_updated_at
  BEFORE UPDATE ON auto_reply_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


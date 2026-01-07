-- Combined Migration File
-- Generated automatically - DO NOT EDIT
-- Run this file in your Supabase SQL Editor
-- 
-- Migration files included:
--   - 001_initial_schema.sql
--   - 002_templates_schema.sql
--   - 003_enable_realtime.sql
--   - 004_user_profiles_and_preferences.sql
--   - 005_ads_schema.sql
--   - 006_platform_connections.sql
--   - 007_add_platform_post_fields.sql
--   - 008_add_youtube_to_posts.sql
--   - 009_oauth_app_credentials.sql
--   - 010_content_features.sql
--   - 011_analytics_metrics.sql
--   - 012_quick_features.sql
--   - 013_inbox_management.sql
--   - 014_social_listening.sql
--   - 015_recurring_posts.sql
--   - 016_auto_reply.sql
--   - 017_video_editing.sql
--   - 018_custom_reports.sql
--   - 019_ecommerce.sql
--
-- ============================================
-- START OF MIGRATIONS
-- ============================================

-- ============================================
-- Migration 1: 001_initial_schema.sql
-- ============================================

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  image_url TEXT,
  link_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'all')),
  objective TEXT NOT NULL CHECK (objective IN ('awareness', 'engagement', 'conversions', 'traffic')),
  budget DECIMAL(10, 2),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_date ON posts(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON campaigns(start_date);

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for posts
-- Note: For development, allowing unauthenticated access. Remove these policies when implementing auth.
CREATE POLICY "Allow all operations on posts for development"
  ON posts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for campaigns
-- Note: For development, allowing unauthenticated access. Remove these policies when implementing auth.
CREATE POLICY "Allow all operations on campaigns for development"
  ON campaigns FOR ALL
  USING (true)
  WITH CHECK (true);

-- When implementing authentication, replace the above policies with:
-- CREATE POLICY "Users can view their own posts"
--   ON posts FOR SELECT
--   USING (auth.uid() = user_id);
-- CREATE POLICY "Users can create their own posts"
--   ON posts FOR INSERT
--   WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update their own posts"
--   ON posts FOR UPDATE
--   USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete their own posts"
--   ON posts FOR DELETE
--   USING (auth.uid() = user_id);
-- (Same for campaigns)

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



-- ============================================
-- Migration 2: 002_templates_schema.sql
-- ============================================

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('post', 'campaign')),
  content JSONB NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing unauthenticated access for development)
CREATE POLICY "Allow all operations on templates for development"
  ON templates FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



-- ============================================
-- Migration 3: 003_enable_realtime.sql
-- ============================================

-- Enable Realtime for posts and campaigns tables
-- This allows WebSocket subscriptions to database changes

-- Enable Realtime on posts table
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- Enable Realtime on campaigns table
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;

-- Enable Realtime on templates table (if exists)
ALTER PUBLICATION supabase_realtime ADD TABLE templates;

-- Note: Realtime is enabled by default in Supabase, but we need to explicitly
-- add tables to the publication. This migration ensures the tables are included.



-- ============================================
-- Migration 4: 004_user_profiles_and_preferences.sql
-- ============================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  email TEXT,
  company TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_alerts BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
-- For development: Allow all operations. Remove when implementing auth.
CREATE POLICY "Allow all operations on user_profiles for development"
  ON user_profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for user_preferences
-- For development: Allow all operations. Remove when implementing auth.
CREATE POLICY "Allow all operations on user_preferences for development"
  ON user_preferences FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



-- ============================================
-- Migration 5: 005_ads_schema.sql
-- ============================================

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'google', 'all')),
  ad_type TEXT NOT NULL CHECK (ad_type IN ('image', 'video', 'carousel', 'story', 'sponsored')),
  objective TEXT NOT NULL CHECK (objective IN ('awareness', 'traffic', 'engagement', 'conversions', 'leads', 'sales')),
  budget DECIMAL(10, 2) NOT NULL,
  daily_budget DECIMAL(10, 2),
  bid_strategy TEXT CHECK (bid_strategy IN ('lowest_cost', 'cost_cap', 'bid_cap', 'target_cost')),
  target_audience JSONB,
  creative_url TEXT,
  creative_type TEXT CHECK (creative_type IN ('image', 'video', 'carousel')),
  landing_page_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  
  -- Performance metrics (updated by platform APIs or manual entry)
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend DECIMAL(10, 2) DEFAULT 0,
  ctr DECIMAL(5, 2) DEFAULT 0, -- Click-through rate percentage
  cpc DECIMAL(10, 2) DEFAULT 0, -- Cost per click
  cpm DECIMAL(10, 2) DEFAULT 0, -- Cost per 1000 impressions
  cpa DECIMAL(10, 2) DEFAULT 0, -- Cost per acquisition/conversion
  roas DECIMAL(10, 2) DEFAULT 0, -- Return on ad spend
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_platform ON ads(platform);
CREATE INDEX IF NOT EXISTS idx_ads_start_date ON ads(start_date);
CREATE INDEX IF NOT EXISTS idx_ads_objective ON ads(objective);

-- Enable Row Level Security (RLS)
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ads
-- For development: Allow all operations. Remove when implementing auth.
CREATE POLICY "Allow all operations on ads for development"
  ON ads FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



-- ============================================
-- Migration 6: 006_platform_connections.sql
-- ============================================

-- Create platform_connections table to store API credentials
CREATE TABLE IF NOT EXISTS platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube')),
  platform_user_id TEXT, -- User's ID on the platform
  platform_username TEXT, -- Username on the platform
  access_token TEXT NOT NULL, -- Encrypted access token
  refresh_token TEXT, -- Refresh token if available
  token_expires_at TIMESTAMP WITH TIME ZONE, -- Token expiration
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platform_connections_user_id ON platform_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_connections_platform ON platform_connections(platform);
CREATE INDEX IF NOT EXISTS idx_platform_connections_is_active ON platform_connections(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- For development: Allow all operations. Remove when implementing auth.
CREATE POLICY "Allow all operations on platform_connections for development"
  ON platform_connections FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_platform_connections_updated_at
  BEFORE UPDATE ON platform_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



-- ============================================
-- Migration 7: 007_add_platform_post_fields.sql
-- ============================================

-- Add fields to posts table for platform integration
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS platform_post_id TEXT,
ADD COLUMN IF NOT EXISTS platform_post_url TEXT;

-- Create index for platform_post_id
CREATE INDEX IF NOT EXISTS idx_posts_platform_post_id ON posts(platform_post_id);



-- ============================================
-- Migration 8: 008_add_youtube_to_posts.sql
-- ============================================

-- Add YouTube to posts platform enum
-- Note: This requires dropping and recreating the constraint
-- For existing data, ensure no posts use 'youtube' before running

-- First, update any existing constraints
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_platform_check;
ALTER TABLE posts ADD CONSTRAINT posts_platform_check 
  CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube'));

-- Update campaigns table as well
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_platform_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_platform_check 
  CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'all', 'youtube'));

-- Update ads table as well
ALTER TABLE ads DROP CONSTRAINT IF EXISTS ads_platform_check;
ALTER TABLE ads ADD CONSTRAINT ads_platform_check 
  CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'google', 'all', 'youtube'));



-- ============================================
-- Migration 9: 009_oauth_app_credentials.sql
-- ============================================

-- Create oauth_app_credentials table to store OAuth app credentials
-- This allows the platform owner to configure OAuth once, and all clients can connect
CREATE TABLE IF NOT EXISTS oauth_app_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'youtube', 'tiktok')),
  client_id TEXT NOT NULL,
  client_secret_encrypted TEXT NOT NULL, -- Encrypted client secret
  redirect_uri TEXT NOT NULL,
  additional_config JSONB, -- Store platform-specific config (e.g., TikTok uses client_key instead of client_id)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_oauth_app_credentials_platform ON oauth_app_credentials(platform);
CREATE INDEX IF NOT EXISTS idx_oauth_app_credentials_active ON oauth_app_credentials(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE oauth_app_credentials ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (in production, restrict to admin users only)
CREATE POLICY "Allow all operations on oauth_app_credentials for development"
  ON oauth_app_credentials FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_oauth_app_credentials_updated_at
  BEFORE UPDATE ON oauth_app_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE oauth_app_credentials IS 'Stores OAuth app credentials for each platform. These are configured once by the platform owner and used by all clients.';



-- ============================================
-- Migration 10: 010_content_features.sql
-- ============================================

-- Content Calendar & Draft Autosave
ALTER TABLE posts ADD COLUMN IF NOT EXISTS draft_data JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS last_autosaved_at TIMESTAMP WITH TIME ZONE;

-- Post Versions/History
CREATE TABLE IF NOT EXISTS post_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_post_versions_post_id ON post_versions(post_id);

-- Content Library/Assets
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  file_size BIGINT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- for videos
  tags TEXT[],
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_user_id ON media_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON media_assets USING GIN(tags);

-- Post Validation Rules
CREATE TABLE IF NOT EXISTS post_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  validation_type TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval Workflow
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft' 
  CHECK (approval_status IN ('draft', 'pending_review', 'approved', 'rejected', 'published'));
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);

-- Team Collaboration
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS team_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification System
CREATE TABLE IF NOT EXISTS notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'in_app', 'both')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_read ON notification_history(read);

-- Search History
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  entity_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);

-- Enable RLS on new tables
ALTER TABLE post_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Development RLS policies (same pattern as existing tables)
CREATE POLICY "Allow all operations on post_versions for development"
  ON post_versions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on media_assets for development"
  ON media_assets FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on post_validations for development"
  ON post_validations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on post_comments for development"
  ON post_comments FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on teams for development"
  ON teams FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on team_members for development"
  ON team_members FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on team_activity for development"
  ON team_activity FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on notification_rules for development"
  ON notification_rules FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on notification_history for development"
  ON notification_history FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on search_history for development"
  ON search_history FOR ALL USING (true) WITH CHECK (true);



-- ============================================
-- Migration 11: 011_analytics_metrics.sql
-- ============================================

-- Post Performance Metrics
CREATE TABLE IF NOT EXISTS post_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  platform_post_id TEXT,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_metrics_post_id ON post_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_recorded_at ON post_metrics(recorded_at);

-- Hashtag Performance
CREATE TABLE IF NOT EXISTS hashtag_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  platform TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  avg_engagement_rate DECIMAL(5, 2) DEFAULT 0,
  first_used_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hashtag_performance_user_id ON hashtag_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_performance_hashtag ON hashtag_performance(hashtag);
CREATE INDEX IF NOT EXISTS idx_hashtag_performance_platform ON hashtag_performance(platform);

-- Best Time to Post Analysis
CREATE TABLE IF NOT EXISTS posting_time_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  hour_of_day INTEGER NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
  post_count INTEGER DEFAULT 0,
  avg_engagement_rate DECIMAL(5, 2) DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, day_of_week, hour_of_day)
);

CREATE INDEX IF NOT EXISTS idx_posting_time_analysis_user_id ON posting_time_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_posting_time_analysis_platform ON posting_time_analysis(platform);

-- Competitor Analysis
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  profile_url TEXT,
  follower_count INTEGER,
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitor_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  platform_post_id TEXT NOT NULL,
  content TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  impressions INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitors_user_id ON competitors(user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_competitor_id ON competitor_posts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_posted_at ON competitor_posts(posted_at);

-- Scheduled Exports
CREATE TABLE IF NOT EXISTS scheduled_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('posts', 'campaigns', 'analytics')),
  format TEXT NOT NULL CHECK (format IN ('csv', 'json', 'pdf', 'excel')),
  include_images BOOLEAN DEFAULT false,
  filters JSONB,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'custom')),
  schedule_config JSONB,
  email_recipients TEXT[],
  enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_exports_user_id ON scheduled_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_exports_next_run_at ON scheduled_exports(next_run_at);

-- Enable RLS
ALTER TABLE post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtag_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE posting_time_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_exports ENABLE ROW LEVEL SECURITY;

-- Development RLS policies
CREATE POLICY "Allow all operations on post_metrics for development"
  ON post_metrics FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on hashtag_performance for development"
  ON hashtag_performance FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on posting_time_analysis for development"
  ON posting_time_analysis FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on competitors for development"
  ON competitors FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on competitor_posts for development"
  ON competitor_posts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on scheduled_exports for development"
  ON scheduled_exports FOR ALL USING (true) WITH CHECK (true);



-- ============================================
-- Migration 12: 012_quick_features.sql
-- ============================================

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



-- ============================================
-- Migration 13: 013_inbox_management.sql
-- ============================================

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



-- ============================================
-- Migration 14: 014_social_listening.sql
-- ============================================

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



-- ============================================
-- Migration 15: 015_recurring_posts.sql
-- ============================================

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



-- ============================================
-- Migration 16: 016_auto_reply.sql
-- ============================================

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



-- ============================================
-- Migration 17: 017_video_editing.sql
-- ============================================

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



-- ============================================
-- Migration 18: 018_custom_reports.sql
-- ============================================

-- Custom Reports Migration
-- Build and schedule custom analytics reports

CREATE TABLE IF NOT EXISTS custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  report_config JSONB NOT NULL, -- { metrics: [], dateRange: {}, filters: {}, chartTypes: [], layout: {} }
  is_scheduled BOOLEAN DEFAULT FALSE,
  schedule_config JSONB, -- { frequency: "weekly", day: 1, time: "09:00", recipients: [] }
  last_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_reports_user_id ON custom_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_scheduled ON custom_reports(is_scheduled);

-- Report generation history
CREATE TABLE IF NOT EXISTS report_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_url TEXT,
  format TEXT CHECK (format IN ('pdf', 'csv', 'excel', 'json')),
  file_size BIGINT
);

CREATE INDEX IF NOT EXISTS idx_report_generations_report_id ON report_generations(report_id);
CREATE INDEX IF NOT EXISTS idx_report_generations_generated_at ON report_generations(generated_at DESC);

-- Enable RLS
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on custom_reports for development"
  ON custom_reports FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on report_generations for development"
  ON report_generations FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_custom_reports_updated_at
  BEFORE UPDATE ON custom_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



-- ============================================
-- Migration 19: 019_ecommerce.sql
-- ============================================

-- E-commerce Migration
-- Product catalog and promotion tracking

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  image_url TEXT,
  product_url TEXT, -- Link to product page
  category TEXT,
  tags TEXT[],
  inventory_count INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Product promotions/posts
CREATE TABLE IF NOT EXISTS product_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  promotion_type TEXT CHECK (promotion_type IN ('featured', 'sale', 'new', 'bestseller')),
  discount_percentage DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_posts_post_id ON product_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_product_posts_product_id ON product_posts(product_id);

-- Product performance tracking
CREATE TABLE IF NOT EXISTS product_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id),
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_date ON product_analytics(date);
CREATE INDEX IF NOT EXISTS idx_product_analytics_post_id ON product_analytics(post_id);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on products for development"
  ON products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on product_posts for development"
  ON product_posts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on product_analytics for development"
  ON product_analytics FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



-- ============================================
-- END OF MIGRATIONS
-- ============================================

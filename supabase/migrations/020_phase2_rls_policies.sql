-- Phase 2: Update RLS Policies and Platform Constraints
-- This migration replaces development policies with proper authentication-based policies

-- ============================================
-- 1. Drop old development policies
-- ============================================

-- Drop development policies from posts
DROP POLICY IF EXISTS "Allow all operations on posts for development" ON posts;

-- Drop development policies from campaigns
DROP POLICY IF EXISTS "Allow all operations on campaigns for development" ON campaigns;

-- Drop development policies from ads (if exists)
DROP POLICY IF EXISTS "Allow all operations on ads for development" ON ads;

-- Drop development policies from platform_connections (if exists)
DROP POLICY IF EXISTS "Allow all operations on platform_connections for development" ON platform_connections;

-- Drop development policies from comment_templates (if exists)
DROP POLICY IF EXISTS "Allow all operations on comment_templates for development" ON comment_templates;

-- ============================================
-- 2. Create proper RLS policies for posts
-- ============================================

CREATE POLICY "Users can view their own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. Create proper RLS policies for campaigns
-- ============================================

CREATE POLICY "Users can view their own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. Create proper RLS policies for ads
-- ============================================

-- Enable RLS on ads table if not already enabled
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ads"
  ON ads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ads"
  ON ads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ads"
  ON ads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads"
  ON ads FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. Create proper RLS policies for platform_connections
-- ============================================

-- Enable RLS on platform_connections if not already enabled
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own platform connections"
  ON platform_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own platform connections"
  ON platform_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platform connections"
  ON platform_connections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own platform connections"
  ON platform_connections FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. Create proper RLS policies for comment_templates
-- ============================================

CREATE POLICY "Users can view their own comment templates"
  ON comment_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own comment templates"
  ON comment_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comment templates"
  ON comment_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment templates"
  ON comment_templates FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. Create proper RLS policies for inbox_messages
-- ============================================

-- Enable RLS on inbox_messages if not already enabled
ALTER TABLE inbox_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inbox messages"
  ON inbox_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inbox messages"
  ON inbox_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inbox messages"
  ON inbox_messages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inbox messages"
  ON inbox_messages FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 8. Create proper RLS policies for tracking_keywords
-- ============================================

-- Enable RLS on tracking_keywords if not already enabled
ALTER TABLE tracking_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tracking keywords"
  ON tracking_keywords FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tracking keywords"
  ON tracking_keywords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking keywords"
  ON tracking_keywords FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracking keywords"
  ON tracking_keywords FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. Create proper RLS policies for brand_mentions
-- ============================================

-- Enable RLS on brand_mentions if not already enabled
ALTER TABLE brand_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own brand mentions"
  ON brand_mentions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own brand mentions"
  ON brand_mentions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand mentions"
  ON brand_mentions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand mentions"
  ON brand_mentions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 10. Create proper RLS policies for recurring_posts
-- ============================================

-- Enable RLS on recurring_posts if not already enabled
ALTER TABLE recurring_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recurring posts"
  ON recurring_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring posts"
  ON recurring_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring posts"
  ON recurring_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring posts"
  ON recurring_posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 11. Create proper RLS policies for auto_reply_rules
-- ============================================

-- Enable RLS on auto_reply_rules if not already enabled
ALTER TABLE auto_reply_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own auto-reply rules"
  ON auto_reply_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own auto-reply rules"
  ON auto_reply_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own auto-reply rules"
  ON auto_reply_rules FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own auto-reply rules"
  ON auto_reply_rules FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 12. Create proper RLS policies for products
-- ============================================

-- Enable RLS on products if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 13. Create proper RLS policies for custom_reports
-- ============================================

-- Enable RLS on custom_reports if not already enabled
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom reports"
  ON custom_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom reports"
  ON custom_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom reports"
  ON custom_reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom reports"
  ON custom_reports FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 14. Create proper RLS policies for video_projects
-- ============================================

-- Enable RLS on video_projects if not already enabled
ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own video projects"
  ON video_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video projects"
  ON video_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video projects"
  ON video_projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video projects"
  ON video_projects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 15. Create proper RLS policies for media_assets
-- ============================================

-- Enable RLS on media_assets if not already enabled
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own media assets"
  ON media_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own media assets"
  ON media_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media assets"
  ON media_assets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media assets"
  ON media_assets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 16. Create proper RLS policies for teams (special handling)
-- ============================================

-- Enable RLS on teams if not already enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Users can view teams they're members of or created
CREATE POLICY "Users can view teams they belong to"
  ON teams FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update teams they own"
  ON teams FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete teams they own"
  ON teams FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================
-- 17. Create proper RLS policies for team_members
-- ============================================

-- Enable RLS on team_members if not already enabled
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Users can view team members of teams they belong to
CREATE POLICY "Users can view team members of their teams"
  ON team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND (teams.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = teams.id
        AND tm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Team owners can add members"
  ON team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Team owners can update members"
  ON team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND teams.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND teams.created_by = auth.uid()
    )
  );

CREATE POLICY "Team owners can remove members"
  ON team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND teams.created_by = auth.uid()
    )
  );


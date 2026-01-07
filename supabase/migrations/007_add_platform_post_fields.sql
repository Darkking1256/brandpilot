-- Add fields to posts table for platform integration
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS platform_post_id TEXT,
ADD COLUMN IF NOT EXISTS platform_post_url TEXT;

-- Create index for platform_post_id
CREATE INDEX IF NOT EXISTS idx_posts_platform_post_id ON posts(platform_post_id);


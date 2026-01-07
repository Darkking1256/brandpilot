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


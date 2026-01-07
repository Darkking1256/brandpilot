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


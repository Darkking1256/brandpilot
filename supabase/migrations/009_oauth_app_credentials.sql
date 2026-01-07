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


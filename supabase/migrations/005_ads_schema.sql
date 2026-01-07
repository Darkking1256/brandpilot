-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube', 'google', 'all')),
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


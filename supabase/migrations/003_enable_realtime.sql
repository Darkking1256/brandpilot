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


# Database Migrations Guide

This project uses Supabase for the database. To run migrations, you have several options:

## Option 1: Supabase Dashboard (Easiest)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Open the file `supabase/all_migrations.sql` (generated automatically)
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)

✅ **Recommended for quick setup**

## Option 2: Supabase CLI (Best for Development)

### Install Supabase CLI

```bash
# Using npm
npm install -g supabase

# Or using Homebrew (Mac)
brew install supabase/tap/supabase

# Or using Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project (get project ref from Supabase dashboard URL)
supabase link --project-ref YOUR_PROJECT_REF
```

### Run Migrations

```bash
# Push all migrations to your project
supabase db push

# Or run a specific migration file
supabase db push --file supabase/migrations/013_inbox_management.sql
```

## Option 3: Individual Migration Files

If you prefer to run migrations one at a time:

1. Go to Supabase Dashboard > SQL Editor
2. Run migrations in order:
   - `001_initial_schema.sql`
   - `002_templates_schema.sql`
   - `003_enable_realtime.sql`
   - ... (continue in numerical order)
   - `019_ecommerce.sql`

## Option 4: Combined Migration File

A combined migration file has been generated at:
- `supabase/all_migrations.sql`

This file contains all migrations in order. Simply copy and paste it into the Supabase SQL Editor.

## Migration Files

All migration files are located in `supabase/migrations/`:

1. `001_initial_schema.sql` - Posts and campaigns tables
2. `002_templates_schema.sql` - Content templates
3. `003_enable_realtime.sql` - Enable Supabase Realtime
4. `004_user_profiles_and_preferences.sql` - User settings
5. `005_ads_schema.sql` - Ads management
6. `006_platform_connections.sql` - Platform OAuth connections
7. `007_add_platform_post_fields.sql` - Post platform fields
8. `008_add_youtube_to_posts.sql` - YouTube platform support
9. `009_oauth_app_credentials.sql` - OAuth app credentials
10. `010_content_features.sql` - Content calendar, media, etc.
11. `011_analytics_metrics.sql` - Analytics enhancements
12. `012_quick_features.sql` - Quick features (comments, recycling)
13. `013_inbox_management.sql` - Inbox management
14. `014_social_listening.sql` - Social listening
15. `015_recurring_posts.sql` - Recurring posts
16. `016_auto_reply.sql` - Auto-reply system
17. `017_video_editing.sql` - Video editing
18. `018_custom_reports.sql` - Custom reports
19. `019_ecommerce.sql` - E-commerce features

## Verify Migrations

After running migrations, verify tables were created:

```sql
-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check specific table
SELECT * FROM inbox_messages LIMIT 1;
SELECT * FROM recurring_posts LIMIT 1;
SELECT * FROM products LIMIT 1;
```

## Troubleshooting

### Error: "relation already exists"
- Some migrations use `CREATE TABLE IF NOT EXISTS`, so this is safe to ignore
- If you see this, the table already exists and migration can continue

### Error: "function already exists"
- The `update_updated_at_column()` function is created in multiple migrations
- This is safe to ignore as it uses `CREATE OR REPLACE FUNCTION`

### Error: "permission denied"
- Make sure you're using the SQL Editor in Supabase Dashboard (has full permissions)
- Or ensure your Supabase CLI is linked to the correct project

## Next Steps

After running migrations:
1. ✅ Verify tables were created successfully
2. ✅ Test the application features
3. ✅ Check that RLS policies are working correctly
4. ✅ Set up environment variables if needed

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/overview)




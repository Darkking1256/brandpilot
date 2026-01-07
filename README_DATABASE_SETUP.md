# Database Setup Guide

This guide will help you set up the Supabase database for MarketPilot AI.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project created

## Setup Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 2. Configure Environment Variables

Create a `.env.local` file in the root of your project (if it doesn't exist) and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press `Ctrl+Enter`)

This will create:
- `posts` table with all necessary columns and indexes
- `campaigns` table with all necessary columns and indexes
- Row Level Security (RLS) policies
- Automatic timestamp triggers

### 4. Verify Tables Were Created

1. Go to **Table Editor** in your Supabase dashboard
2. You should see two tables:
   - `posts`
   - `campaigns`

### 5. Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/dashboard/scheduler`
3. Try creating a new post
4. Check your Supabase dashboard → Table Editor → `posts` to see the data

## Database Schema

### Posts Table

| Column | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| user_id | UUID | Foreign key to auth.users (for future auth) |
| content | TEXT | Post content |
| platform | TEXT | Platform (twitter, linkedin, facebook, instagram, tiktok) |
| scheduled_date | DATE | Scheduled date |
| scheduled_time | TIME | Scheduled time |
| status | TEXT | Status (draft, scheduled, published, failed) |
| image_url | TEXT | Optional image URL |
| link_url | TEXT | Optional link URL |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Campaigns Table

| Column | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| user_id | UUID | Foreign key to auth.users (for future auth) |
| name | TEXT | Campaign name |
| description | TEXT | Optional description |
| platform | TEXT | Platform (twitter, linkedin, facebook, instagram, tiktok, all) |
| objective | TEXT | Objective (awareness, engagement, conversions, traffic) |
| budget | DECIMAL | Optional budget |
| start_date | DATE | Start date |
| end_date | DATE | Optional end date |
| status | TEXT | Status (draft, active, paused, completed) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Row Level Security (RLS)

The database uses Row Level Security to ensure users can only access their own data. Currently, the API routes allow unauthenticated access for development purposes. When you implement authentication, uncomment the authentication checks in the API routes.

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the migration SQL script
- Check that you're connected to the correct Supabase project

### Error: "permission denied"
- Check that RLS policies are enabled
- Verify your Supabase credentials in `.env.local`

### Data not appearing
- Check the browser console for errors
- Verify API routes are working (check Network tab)
- Check Supabase logs in the dashboard

## Next Steps

After setting up the database:
1. ✅ API routes are ready to use
2. ✅ Forms are connected to the backend
3. ✅ Data persistence is working
4. 🔄 Next: Implement authentication (see TODO list)


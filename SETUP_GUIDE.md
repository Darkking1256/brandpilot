# 🚀 Complete Setup Guide - Step by Step

Follow these steps to get your MarketPilot AI app fully connected to Supabase.

## Step 1: Create a Supabase Account & Project

1. **Go to Supabase**: Visit https://supabase.com
2. **Sign up** (or log in if you already have an account)
3. **Create a New Project**:
   - Click "New Project"
   - Enter a project name (e.g., "marketpilot-ai")
   - Enter a database password (save this!)
   - Choose a region close to you
   - Click "Create new project"
   - Wait 2-3 minutes for the project to be ready

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon in the left sidebar)
2. Click **API** in the settings menu
3. You'll see two important values:
   - **Project URL** - looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key** - a long string starting with `eyJ...`

4. **Copy both values** - you'll need them in the next step

## Step 3: Create Environment Variables File

1. In your project root folder (`D:\market poilt AI`), create a new file called `.env.local`
   - If you're using VS Code, right-click in the file explorer → New File → name it `.env.local`
   - Make sure it starts with a dot (`.env.local` not `env.local`)

2. **Open `.env.local`** and paste this template:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. **Replace the placeholders**:
   - Replace `your_project_url_here` with your actual Project URL from Step 2
   - Replace `your_anon_key_here` with your actual anon public key from Step 2

   Example:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

4. **Save the file**

## Step 4: Run the Database Migration

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query** button (top right)
3. Open the file `supabase/migrations/001_initial_schema.sql` from your project
4. **Copy ALL the contents** of that file
5. **Paste it** into the SQL Editor in Supabase
6. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)
7. You should see a success message: "Success. No rows returned"

## Step 5: Verify Tables Were Created

1. In Supabase dashboard, click **Table Editor** in the left sidebar
2. You should see two tables:
   - ✅ `posts`
   - ✅ `campaigns`

If you see both tables, you're all set! 🎉

## Step 6: Test Your Application

1. **Restart your development server**:
   - Stop the current server (press `Ctrl+C` in the terminal)
   - Run: `npm run dev`

2. **Open your browser** and go to: `http://localhost:3000`

3. **Navigate to Dashboard**:
   - Click "Dashboard" or go to `http://localhost:3000/dashboard`

4. **Test creating a post**:
   - Click "New Post" button
   - Fill in the form:
     - Platform: Select any platform
     - Content: Write some test content
     - Date: Select a future date
     - Time: Select a time
   - Click "Schedule Post"
   - You should see a success message!

5. **Verify in Supabase**:
   - Go back to Supabase dashboard → Table Editor → `posts`
   - You should see your new post! 🎉

## Troubleshooting

### ❌ Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Solution**: 
- Make sure `.env.local` file exists in the root folder
- Make sure the file name is exactly `.env.local` (with the dot)
- Restart your development server after creating/editing `.env.local`

### ❌ Error: "relation does not exist"
**Solution**: 
- Make sure you ran the SQL migration in Step 4
- Check that you copied ALL the SQL code
- Try running the migration again

### ❌ Error: "permission denied" or "new row violates row-level security"
**Solution**: 
- This is normal for now - the RLS policies require authentication
- The API routes are currently set to allow unauthenticated access for development
- If you still get errors, check that the migration ran successfully

### ❌ Data not appearing after creating a post
**Solution**:
- Open browser DevTools (F12) → Console tab
- Look for any error messages
- Check Network tab to see if API calls are failing
- Verify your `.env.local` file has the correct values

### ❌ Can't find `.env.local` file
**Solution**:
- Make sure you're in the project root folder (`D:\market poilt AI`)
- In VS Code, you might need to show hidden files:
  - File → Preferences → Settings
  - Search for "files.exclude"
  - Make sure `.env.local` is not excluded

## What's Next?

Once everything is working:
- ✅ You can create, edit, and delete posts
- ✅ You can create, edit, and delete campaigns
- ✅ All data is saved in Supabase
- ✅ Data persists when you refresh the page

**Next features to implement:**
- Authentication & user management
- AI features integration
- Advanced features (bulk operations, export/import)
- Real-time updates

## Need More Help?

If you're stuck:
1. Check the browser console (F12) for errors
2. Check Supabase logs: Dashboard → Logs
3. Verify your environment variables are correct
4. Make sure the migration SQL ran successfully

---

**Quick Checklist:**
- [ ] Created Supabase account
- [ ] Created new project
- [ ] Copied Project URL and anon key
- [ ] Created `.env.local` file with credentials
- [ ] Ran SQL migration in Supabase
- [ ] Verified tables exist in Table Editor
- [ ] Restarted development server
- [ ] Tested creating a post
- [ ] Verified post appears in Supabase


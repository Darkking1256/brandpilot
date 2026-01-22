# Local Development Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env.local` file in the root directory with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   **Get your Supabase credentials:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to Settings → API
   - Copy the "Project URL" and "anon public" key

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   - Navigate to http://localhost:3000

## Troubleshooting

### Issue: "Internal Server Error" or Blank Page

**Solution:** Make sure you have created `.env.local` with your Supabase credentials.

### Issue: "Supabase client error" or Authentication not working

**Solution:** 
1. Verify your Supabase URL and anon key are correct
2. Make sure your Supabase project is running
3. Check that you've run the database migrations (see `supabase/migrations/`)

### Issue: Build errors

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Issue: Styles not loading

**Solution:**
- Make sure Tailwind CSS is properly configured
- Check that `globals.css` is imported in `app/layout.tsx`
- Restart the dev server

## Required Environment Variables

### Minimum (for basic functionality):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NEXT_PUBLIC_SITE_URL` - Your site URL (http://localhost:3000 for local)

### Optional (for full features):
- `OPENAI_API_KEY` - For AI content generation
- `GROQ_API_KEY` - Alternative AI provider
- `STRIPE_SECRET_KEY` - For payment processing
- `STRIPE_PUBLISHABLE_KEY` - For payment processing
- `SUPABASE_SERVICE_ROLE_KEY` - For admin functions
- `ENCRYPTION_KEY` - For encrypting OAuth tokens (32 characters)
- `CRON_SECRET` - For scheduled tasks

## Development Mode

To bypass authentication during development, add to `.env.local`:
```env
NEXT_PUBLIC_DISABLE_AUTH=true
```

This will skip authentication checks in middleware (useful for testing).

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migrations from `supabase/migrations/` in order
4. Or use the combined migration: `supabase/all_migrations.sql`

## Need Help?

- Check the browser console for errors (F12)
- Check the terminal where `npm run dev` is running
- Verify environment variables are set correctly
- Make sure your Supabase project is active

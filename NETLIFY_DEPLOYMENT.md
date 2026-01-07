# Netlify Deployment Guide

This guide will help you deploy MarketPilot AI to Netlify.

## Prerequisites

- A Netlify account (sign up at https://netlify.com)
- Your Supabase project URL and keys
- GitHub repository connected (already done: https://github.com/Darkking1256/brandpilot)

## Step 1: Install Netlify Next.js Plugin

The `netlify.toml` file is already configured, but you need to ensure the plugin is installed. Netlify will automatically use it if it's in your `package.json` or you can install it:

```bash
npm install --save-dev @netlify/plugin-nextjs
```

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Sign in or create an account

2. **Add New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your repository: `Darkking1256/brandpilot`

3. **Configure Build Settings**
   - **Build command**: `npm run build` (should auto-detect)
   - **Publish directory**: `.next` (should auto-detect)
   - **Node version**: `18.18.0` (set in Netlify dashboard)

4. **Set Environment Variables**
   Go to Site settings → Environment variables and add:

   **Required:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
   ```

   **Optional (for AI features):**
   ```
   OPENAI_API_KEY=your_openai_key
   GROQ_API_KEY=your_groq_key
   ```

   **Optional (for payments):**
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Follow the prompts

4. **Set Environment Variables**
   ```bash
   netlify env:set NEXT_PUBLIC_SUPABASE_URL "your_supabase_url"
   netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_supabase_key"
   netlify env:set NEXT_PUBLIC_SITE_URL "https://your-site.netlify.app"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Step 3: Update Supabase Redirect URLs

After deployment, update your Supabase project settings:

1. Go to your Supabase Dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Netlify URL to:
   - **Site URL**: `https://your-site-name.netlify.app`
   - **Redirect URLs**: 
     - `https://your-site-name.netlify.app/auth/callback`
     - `https://your-site-name.netlify.app/**`

## Step 4: Verify Deployment

1. Visit your Netlify site URL
2. Test authentication (sign up/login)
3. Check that all pages load correctly
4. Verify API routes are working

## Common Issues & Solutions

### Issue: Build Fails with "Module not found"

**Solution**: Make sure all dependencies are in `package.json` and run:
```bash
npm install --legacy-peer-deps
```

### Issue: Environment Variables Not Working

**Solution**: 
- Check that variables are set in Netlify dashboard
- Variables must start with `NEXT_PUBLIC_` to be available in the browser
- Redeploy after adding new environment variables

### Issue: 404 Errors on Routes

**Solution**: 
- Ensure `netlify.toml` has the correct redirects
- Check that `@netlify/plugin-nextjs` is installed
- Verify Next.js App Router is being used correctly

### Issue: API Routes Not Working

**Solution**:
- Check Netlify Functions logs in the dashboard
- Ensure server-side code doesn't use Node.js-only features
- Verify environment variables are set correctly

### Issue: Build Timeout

**Solution**:
- Increase build timeout in Netlify dashboard (Site settings → Build & deploy)
- Optimize your build process
- Consider using Netlify's build cache

## Build Configuration

The `netlify.toml` file includes:
- ✅ Next.js plugin configuration
- ✅ Node.js version (18.18.0)
- ✅ Security headers
- ✅ Cache headers for static assets
- ✅ Redirect rules for App Router

## Continuous Deployment

Once connected to GitHub, Netlify will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Show build status in GitHub

## Custom Domain

To add a custom domain:
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` environment variable

## Monitoring

- **Build logs**: Available in Netlify dashboard
- **Function logs**: Site settings → Functions
- **Analytics**: Enable in Site settings → Analytics

## Support

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Netlify Community](https://answers.netlify.com/)


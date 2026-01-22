# Netlify Deployment Troubleshooting Guide

## Common Deployment Issues & Solutions

### Issue 1: Build Fails with "Module not found" or Dependency Errors

**Symptoms:**
- Build fails during `npm ci` or `npm run build`
- Errors about missing modules or peer dependency conflicts

**Solutions:**
1. Ensure `package-lock.json` is committed to your repository
2. The `netlify.toml` already includes `NPM_FLAGS = "--legacy-peer-deps"` which should handle most peer dependency issues
3. If issues persist, try updating the build command in Netlify dashboard:
   ```
   npm install --legacy-peer-deps && npm run build
   ```

### Issue 2: Build Succeeds but Site Shows 404 Errors

**Symptoms:**
- Build completes successfully
- Site loads but all routes show 404

**Solutions:**
1. Verify `@netlify/plugin-nextjs` is installed (check `package.json` devDependencies)
2. Ensure `netlify.toml` has the correct redirect rule:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/.netlify/functions/___netlify-handler"
     status = 200
   ```
3. Check that the plugin is listed in `netlify.toml`:
   ```toml
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

### Issue 3: Environment Variables Not Working

**Symptoms:**
- Build succeeds but app fails at runtime
- Errors about missing environment variables

**Solutions:**
1. **Set Required Environment Variables in Netlify Dashboard:**
   - Go to Site settings → Environment variables
   - Add these REQUIRED variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
     ```
   
2. **Optional Variables (for specific features):**
   ```
   OPENAI_API_KEY=your_openai_key (for AI features)
   GROQ_API_KEY=your_groq_key (for AI features)
   STRIPE_SECRET_KEY=your_stripe_secret (for payments)
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (for admin functions)
   CRON_SECRET=your_cron_secret (for scheduled tasks)
   ```

3. **Important:** 
   - Variables must start with `NEXT_PUBLIC_` to be available in the browser
   - Redeploy after adding new environment variables
   - Check that variable names match exactly (case-sensitive)

### Issue 4: Build Timeout

**Symptoms:**
- Build starts but times out before completing
- Error: "Build exceeded maximum build time"

**Solutions:**
1. Increase build timeout in Netlify:
   - Site settings → Build & deploy → Build settings
   - Increase timeout to 15-20 minutes
2. Optimize build:
   - Remove unused dependencies
   - Check for large files being imported unnecessarily
   - Consider using build caching

### Issue 5: API Routes Not Working

**Symptoms:**
- Frontend loads but API calls fail
- 500 errors on API routes

**Solutions:**
1. Check Netlify Functions logs:
   - Site settings → Functions → View logs
2. Verify environment variables are set correctly
3. Check that server-side code doesn't use Node.js-only features
4. Ensure API routes are in `app/api/` directory

### Issue 6: Authentication Not Working

**Symptoms:**
- Can't sign in or sign up
- Redirect loops or authentication errors

**Solutions:**
1. **Update Supabase Redirect URLs:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Netlify URL:
     - Site URL: `https://your-site.netlify.app`
     - Redirect URLs: 
       - `https://your-site.netlify.app/auth/callback`
       - `https://your-site.netlify.app/**`
   
2. **Verify Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` is correct
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

### Issue 7: TypeScript Errors During Build

**Symptoms:**
- Build fails with TypeScript compilation errors

**Solutions:**
1. Run `npm run build` locally to catch errors before deploying
2. Fix any TypeScript errors shown
3. Ensure `tsconfig.json` is properly configured
4. Check that all imports are correct

### Issue 8: Static Assets Not Loading

**Symptoms:**
- Images or other static assets show 404

**Solutions:**
1. Ensure static files are in `public/` directory
2. Use Next.js `Image` component for images
3. Check that image domains are configured in `next.config.js`

## Step-by-Step Deployment Checklist

### Before Deploying:
- [ ] All environment variables are documented
- [ ] `package.json` has all dependencies listed
- [ ] `package-lock.json` is committed
- [ ] Build works locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] `netlify.toml` is configured correctly

### During Deployment:
- [ ] Connect GitHub repository to Netlify
- [ ] Set build command: `npm ci && npm run build`
- [ ] Set Node version: `18.18.0`
- [ ] Add all required environment variables
- [ ] Start deployment

### After Deployment:
- [ ] Verify site loads at Netlify URL
- [ ] Test authentication (sign up/login)
- [ ] Test API routes
- [ ] Update Supabase redirect URLs
- [ ] Test all major features

## Quick Fixes

### Reset Build Cache
If builds are failing mysteriously:
1. Site settings → Build & deploy → Clear build cache
2. Trigger a new deployment

### Check Build Logs
1. Go to Deploys tab in Netlify dashboard
2. Click on the failed deployment
3. Review build logs for specific errors

### Verify Configuration
Run these checks:
```bash
# Check if build works locally
npm ci
npm run build

# Check for TypeScript errors
npm run lint

# Verify environment variables are set (in Netlify dashboard)
```

## Getting Help

1. **Check Netlify Build Logs:**
   - Most errors will show specific messages in the build logs
   - Look for the first error message - that's usually the root cause

2. **Common Error Messages:**
   - "Module not found" → Missing dependency or wrong import path
   - "Cannot find module" → Check import paths and file extensions
   - "Environment variable not set" → Add missing env var in Netlify dashboard
   - "Build timeout" → Increase timeout or optimize build

3. **Netlify Support:**
   - [Netlify Documentation](https://docs.netlify.com/)
   - [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
   - [Netlify Community](https://answers.netlify.com/)

## Current Configuration

Your `netlify.toml` is configured with:
- ✅ Next.js plugin (`@netlify/plugin-nextjs`)
- ✅ Node.js version 18.18.0
- ✅ Legacy peer deps flag for npm
- ✅ Proper redirects for App Router
- ✅ Security headers
- ✅ Cache headers for static assets

If deployment still fails, check the specific error message in Netlify build logs and refer to the relevant section above.

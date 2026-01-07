# Troubleshooting Guide

Common issues and solutions for MarketPilot AI.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Authentication Issues](#authentication-issues)
3. [Database Issues](#database-issues)
4. [Platform Connection Issues](#platform-connection-issues)
5. [Post Publishing Issues](#post-publishing-issues)
6. [Performance Issues](#performance-issues)
7. [UI/UX Issues](#uiux-issues)
8. [API Issues](#api-issues)

---

## Installation Issues

### Issue: npm install fails

**Symptoms:**
- Error during `npm install`
- Missing dependencies

**Solutions:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete `node_modules` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check Node.js version (requires 18+):
   ```bash
   node --version
   ```

4. Try using yarn or pnpm instead:
   ```bash
   yarn install
   # or
   pnpm install
   ```

### Issue: Build fails

**Symptoms:**
- `npm run build` fails
- TypeScript errors

**Solutions:**
1. Check TypeScript version:
   ```bash
   npm list typescript
   ```

2. Clear `.next` directory:
   ```bash
   rm -rf .next
   npm run build
   ```

3. Check for missing environment variables

4. Review error messages in build output

---

## Authentication Issues

### Issue: Cannot sign in

**Symptoms:**
- Login page shows error
- Redirect loops

**Solutions:**
1. Verify Supabase credentials:
   - Check `NEXT_PUBLIC_SUPABASE_URL`
   - Check `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Check Supabase project status:
   - Ensure project is active
   - Check authentication settings

3. Clear browser cookies and cache

4. Check redirect URLs in Supabase Auth settings

### Issue: Session expires quickly

**Symptoms:**
- User gets logged out frequently

**Solutions:**
1. Check Supabase session settings
2. Verify `NEXT_PUBLIC_SITE_URL` is correct
3. Check cookie settings in middleware

---

## Database Issues

### Issue: Tables not found

**Symptoms:**
- Error: "relation does not exist"
- Missing tables

**Solutions:**
1. Verify migrations ran successfully:
   - Check Supabase SQL Editor
   - Run migrations manually if needed

2. Check migration order:
   - Run migrations in numerical order
   - Don't skip migrations

3. Verify database connection:
   - Check Supabase project URL
   - Verify network access

### Issue: RLS (Row Level Security) blocking access

**Symptoms:**
- "permission denied" errors
- Cannot access data

**Solutions:**
1. Check RLS policies:
   - Go to Supabase → Authentication → Policies
   - Verify policies are set correctly

2. Verify user authentication:
   - Check if user is logged in
   - Verify user ID matches

3. Review RLS policy logic

### Issue: Realtime not working

**Symptoms:**
- No live updates
- Changes not syncing

**Solutions:**
1. Verify Realtime is enabled:
   - Go to Database → Replication
   - Ensure tables are set to replicate

2. Check migration `003_enable_realtime.sql` ran

3. Verify WebSocket connection:
   - Check browser console for errors
   - Check network tab

---

## Platform Connection Issues

### Issue: Cannot connect platform

**Symptoms:**
- OAuth redirect fails
- "Not Configured" status

**Solutions:**
1. **For Platform Owners:**
   - Verify OAuth credentials in Admin panel
   - Check Client ID and Client Secret
   - Verify redirect URI matches

2. **For Users:**
   - Check if platform owner configured OAuth
   - Verify platform status shows "Ready to Connect"
   - Try disconnecting and reconnecting

3. Check OAuth app settings:
   - Verify redirect URI in platform's developer portal
   - Check app permissions/scopes
   - Verify app is approved (if required)

### Issue: Connection works but posts fail

**Symptoms:**
- Platform connected successfully
- Posts fail to publish

**Solutions:**
1. Check token expiration:
   - Tokens may have expired
   - Try reconnecting platform

2. Verify platform permissions:
   - Check required scopes are granted
   - Re-authorize with correct permissions

3. Check platform API status:
   - Verify platform APIs are operational
   - Check for rate limiting

4. Review error messages:
   - Check post details for specific errors
   - Review API response

### Issue: Token refresh fails

**Symptoms:**
- Connection works initially
- Fails after some time

**Solutions:**
1. Verify refresh token is stored
2. Check token refresh logic
3. Reconnect platform if needed

---

## Post Publishing Issues

### Issue: Scheduled posts not publishing

**Symptoms:**
- Posts remain in "scheduled" status
- Cron job not running

**Solutions:**
1. **For Vercel:**
   - Verify `vercel.json` cron configuration
   - Check Vercel cron job status
   - Verify endpoint is accessible

2. **For Other Platforms:**
   - Set up external cron job
   - Call `/api/scheduler/check-posts` every minute
   - Verify endpoint is public or authenticated

3. Check post status:
   - Verify post is actually scheduled
   - Check scheduled date/time is in the past
   - Verify platform is connected

4. Review error logs:
   - Check application logs
   - Review failed post details

### Issue: Post validation fails

**Symptoms:**
- Cannot save post
- Validation errors

**Solutions:**
1. Check character limits:
   - Twitter: 280 characters
   - LinkedIn: 3000 characters
   - Other platforms vary

2. Verify image format/size:
   - Check supported formats
   - Verify file size limits

3. Check required fields:
   - Content is required
   - Platform must be selected
   - Date/time must be set

### Issue: Post publishes but appears wrong

**Symptoms:**
- Post publishes successfully
- Content appears incorrect

**Solutions:**
1. Check platform-specific formatting:
   - Hashtags format
   - Mentions format
   - Link previews

2. Verify image upload:
   - Check image URL is accessible
   - Verify image format is supported

3. Review post preview before publishing

---

## Performance Issues

### Issue: Slow page loads

**Symptoms:**
- Pages take long to load
- Timeouts

**Solutions:**
1. Check database queries:
   - Review query performance
   - Add indexes if needed
   - Optimize queries

2. Check network:
   - Verify Supabase connection
   - Check CDN configuration
   - Review image optimization

3. Check bundle size:
   - Review code splitting
   - Check for large dependencies
   - Optimize imports

### Issue: Real-time updates lag

**Symptoms:**
- Updates appear delayed
- WebSocket disconnects

**Solutions:**
1. Check WebSocket connection:
   - Verify stable connection
   - Check for reconnection logic

2. Review Supabase Realtime:
   - Check Realtime status
   - Verify subscription setup

3. Check network stability

---

## UI/UX Issues

### Issue: Components not rendering

**Symptoms:**
- Blank pages
- Missing UI elements

**Solutions:**
1. Check browser console for errors
2. Verify all dependencies installed
3. Clear browser cache
4. Check for JavaScript errors

### Issue: Dark mode not working

**Symptoms:**
- Dark mode toggle doesn't work
- Inconsistent theming

**Solutions:**
1. Check theme provider setup
2. Verify CSS variables
3. Check browser compatibility
4. Clear localStorage

### Issue: Mobile layout broken

**Symptoms:**
- Layout issues on mobile
- Touch interactions not working

**Solutions:**
1. Check responsive CSS
2. Verify viewport meta tag
3. Test on actual devices
4. Check mobile navigation component

---

## API Issues

### Issue: API endpoints return 404

**Symptoms:**
- API calls fail
- 404 errors

**Solutions:**
1. Verify API route exists:
   - Check file structure
   - Verify route naming

2. Check Next.js routing:
   - Verify App Router structure
   - Check route handlers

3. Verify deployment:
   - Check if routes are included in build
   - Review deployment logs

### Issue: API returns 500 errors

**Symptoms:**
- Server errors
- Internal errors

**Solutions:**
1. Check server logs:
   - Review error messages
   - Check stack traces

2. Verify environment variables:
   - Check all required vars are set
   - Verify values are correct

3. Check database connection:
   - Verify Supabase connection
   - Check query syntax

4. Review error handling:
   - Check try-catch blocks
   - Verify error responses

### Issue: CORS errors

**Symptoms:**
- CORS policy errors
- Cross-origin requests blocked

**Solutions:**
1. Check CORS configuration:
   - Verify allowed origins
   - Check headers

2. Verify API route setup:
   - Check Next.js API routes
   - Verify middleware

3. Check Supabase CORS:
   - Verify Supabase CORS settings
   - Check allowed origins

---

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Review error messages carefully
3. Check browser console for errors
4. Review server logs
5. Verify environment variables
6. Test in incognito/private mode

### Providing Information

When asking for help, include:

1. **Error Messages**: Full error text
2. **Steps to Reproduce**: What you did
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: 
   - Node.js version
   - Browser and version
   - Operating system
6. **Logs**: Relevant log entries
7. **Screenshots**: If applicable

### Resources

- [Documentation](./README.md)
- [Features Guide](./FEATURES.md)
- [API Documentation](./API.md)
- [Getting Started](./GETTING_STARTED.md)
- GitHub Issues
- Support Team

---

*Last Updated: 2024*


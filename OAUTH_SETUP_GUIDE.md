# 🔐 OAuth Setup Guide

## Overview

Each user must authorize the application through OAuth to connect their social media platforms. This ensures:
- ✅ Each user gets their own unique access token
- ✅ Secure token storage per user
- ✅ No manual token entry required
- ✅ Proper authorization flow

## How It Works

### Flow Diagram

```
1. User clicks "Connect [Platform]" button
   ↓
2. User is redirected to platform's OAuth page
   (e.g., Twitter, LinkedIn, Facebook, etc.)
   ↓
3. User authorizes the app
   ↓
4. Platform redirects back with authorization code
   ↓
5. Backend exchanges code for access token
   ↓
6. Token is stored in database for that user
   ↓
7. User is redirected back to Settings page
```

## Setup Instructions

### Step 1: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Twitter/X OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Facebook/Instagram OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# YouTube OAuth (Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# TikTok OAuth
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# App URL (for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Create OAuth Apps

#### Twitter/X

1. Go to https://developer.twitter.com
2. Create a new app
3. Set callback URL: `http://localhost:3000/api/platforms/oauth/twitter/callback`
4. Enable OAuth 2.0
5. Request scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`
6. Copy Client ID and Client Secret

#### LinkedIn

1. Go to https://www.linkedin.com/developers
2. Create a new app
3. Set redirect URL: `http://localhost:3000/api/platforms/oauth/linkedin/callback`
4. Request scopes: `w_member_social`, `r_liteprofile`, `r_emailaddress`
5. Copy Client ID and Client Secret

#### Facebook/Instagram

1. Go to https://developers.facebook.com
2. Create a new app
3. Add Facebook Login product
4. Set redirect URL: `http://localhost:3000/api/platforms/oauth/facebook/callback`
5. Request permissions: `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`
6. For Instagram: Also request `instagram_basic`, `instagram_content_publish`
7. Copy App ID and App Secret

#### YouTube (Google)

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable YouTube Data API v3
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:3000/api/platforms/oauth/youtube/callback`
6. Request scopes: `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/youtube`
7. Copy Client ID and Client Secret

#### TikTok

1. Go to https://developers.tiktok.com
2. Create a new app (requires business account approval)
3. Set redirect URL: `http://localhost:3000/api/platforms/oauth/tiktok/callback`
4. Request scopes: `user.info.basic`, `video.upload`, `video.publish`
5. Copy Client Key and Client Secret

### Step 3: Update Database Schema

Make sure you've run the migration for `platform_connections` table:

```sql
-- This should already be in: supabase/migrations/006_platform_connections.sql
```

### Step 4: Test the Flow

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Settings:**
   - Go to `/dashboard/settings`
   - Click on the "Platforms" tab

3. **Connect a Platform:**
   - Click "Connect [Platform]" button
   - You'll be redirected to the platform's authorization page
   - Authorize the app
   - You'll be redirected back to Settings
   - You should see a success message

4. **Verify Connection:**
   - The platform card should show "Connected" status
   - Click "Test Connection" to verify it works

## API Routes

### OAuth Initiation
- **Route:** `/api/platforms/oauth/[platform]`
- **Method:** GET
- **Description:** Redirects user to platform's OAuth authorization page
- **Platforms:** `twitter`, `linkedin`, `facebook`, `instagram`, `youtube`, `tiktok`

### OAuth Callback
- **Route:** `/api/platforms/oauth/[platform]/callback`
- **Method:** GET
- **Description:** Handles OAuth callback, exchanges code for token, stores in database
- **Query Params:** `code` (authorization code), `error` (if authorization failed)

## User Experience

### For Users

1. **Click "Connect"** → Redirected to platform login
2. **Login & Authorize** → Platform asks for permissions
3. **Redirected Back** → Success message appears
4. **Token Stored** → Securely stored in database
5. **Ready to Use** → Can now auto-publish posts

### Security Features

- ✅ Each user's tokens are stored separately (by `user_id`)
- ✅ Tokens are encrypted in the database
- ✅ Refresh tokens stored for automatic renewal
- ✅ Token expiration tracked
- ✅ No manual token entry (prevents errors)

## Troubleshooting

### "OAuth config missing" Error
- **Cause:** Missing environment variables
- **Fix:** Add required `CLIENT_ID` and `CLIENT_SECRET` to `.env.local`

### "Token exchange failed" Error
- **Cause:** Invalid client credentials or callback URL mismatch
- **Fix:** Verify credentials and ensure callback URL matches exactly

### "Callback failed" Error
- **Cause:** Error during token storage or user info retrieval
- **Fix:** Check server logs and database connection

### Redirect URL Mismatch
- **Cause:** Callback URL in OAuth app doesn't match your app URL
- **Fix:** Update callback URL in platform's developer portal to match `NEXT_PUBLIC_APP_URL`

## Production Deployment

### Update Callback URLs

For production, update callback URLs in each platform's developer portal:

```
Production URLs:
- Twitter: https://yourdomain.com/api/platforms/oauth/twitter/callback
- LinkedIn: https://yourdomain.com/api/platforms/oauth/linkedin/callback
- Facebook: https://yourdomain.com/api/platforms/oauth/facebook/callback
- Instagram: https://yourdomain.com/api/platforms/oauth/instagram/callback
- YouTube: https://yourdomain.com/api/platforms/oauth/youtube/callback
- TikTok: https://yourdomain.com/api/platforms/oauth/tiktok/callback
```

### Update Environment Variables

Set `NEXT_PUBLIC_APP_URL` to your production domain:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Next Steps

After setting up OAuth:

1. ✅ Users can connect their platforms
2. ✅ Scheduled posts will auto-publish using their tokens
3. ✅ Each user's posts publish to their own accounts
4. ✅ Tokens are automatically refreshed when needed

---

**Note:** When authentication is enabled, replace the placeholder `user_id` in the OAuth callback routes with the actual authenticated user's ID from the session.


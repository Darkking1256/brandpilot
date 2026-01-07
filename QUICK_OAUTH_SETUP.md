# 🚀 Quick OAuth Setup Guide

## Current Status

Your platform connections page is showing "Not Configured" for all platforms. This means the OAuth credentials haven't been added to your environment variables yet.

## Quick Steps to Get Started

### 1. Create/Edit `.env.local` File

Create a file named `.env.local` in your project root (same directory as `package.json`) and add:

```env
# Twitter/X OAuth
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here

# Facebook/Instagram OAuth (same credentials for both)
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# YouTube OAuth (Google)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# TikTok OAuth
TIKTOK_CLIENT_KEY=your_tiktok_client_key_here
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret_here

# App URL (for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Get OAuth Credentials

#### Twitter/X
1. Go to https://developer.twitter.com
2. Create a new app
3. Set callback URL: `http://localhost:3000/api/platforms/oauth/twitter/callback`
4. Copy Client ID and Client Secret

#### LinkedIn
1. Go to https://www.linkedin.com/developers
2. Create a new app
3. Set redirect URL: `http://localhost:3000/api/platforms/oauth/linkedin/callback`
4. Copy Client ID and Client Secret

#### Facebook/Instagram
1. Go to https://developers.facebook.com
2. Create a new app
3. Add Facebook Login product
4. Set redirect URL: `http://localhost:3000/api/platforms/oauth/facebook/callback`
5. For Instagram: Also set `http://localhost:3000/api/platforms/oauth/instagram/callback`
6. Copy App ID and App Secret

#### YouTube
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 Client ID
5. Set redirect URI: `http://localhost:3000/api/platforms/oauth/youtube/callback`
6. Copy Client ID and Client Secret

#### TikTok
1. Go to https://developers.tiktok.com
2. Create a new app (requires business account)
3. Set redirect URL: `http://localhost:3000/api/platforms/oauth/tiktok/callback`
4. Copy Client Key and Client Secret

### 3. Restart Your Server

After adding the credentials to `.env.local`:

```bash
# Stop your current server (Ctrl+C)
# Then restart it
npm run dev
```

### 4. Check Status

1. Go to `/dashboard/settings` → Platforms tab
2. You should see:
   - ✅ "Ready to Connect" badges (instead of "Not Configured")
   - ✅ "Connect [Platform]" buttons enabled
3. Click "Connect" to start OAuth flow

## What Happens Next

1. **Click "Connect"** → You'll be redirected to the platform's login page
2. **Login & Authorize** → Platform asks for permissions
3. **Redirected Back** → Success message appears
4. **Token Stored** → Your access token is securely saved
5. **Ready to Use** → Scheduled posts will auto-publish to your account

## Troubleshooting

### Still showing "Not Configured"?
- ✅ Make sure `.env.local` is in the project root
- ✅ Restart your development server after adding variables
- ✅ Check for typos in variable names (they're case-sensitive)
- ✅ Make sure there are no spaces around the `=` sign

### Connection fails?
- ✅ Check that callback URLs match exactly in platform's developer portal
- ✅ Verify your credentials are correct
- ✅ Check browser console for detailed error messages
- ✅ See `OAUTH_SETUP_GUIDE.md` for detailed troubleshooting

## Need Help?

- See `OAUTH_SETUP_GUIDE.md` for detailed platform-specific instructions
- Check the browser console for error messages
- Verify your `.env.local` file has all required variables

---

**Note:** You don't need to configure all platforms at once. Start with one platform (like Twitter or LinkedIn) to test the flow, then add others as needed.


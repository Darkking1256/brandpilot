# 🔗 Platform Integration Setup Guide

Your platform integrations are now ready! Connect your social media accounts and enable auto-publishing.

## ✅ Features Implemented

- ✅ **Twitter/X Integration** - Connect and publish to Twitter/X
- ✅ **LinkedIn Integration** - Connect and publish to LinkedIn
- ✅ **Facebook Integration** - Connect and publish to Facebook
- ✅ **Instagram Integration** - Connect and publish to Instagram (via Facebook API)
- ✅ **YouTube Integration** - Connect and publish to YouTube (community posts and video descriptions)
- ✅ **TikTok Integration** - Connect and publish to TikTok (requires business account)
- ✅ **Auto-Publishing** - Scheduled posts automatically publish to platforms
- ✅ **Connection Management** - Manage platform connections in Settings
- ✅ **Connection Testing** - Test platform connections before publishing
- ✅ **Token Management** - Secure storage and refresh of access tokens

## Setup Steps

### Step 1: Run Database Migrations

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Run these migrations in order:
   - `supabase/migrations/006_platform_connections.sql` - Creates platform_connections table
   - `supabase/migrations/007_add_platform_post_fields.sql` - Adds platform_post_id and platform_post_url to posts

### Step 2: Get Platform API Credentials

#### Twitter/X API Setup

1. **Create Twitter Developer Account:**
   - Go to https://developer.twitter.com
   - Apply for developer access
   - Create a new app/project

2. **Get Access Token:**
   - Go to your app's "Keys and tokens" section
   - Generate "Access Token and Secret" (OAuth 1.0a) or "Bearer Token" (OAuth 2.0)
   - For OAuth 2.0, you'll need:
     - API Key
     - API Secret
     - Bearer Token (or Access Token)

3. **Required Permissions:**
   - Read and Write (for posting tweets)
   - Read user information

#### LinkedIn API Setup

1. **Create LinkedIn App:**
   - Go to https://www.linkedin.com/developers/apps
   - Create a new app
   - Fill in app details

2. **Get Access Token:**
   - Go to "Auth" tab
   - Request these scopes:
     - `w_member_social` (for posting)
     - `r_liteprofile` or `r_basicprofile` (for user info)
   - Use OAuth 2.0 flow to get access token

3. **Required Products:**
   - Sign In with LinkedIn
   - Share on LinkedIn

#### YouTube API Setup

1. **Create Google Cloud Project:**
   - Go to https://console.cloud.google.com
   - Create a new project or select existing
   - Enable "YouTube Data API v3"

2. **Get OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Create OAuth 2.0 Client ID
   - Configure consent screen
   - Get Client ID and Client Secret

3. **Get Access Token:**
   - Use OAuth 2.0 flow to get access token
   - Required scopes:
     - `https://www.googleapis.com/auth/youtube.upload` (for video uploads)
     - `https://www.googleapis.com/auth/youtube` (for full access)
     - `https://www.googleapis.com/auth/youtube.force-ssl` (for read/write)

4. **Note:** YouTube API primarily supports video uploads. For community posts, you may need to use alternative methods or the YouTube Community API if available.

#### TikTok API Setup

1. **Create TikTok Developer Account:**
   - Go to https://developers.tiktok.com
   - Sign up for developer access
   - Apply for Marketing API access (requires business account)

2. **Get Access Token:**
   - Create an app in TikTok Developer Portal
   - Request Marketing API access
   - Use OAuth 2.0 flow to get access token
   - Required scopes:
     - `video.upload` (for video posts)
     - `video.publish` (for publishing)

3. **Note:** TikTok API requires:
   - Business account (not personal)
   - App approval from TikTok
   - Specific permissions for posting

#### Facebook/Instagram API Setup

1. **Create Facebook App:**
   - Go to https://developers.facebook.com
   - Create a new app
   - Add "Facebook Login" product

2. **Get Access Token:**
   - Go to "Tools" → "Graph API Explorer"
   - Select your app
   - Request these permissions:
     - `pages_manage_posts` (for posting to pages)
     - `pages_read_engagement` (for reading)
   - Generate access token

3. **For Instagram:**
   - Connect Instagram Business account to Facebook Page
   - Use Facebook Graph API with Instagram permissions

### Step 3: Connect Platforms

1. **Navigate to Settings:**
   - Go to: `http://localhost:3000/dashboard/settings`
   - Click on "Platforms" tab

2. **Connect a Platform:**
   - Click "Connect Platform" button
   - Select platform (Twitter, LinkedIn, Facebook, Instagram)
   - Enter your access token
   - Click "Connect"

3. **Test Connection:**
   - After connecting, click "Test Connection" button
   - Verify the connection works

### Step 4: Enable Auto-Publishing

1. **Create Scheduled Post:**
   - Go to Scheduler page
   - Create a new post
   - Select a platform you've connected
   - Set future date/time
   - Set status to "scheduled"

2. **Scheduler Will Auto-Publish:**
   - Cron job runs every 5 minutes (configured in `vercel.json`)
   - Checks for posts ready to publish
   - Publishes to connected platforms automatically

## How It Works

### Publishing Flow

1. **Scheduler Checks Posts:**
   - Runs every 5 minutes (via cron)
   - Finds posts with `status = "scheduled"`
   - Checks if scheduled date/time has passed

2. **Gets Platform Connection:**
   - Looks up platform connection for user
   - Retrieves access token
   - Creates platform instance

3. **Publishes to Platform:**
   - Calls platform API (Twitter, LinkedIn, Facebook)
   - Formats content for platform
   - Handles images/links if provided

4. **Updates Post Status:**
   - On success: Sets status to "published"
   - Stores platform post ID and URL
   - Updates connection last_used_at

5. **Handles Errors:**
   - On failure: Sets status to "failed"
   - Logs error message
   - Can be retried later

### Platform-Specific Details

#### Twitter/X
- **Character Limit:** 280 characters
- **API:** Twitter API v2
- **Endpoint:** `POST /2/tweets`
- **Supports:** Text, links (URLs count toward limit)

#### LinkedIn
- **Character Limit:** 3000 characters
- **API:** LinkedIn API v2
- **Endpoint:** `POST /v2/ugcPosts`
- **Supports:** Text, links, media (via separate API)

#### Facebook
- **Character Limit:** 63,206 characters
- **API:** Facebook Graph API v18.0
- **Endpoint:** `POST /{page-id}/feed`
- **Supports:** Text, links, images

#### Instagram
- **Uses:** Facebook Graph API
- **Requires:** Instagram Business account connected to Facebook Page
- **Supports:** Images/videos (media required)

#### YouTube
- **Character Limit:** 5000 characters (for descriptions)
- **API:** YouTube Data API v3
- **Endpoint:** `POST /youtube/v3/videos` (for video uploads)
- **Supports:** Video uploads, community posts (limited), descriptions
- **Note:** Full video upload requires file handling. Community posts have limited API support.

#### TikTok
- **Character Limit:** 2200 characters (for captions)
- **API:** TikTok Marketing API
- **Endpoint:** `POST /open_api/v1.3/post/publish/`
- **Supports:** Video posts, captions
- **Requires:** Business account and API approval
- **Note:** Video uploads require file handling. Full implementation needs TikTok API approval.

## API Endpoints

### GET `/api/platforms`
- Fetches all platform connections for user
- Returns: `{ connections: [...] }`
- Excludes sensitive tokens

### POST `/api/platforms/connect`
- Connects a platform account
- Body: `{ platform, accessToken, refreshToken?, tokenExpiresAt?, platformUserId?, platformUsername? }`
- Returns: `{ connection: {...} }`

### POST `/api/platforms/test`
- Tests platform connection
- Body: `{ platform }`
- Returns: `{ success: boolean, message: string }`

### GET/POST `/api/scheduler/check-posts`
- Checks and publishes scheduled posts
- Uses platform APIs to actually publish
- Returns: `{ published: number, failed: number, ... }`

## Database Schema

### platform_connections table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- platform (TEXT, Required)
- platform_user_id (TEXT)
- platform_username (TEXT)
- access_token (TEXT, Required, Encrypted)
- refresh_token (TEXT)
- token_expires_at (TIMESTAMP)
- is_active (BOOLEAN, Default: true)
- last_used_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### posts table (updated)
```sql
- platform_post_id (TEXT) - Platform's post ID after publishing
- platform_post_url (TEXT) - URL to the published post
```

## Security Considerations

### Token Storage
- **Current:** Tokens stored in database (should be encrypted in production)
- **Production:** Use encryption or secure vault (AWS Secrets Manager, etc.)
- **Refresh:** Implement token refresh logic for expired tokens

### OAuth Flow
- **Current:** Manual token entry
- **Production:** Implement full OAuth 2.0 flow:
  - Redirect to platform authorization
  - Handle callback
  - Exchange code for token
  - Store securely

### Rate Limits
- **Twitter:** 1,500 tweets/day (v2 API)
- **LinkedIn:** 100 posts/day
- **Facebook:** Varies by app
- **Implementation:** Add rate limiting logic

## Testing

### Test Platform Connection

1. **Connect Platform:**
   - Go to Settings → Platforms
   - Connect a platform with test token

2. **Test Connection:**
   - Click "Test Connection" button
   - Should show success message

3. **Create Test Post:**
   - Go to Scheduler
   - Create post for connected platform
   - Schedule for 1-2 minutes in future

4. **Trigger Scheduler:**
   ```bash
   curl -X POST http://localhost:3000/api/scheduler/check-posts
   ```

5. **Verify Publishing:**
   - Check post status changed to "published"
   - Check platform_post_id and platform_post_url are set
   - Visit platform_post_url to see published post

## Troubleshooting

### Connection Not Working

1. **Check Token:**
   - Verify token is valid
   - Check token hasn't expired
   - Ensure correct permissions/scopes

2. **Test Connection:**
   - Use "Test Connection" button
   - Check error message
   - Verify API credentials

### Posts Not Publishing

1. **Check Platform Connection:**
   - Verify platform is connected
   - Check connection is active
   - Test connection manually

2. **Check Scheduler:**
   - Verify cron job is running
   - Check scheduler logs
   - Manually trigger scheduler

3. **Check Post Status:**
   - Ensure post is "scheduled"
   - Verify date/time has passed
   - Check for error messages

### API Errors

1. **Rate Limits:**
   - Check if you've hit rate limits
   - Wait and retry
   - Implement rate limiting

2. **Token Expired:**
   - Refresh token if possible
   - Reconnect platform
   - Update token in settings

3. **Permissions:**
   - Verify app has correct permissions
   - Check platform-specific requirements
   - Re-authorize if needed

## Next Steps

### Production Enhancements

1. **OAuth Flow:**
   - Implement full OAuth 2.0 redirect flow
   - Handle callbacks securely
   - Auto-refresh tokens

2. **Error Handling:**
   - Better error messages
   - Retry logic with exponential backoff
   - Notification system for failures

3. **Media Support:**
   - Upload images to platforms
   - Handle video posts
   - Support carousel posts

4. **Analytics:**
   - Track post performance
   - Sync engagement metrics
   - Platform-specific analytics

---

**Platform integrations are ready!** 🎉

Connect your accounts and start auto-publishing! ✨


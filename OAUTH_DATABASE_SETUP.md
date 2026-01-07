# 🔐 OAuth Database Setup Guide

## Overview

OAuth credentials are now stored in the database instead of environment variables. This makes it much easier for clients - they just click "Connect" and authorize. No setup required!

## How It Works

### For Platform Owners (You)

1. **Configure OAuth credentials once** in the Admin panel
2. **All clients** can then connect without any configuration
3. **Each client** gets their own access token through OAuth

### For Clients

1. Click "Connect [Platform]"
2. Authorize on the platform's page
3. Done! Token is stored automatically

## Setup Steps

### Step 1: Run Database Migration

Run the migration to create the `oauth_app_credentials` table:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/009_oauth_app_credentials.sql
```

### Step 2: Get OAuth Credentials

Get OAuth credentials from each platform's developer portal:

- **Twitter/X**: https://developer.twitter.com
- **LinkedIn**: https://www.linkedin.com/developers
- **Facebook/Instagram**: https://developers.facebook.com
- **YouTube**: https://console.cloud.google.com
- **TikTok**: https://developers.tiktok.com

### Step 3: Add Credentials in Admin Panel

1. Go to **Dashboard → Admin → OAuth Credentials**
2. For each platform:
   - Enter **Client ID** (or Client Key for TikTok)
   - Enter **Client Secret**
   - Verify **Redirect URI** is correct
   - Click **Save**

### Step 4: Set Callback URLs in Platform Portals

Make sure each platform's developer portal has the correct callback URL:

- Twitter: `http://localhost:3000/api/platforms/oauth/twitter/callback`
- LinkedIn: `http://localhost:3000/api/platforms/oauth/linkedin/callback`
- Facebook: `http://localhost:3000/api/platforms/oauth/facebook/callback`
- Instagram: `http://localhost:3000/api/platforms/oauth/instagram/callback`
- YouTube: `http://localhost:3000/api/platforms/oauth/youtube/callback`
- TikTok: `http://localhost:3000/api/platforms/oauth/tiktok/callback`

**For production**, replace `localhost:3000` with your domain.

### Step 5: Clients Can Now Connect!

Once credentials are configured:
- Clients go to **Settings → Platforms**
- Click **"Connect [Platform]"**
- Authorize on the platform
- Done!

## Security

- ✅ Client secrets are **encrypted** before storing in database
- ✅ Each client gets their **own access token**
- ✅ Tokens are stored **per user** in `platform_connections` table
- ✅ OAuth app credentials are stored **once** in `oauth_app_credentials` table

## Encryption Key

The encryption key is set via `ENCRYPTION_KEY` environment variable. 

**For production**, generate a secure key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env.local`:
```env
ENCRYPTION_KEY=your_generated_key_here
```

## Fallback to Environment Variables

The system still supports environment variables as a fallback:
- If credentials exist in database → uses database
- If not in database → checks environment variables
- If neither → shows "Not Configured"

This allows gradual migration from env vars to database storage.

## Admin Panel

Access the admin panel at:
- **URL**: `/dashboard/admin/oauth-credentials`
- **Navigation**: Dashboard sidebar → "Admin"

## Troubleshooting

### "OAuth config missing" Error
- Check that credentials are saved in Admin panel
- Verify Client ID and Client Secret are correct
- Check that callback URLs match in platform portals

### "Not Configured" Status
- Go to Admin → OAuth Credentials
- Add credentials for the platform
- Refresh the Settings page

### Connection Fails
- Verify callback URLs match exactly
- Check credentials are correct
- Review browser console for detailed errors

## Benefits

✅ **Easier for clients** - No setup required, just click "Connect"  
✅ **Centralized management** - Configure once, all clients benefit  
✅ **Secure** - Credentials encrypted in database  
✅ **Flexible** - Still supports environment variables as fallback  
✅ **Scalable** - Works for unlimited clients  

---

**Note**: In production, restrict Admin panel access to authorized users only by adding authentication checks.


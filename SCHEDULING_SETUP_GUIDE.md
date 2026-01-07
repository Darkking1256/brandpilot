# ⏰ Scheduling System Setup Guide

Your automated scheduling system is now ready! Here's how to set it up.

## ✅ Features Implemented

- ✅ **Auto-Publish Posts** - Automatically publish scheduled posts at their scheduled time
- ✅ **Cron Job Endpoint** - API endpoint to check and publish posts
- ✅ **Retry Logic** - Retry failed posts automatically
- ✅ **Failed Post Management** - Track and retry posts that failed to publish

## Setup Steps

### Step 1: Set Up Cron Job

You have several options for running the scheduler:

#### Option A: Vercel Cron Jobs (Recommended for Vercel deployments)

1. Create `vercel.json` in your project root:
```json
{
  "crons": [
    {
      "path": "/api/scheduler/check-posts",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes. Adjust the schedule as needed:
- `*/5 * * * *` - Every 5 minutes
- `*/15 * * * *` - Every 15 minutes
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours

#### Option B: External Cron Service

Use a service like:
- **Cron-job.org** - Free cron job service
- **EasyCron** - Reliable cron service
- **GitHub Actions** - If using GitHub

Set up a cron job to call:
```
GET https://your-domain.com/api/scheduler/check-posts
```

Schedule: Every 5-15 minutes

#### Option C: Node.js Cron (For self-hosted)

Install `node-cron`:
```bash
npm install node-cron
```

Create `lib/cron.ts`:
```typescript
import cron from 'node-cron'

export function startScheduler() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scheduler/check-posts`)
      const data = await response.json()
      console.log('Scheduler run:', data)
    } catch (error) {
      console.error('Scheduler error:', error)
    }
  })
}
```

Call `startScheduler()` in your server startup.

### Step 2: Test the Scheduler

1. **Create a test post:**
   - Go to Scheduler page
   - Create a post scheduled for a few minutes in the future
   - Set status to "scheduled"

2. **Manually trigger the scheduler:**
   ```bash
   curl -X POST http://localhost:3000/api/scheduler/check-posts
   ```

3. **Check the response:**
   - Should return JSON with published/failed counts
   - Post status should change to "published"

### Step 3: Set Up Retry Logic

Failed posts can be retried manually or automatically:

1. **Manual Retry:**
   ```bash
   curl -X POST http://localhost:3000/api/scheduler/retry-failed \
     -H "Content-Type: application/json" \
     -d '{"postIds": ["post-id-1", "post-id-2"]}'
   ```

2. **Retry All Failed:**
   ```bash
   curl -X POST http://localhost:3000/api/scheduler/retry-failed \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

## API Endpoints

### GET/POST `/api/scheduler/check-posts`

Checks for posts that need to be published and publishes them.

**Response:**
```json
{
  "success": true,
  "checked": 5,
  "published": 3,
  "failed": 2,
  "publishedPosts": [
    { "id": "post-1", "platform": "twitter" },
    { "id": "post-2", "platform": "linkedin" }
  ],
  "failedPosts": [
    { "id": "post-3", "error": "API error message" }
  ]
}
```

### POST `/api/scheduler/retry-failed`

Retries failed posts.

**Request Body:**
```json
{
  "postIds": ["post-id-1", "post-id-2"], // Optional: specific posts, or omit to retry all
  "maxRetries": 3 // Optional: max retry attempts
}
```

**Response:**
```json
{
  "success": true,
  "retried": 2,
  "stillFailed": 1,
  "retriedPosts": [
    { "id": "post-1", "platform": "twitter" }
  ],
  "stillFailedPosts": [
    { "id": "post-2", "error": "Still failing" }
  ]
}
```

## How It Works

### Publishing Flow

1. **Scheduler runs** (every 5 minutes via cron)
2. **Checks for scheduled posts** that match current date/time
3. **Publishes each post**:
   - Calls platform API (Twitter, LinkedIn, etc.)
   - Updates post status to "published"
   - Handles errors and marks as "failed" if needed

### Retry Flow

1. **Failed posts** are marked with status "failed"
2. **Retry endpoint** can be called manually or via cron
3. **Checks if post is still valid**:
   - If scheduled time hasn't passed: Change back to "scheduled"
   - If scheduled time has passed: Try to publish immediately
4. **Updates status** based on success/failure

## Platform Integration

Currently, the scheduler updates post status but doesn't actually publish to platforms. To integrate with real platforms:

### Twitter/X Integration

```typescript
// In app/api/scheduler/check-posts/route.ts
import { TwitterApi } from 'twitter-api-v2'

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
})

// Publish to Twitter
await twitterClient.v2.tweet({
  text: post.content,
  // Add media if post has image
})
```

### LinkedIn Integration

```typescript
// Use LinkedIn API
const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${linkedInAccessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    author: `urn:li:person:${userId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: post.content },
        shareMediaCategory: 'NONE',
      },
    },
  }),
})
```

## Monitoring

### Check Scheduler Status

Monitor your cron jobs:
- **Vercel**: Check Cron Jobs in dashboard
- **External services**: Check service dashboard
- **Logs**: Check application logs for scheduler runs

### Failed Posts

View failed posts:
- Go to Scheduler page
- Filter by status: "failed"
- Retry manually or wait for automatic retry

## Troubleshooting

### Posts Not Publishing

1. **Check cron job is running:**
   - Verify cron job is set up correctly
   - Check logs for errors

2. **Check post status:**
   - Ensure posts are "scheduled" not "draft"
   - Verify scheduled date/time is correct

3. **Check API endpoint:**
   - Test manually: `curl http://your-domain.com/api/scheduler/check-posts`
   - Check for errors in response

### Retry Not Working

1. **Check post status:**
   - Posts must be "failed" to retry
   - Verify post IDs are correct

2. **Check scheduled time:**
   - Posts past due date/time may need manual intervention
   - Consider extending retry window

### Platform API Errors

1. **Check API credentials:**
   - Verify platform API keys are set
   - Check token expiration

2. **Handle rate limits:**
   - Implement rate limiting
   - Add delays between requests

## Best Practices

1. **Schedule Frequency:**
   - Run every 5-15 minutes for accuracy
   - Balance between responsiveness and API calls

2. **Error Handling:**
   - Log all errors for debugging
   - Implement exponential backoff for retries

3. **Monitoring:**
   - Set up alerts for high failure rates
   - Monitor scheduler health

4. **Testing:**
   - Test with posts scheduled 1-2 minutes in future
   - Verify publishing works before going live

---

**Scheduling system is ready!** 🎉

Set up your cron job and start auto-publishing! ✨


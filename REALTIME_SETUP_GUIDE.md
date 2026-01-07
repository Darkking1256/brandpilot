# 🔴 Real-Time Updates Setup Guide

Your MarketPilot AI app now has real-time updates! Here's how to set it up and use it.

## ✅ Features Implemented

- ✅ **WebSocket Integration** - Supabase Realtime subscriptions
- ✅ **Live Notifications** - Toast notifications for all changes
- ✅ **Real-Time Collaboration** - See changes instantly across tabs/devices
- ✅ **Status Updates** - Live post/campaign status changes
- ✅ **Live Dashboard Updates** - Dashboard stats update in real-time
- ✅ **Notification Center** - Bell icon in header with notification history

## Setup Steps

### Step 1: Enable Realtime in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Database** → **Replication**
3. Or run the migration SQL:

**Option A: Via SQL Editor (Recommended)**
1. Go to **SQL Editor**
2. Copy contents of `supabase/migrations/003_enable_realtime.sql`
3. Paste and run it

**Option B: Via Dashboard**
1. Go to **Database** → **Replication**
2. Find `posts` table → Toggle **Enable Realtime**
3. Find `campaigns` table → Toggle **Enable Realtime**
4. Find `templates` table → Toggle **Enable Realtime** (if exists)

### Step 2: Verify Setup

1. **Check Browser Console:**
   - Open your app: `http://localhost:3000/dashboard`
   - Open DevTools (F12) → Console
   - You should see: "Realtime post change:" or "Realtime campaign change:" messages

2. **Test Real-Time Updates:**
   - Open app in two browser tabs/windows
   - Create a post in one tab
   - Watch it appear automatically in the other tab!

## How It Works

### Real-Time Posts
- **Automatic Updates:** Posts table updates automatically when:
  - New post is created
  - Post is updated
  - Post is deleted
  - Post status changes

### Real-Time Campaigns
- **Automatic Updates:** Campaigns table updates automatically when:
  - New campaign is created
  - Campaign is updated
  - Campaign is deleted
  - Campaign status changes

### Live Notifications
- **Toast Notifications:** Appear for:
  - Post created/updated/deleted
  - Campaign created/updated/deleted
  - Status changes (especially "published")
  - Special notifications for published posts 🎉

### Notification Center
- **Bell Icon:** Click the bell icon in the header
- **Notification History:** See last 50 notifications
- **Clear All:** Button to clear notification history
- **Live Updates:** Notifications appear as they happen

## Testing Real-Time Features

### Test 1: Multi-Tab Updates
1. Open `http://localhost:3000/dashboard/scheduler` in **Tab 1**
2. Open same URL in **Tab 2** (or different browser)
3. In **Tab 1:** Create a new post
4. **Expected:** Post appears automatically in **Tab 2** without refresh!

### Test 2: Live Notifications
1. Open dashboard
2. Create a post in another tab/window
3. **Expected:** Toast notification appears: "New Post Created"

### Test 3: Status Updates
1. Update a post status (e.g., to "Published")
2. **Expected:** 
   - Toast: "Post Published! 🎉"
   - Notification in bell icon
   - Status updates in real-time

### Test 4: Notification Center
1. Perform several actions (create, update, delete)
2. Click **Bell Icon** in header
3. **Expected:** See all notifications with timestamps

### Test 5: Dashboard Live Updates
1. Open dashboard
2. Create/update posts/campaigns in another tab
3. **Expected:** Stats cards update automatically

## Troubleshooting

### Notifications Not Appearing
- **Check:** Is Realtime enabled in Supabase?
- **Check:** Browser console for errors
- **Check:** Network tab → WebSocket connection
- **Fix:** Run the migration SQL again

### Real-Time Updates Not Working
- **Check:** Supabase Dashboard → Database → Replication
- **Check:** Tables have "Realtime" enabled
- **Check:** Browser console for subscription errors
- **Fix:** Refresh the page and check console

### WebSocket Connection Issues
- **Check:** Your internet connection
- **Check:** Supabase project is active
- **Check:** No firewall blocking WebSocket connections
- **Fix:** Restart dev server

### Performance Issues
- **Note:** Real-time subscriptions use WebSocket connections
- **Tip:** Close unused tabs to reduce connections
- **Tip:** Notifications are limited to last 50 for performance

## Technical Details

### WebSocket Subscriptions
- Uses Supabase Realtime (built on PostgreSQL logical replication)
- Subscribes to `INSERT`, `UPDATE`, `DELETE` events
- Automatically reconnects on connection loss

### Notification System
- Toast notifications for immediate feedback
- Notification center for history
- Smart filtering (status changes, published posts, etc.)

### Performance
- Efficient WebSocket connections
- Optimistic UI updates
- Debounced notifications
- Limited notification history (50 items)

## Next Steps

After enabling Realtime:
1. ✅ Test multi-tab updates
2. ✅ Test notifications
3. ✅ Verify dashboard live updates
4. 🔄 Consider implementing authentication (next feature)

---

**Real-time features are now live!** 🎉

Open multiple tabs and watch the magic happen! ✨


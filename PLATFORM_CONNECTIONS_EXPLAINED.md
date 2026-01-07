# 🔗 Platform Connections - How It Works

## Current Implementation

### Per-User Connections (Default)

**Yes, each user/client needs to connect their own platform accounts.**

This is the correct approach for a multi-user SaaS application:

1. **User-Specific Accounts:**
   - Each user has their own social media accounts (Twitter, LinkedIn, etc.)
   - Each user connects their own accounts
   - Posts publish to the user's own accounts

2. **Security & Privacy:**
   - Tokens are stored per user
   - Users can't access each other's accounts
   - Each user's posts go to their own social media profiles

3. **Database Structure:**
   ```sql
   platform_connections table:
   - user_id (links to specific user)
   - platform (twitter, linkedin, etc.)
   - access_token (user's token)
   - UNIQUE(user_id, platform) - one connection per platform per user
   ```

### Current State (Development)

**Right now:** Using a placeholder `user_id` since authentication is disabled
- All connections use: `00000000-0000-0000-0000-000000000000`
- Effectively: Single shared connection for all users
- **This is temporary for development**

### Future State (Production with Auth)

**When authentication is enabled:**
- Each logged-in user gets their own `user_id`
- Each user connects their own platform accounts
- Each user's posts publish to their own accounts
- Complete isolation between users

## How It Works

### For Each User:

1. **User logs in** → Gets unique `user_id`
2. **User goes to Settings → Platforms**
3. **User connects their accounts:**
   - Enters their Twitter access token
   - Enters their LinkedIn access token
   - etc.
4. **Connections stored:** Linked to their `user_id`
5. **When posting:**
   - System looks up connections for that `user_id`
   - Uses their tokens to publish
   - Posts appear on their accounts

### Example Flow:

```
User A:
- Connects Twitter account → Stored with user_id_A
- Creates post → Uses user_id_A's Twitter token
- Post publishes to User A's Twitter account

User B:
- Connects Twitter account → Stored with user_id_B  
- Creates post → Uses user_id_B's Twitter token
- Post publishes to User B's Twitter account
```

## Alternative: Shared/Team Accounts

If you want **shared team accounts** (optional feature):

### Option 1: Team-Level Connections
- Create `teams` table
- Store connections at team level
- All team members share same accounts
- Posts publish to team's accounts

### Option 2: Organization Accounts
- Create `organizations` table
- Store connections at org level
- All org members share accounts
- Useful for company social media accounts

### Implementation Would Require:
1. Add `team_id` or `org_id` to `platform_connections`
2. Update API routes to check team/org membership
3. Add UI for team/org account management
4. Update RLS policies

## Current Code Location

**Where connections are stored:**
- `supabase/migrations/006_platform_connections.sql` - Database schema
- `app/api/platforms/connect/route.ts` - Connection API (uses placeholder user_id)
- `components/platforms/platform-connections.tsx` - UI for connecting

**When auth is enabled, update:**
```typescript
// In app/api/platforms/connect/route.ts
// Replace:
const placeholderUserId = "00000000-0000-0000-0000-000000000000"

// With:
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
const userId = user.id
```

## Summary

**Current (Development):**
- ✅ Single shared connection (placeholder user_id)
- ✅ All users share same platform accounts
- ⚠️ Temporary - for testing only

**Future (Production):**
- ✅ Each user connects their own accounts
- ✅ Complete user isolation
- ✅ Secure token storage per user
- ✅ Posts publish to user's own accounts

**Answer:** Yes, each client/user needs to connect their own accounts. This is the standard approach for SaaS applications.


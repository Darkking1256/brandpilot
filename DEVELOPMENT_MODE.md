# Development Mode - Bypass Authentication

## Quick Start

To disable authentication and focus on developing the application:

1. **Add to `.env.local`:**
   ```env
   DISABLE_AUTH=true
   ```

2. **Restart your development server:**
   ```bash
   npm run dev
   ```

3. **Access the dashboard directly:**
   - Go to: `http://localhost:3000/dashboard`
   - No login required!
   - All API routes will work without authentication

## What Happens in Development Mode

- ✅ **Middleware**: Skips all authentication checks
- ✅ **API Routes**: Use a mock user ID (`00000000-0000-0000-0000-000000000000`)
- ✅ **Dashboard**: Accessible without login
- ✅ **Database**: Uses the mock user ID for all queries

## Mock User Details

When `DISABLE_AUTH=true`:
- **User ID**: `00000000-0000-0000-0000-000000000000`
- **Email**: `dev@example.com`
- All API routes will use this user ID automatically

## Re-enabling Authentication

To re-enable authentication:

1. **Remove or set to false in `.env.local`:**
   ```env
   DISABLE_AUTH=false
   ```
   Or simply remove the line

2. **Restart your development server**

3. **Authentication will be required again**

## Important Notes

⚠️ **Never commit `DISABLE_AUTH=true` to production!**

- This is for **development only**
- Always use authentication in production
- The mock user ID is hardcoded - don't rely on it for real data

## Testing with Real Authentication

To test with real authentication while keeping dev mode available:

1. Set `DISABLE_AUTH=false` or remove it
2. Test login/signup flows
3. Set `DISABLE_AUTH=true` when you want to bypass auth again



# How to Disable Email Confirmation in Supabase

## Quick Steps

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Sign in to your account

2. **Select Your Project**
   - Click on your project from the dashboard

3. **Navigate to Authentication Settings**
   - In the left sidebar, click **"Authentication"**
   - Then click **"Settings"** (or go directly to Authentication → Settings)

4. **Disable Email Confirmations**
   - Scroll down to find **"Enable email confirmations"**
   - **Toggle it OFF** (switch should be gray/unchecked)

5. **Save Changes**
   - Click **"Save"** button at the bottom of the page

6. **Test**
   - Try signing up a new account
   - You should be able to sign in immediately without email confirmation

## Alternative: Configure Redirect URLs (If keeping email confirmation)

If you want to keep email confirmation enabled but fix the redirect:

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (or your production URL)
3. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/**`

## For Production

- **Keep email confirmation ENABLED** for security
- Make sure redirect URLs are properly configured
- Test the email confirmation flow thoroughly

## Troubleshooting

- If you still see "email not confirmed" errors after disabling:
  - Clear your browser cache
  - Sign out and sign back in
  - Try creating a new account


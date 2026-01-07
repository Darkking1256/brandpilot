# Step-by-Step: Disable Email Confirmation in Supabase

## Quick Guide

### Step 1: Open Supabase Dashboard
1. Go to: **https://app.supabase.com**
2. Sign in with your Supabase account

### Step 2: Select Your Project
- Click on your project from the dashboard
- If you have multiple projects, select the one you're using for this application

### Step 3: Navigate to Authentication Settings
- In the **left sidebar**, click **"Authentication"**
- Then click **"Settings"** (it's usually the second option in the Authentication menu)
- Or go directly to: `Authentication → Settings`

### Step 4: Find Email Confirmation Setting
- Scroll down in the Settings page
- Look for the section **"User Management"** or **"Email Auth"**
- Find the toggle/switch labeled: **"Enable email confirmations"**

### Step 5: Disable Email Confirmation
- **Toggle the switch OFF** (it should turn gray/unchecked)
- The switch should now be in the OFF position

### Step 6: Save Changes
- Scroll to the bottom of the page
- Click the **"Save"** button
- Wait for the confirmation message that settings have been saved

### Step 7: Verify It's Disabled
1. Try signing up a new account in your app
2. You should be able to sign in **immediately** without checking email
3. No "email not confirmed" errors should appear

## Visual Guide

```
Supabase Dashboard
├── Projects
│   └── [Your Project] ← Click here
│       ├── Table Editor
│       ├── Authentication ← Click here
│       │   ├── Users
│       │   ├── Settings ← Click here
│       │   │   ├── Email Auth
│       │   │   │   └── Enable email confirmations ← Toggle OFF
│       │   │   └── [Save Button] ← Click here
```

## Troubleshooting

### Can't find the setting?
- Make sure you're in **Authentication → Settings** (not Users or Policies)
- Look for "Email Auth" section
- The setting might be under "User Management" section

### Still seeing "email not confirmed" errors?
- Clear your browser cache
- Sign out and sign back in
- Try creating a brand new account
- Check that you clicked "Save" after toggling

### Want to re-enable later?
- Just toggle it back ON and click Save
- All new signups will require email confirmation again

## For Production

⚠️ **Important**: In production, you should **keep email confirmation ENABLED** for security.

- Email confirmation prevents unauthorized account creation
- It verifies that users own the email address they're using
- It's a security best practice

Only disable it for **development/testing** purposes.



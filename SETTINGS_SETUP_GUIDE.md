# ⚙️ Settings Page Setup Guide

Your Settings page is now fully functional! Here's how to set it up and use it.

## ✅ Features Implemented

- ✅ **Profile Settings** - Update name, email, company, and bio
- ✅ **Notification Preferences** - Control email, push, SMS, and weekly digest notifications
- ✅ **Password Management** - Change password securely
- ✅ **User Preferences Storage** - All settings saved to database
- ✅ **Form Validation** - Input validation with error messages
- ✅ **Loading States** - Skeleton loaders while fetching data
- ✅ **Toast Notifications** - Success/error feedback

## Setup Steps

### Step 1: Run Database Migration

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy contents of `supabase/migrations/004_user_profiles_and_preferences.sql`
4. Paste and run it

This creates:
- `user_profiles` table - Stores user profile information
- `user_preferences` table - Stores notification and app preferences

### Step 2: Verify Setup

1. **Check Tables:**
   - Go to **Database** → **Tables**
   - You should see `user_profiles` and `user_preferences` tables

2. **Test Settings Page:**
   - Navigate to: `http://localhost:3000/dashboard/settings`
   - Try updating your profile
   - Try changing notification preferences

## How It Works

### Profile Settings
- **Fields:** Full Name, Email, Company, Bio
- **Storage:** Saved to `user_profiles` table
- **Validation:** Required fields, email format, max lengths
- **Auto-load:** Existing profile data loads automatically

### Notification Preferences
- **Options:**
  - Email notifications
  - Push notifications
  - SMS alerts
  - Weekly digest
- **Storage:** Saved to `user_preferences` table
- **Defaults:** Sensible defaults if no preferences exist
- **Real-time:** Changes saved immediately

### Password Management
- **Security:** Uses Supabase Auth for password changes
- **Validation:** 
  - Minimum 8 characters
  - Password confirmation must match
- **Note:** Requires authentication (currently shows message if not authenticated)

## Testing

### Test 1: Profile Settings
1. Go to Settings → Profile tab
2. Fill in your name, email, company, and bio
3. Click "Save Changes"
4. **Expected:** Toast notification "Profile updated"
5. Refresh page - data should persist

### Test 2: Notification Preferences
1. Go to Settings → Notifications tab
2. Toggle checkboxes (email, push, SMS, weekly digest)
3. Click "Save Preferences"
4. **Expected:** Toast notification "Preferences saved"
5. Refresh page - preferences should persist

### Test 3: Password Change
1. Go to Settings → Security tab
2. Enter current password, new password, and confirm
3. Click "Update Password"
4. **Expected:** 
   - If authenticated: Password updated successfully
   - If not authenticated: Error message about authentication

### Test 4: Data Persistence
1. Update profile settings
2. Close browser tab
3. Reopen and go to Settings
4. **Expected:** All settings should be loaded from database

## API Routes

### GET `/api/user/profile`
- Fetches user profile data
- Returns: `{ profile: {...} }`

### PUT `/api/user/profile`
- Updates user profile
- Body: `{ full_name, email, company, bio }`
- Returns: `{ profile: {...} }`

### GET `/api/user/preferences`
- Fetches user preferences
- Returns: `{ preferences: {...} }`

### PUT `/api/user/preferences`
- Updates user preferences
- Body: `{ email_notifications, push_notifications, sms_alerts, weekly_digest, theme, language, timezone }`
- Returns: `{ preferences: {...} }`

### PUT `/api/user/password`
- Updates user password
- Body: `{ current_password, new_password, confirm_password }`
- Returns: `{ message: "Password updated successfully" }`
- **Note:** Requires authentication

## Database Schema

### user_profiles
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- full_name (TEXT)
- email (TEXT)
- company (TEXT)
- avatar_url (TEXT)
- bio (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### user_preferences
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- email_notifications (BOOLEAN, default: true)
- push_notifications (BOOLEAN, default: true)
- sms_alerts (BOOLEAN, default: false)
- weekly_digest (BOOLEAN, default: true)
- theme (TEXT, default: 'system')
- language (TEXT, default: 'en')
- timezone (TEXT, default: 'UTC')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Current Limitations

1. **Authentication:** Currently uses placeholder user_id since auth is disabled
   - When you implement authentication, update API routes to use real user_id
   - Password change requires authentication

2. **Billing & Preferences Tabs:** Placeholder pages (coming soon)

3. **Avatar Upload:** Not yet implemented (avatar_url field exists but no UI)

## Next Steps

After implementing authentication:
1. Update API routes to use real `user_id` from session
2. Update RLS policies to restrict access to own data
3. Implement avatar upload functionality
4. Add billing management
5. Add theme/language/timezone preferences UI

---

**Settings page is now functional!** 🎉

Update your profile and preferences, and watch them persist! ✨


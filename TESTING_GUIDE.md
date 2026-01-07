# 🧪 Testing Guide - Advanced Features

Step-by-step guide to test all the new advanced features.

## Prerequisites

1. **Make sure your dev server is running:**
   ```bash
   npm run dev
   ```

2. **Run the templates migration** (if you haven't already):
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/002_templates_schema.sql`
   - Paste and run it
   - Verify `templates` table exists in Table Editor

## Test 1: Bulk Operations

### Step 1: Create Some Test Posts
1. Go to `http://localhost:3000/dashboard/scheduler`
2. Click **"New Post"** button
3. Create 3-5 test posts with different content
4. Make sure they appear in the table

### Step 2: Test Bulk Selection
1. **Select Individual Posts:**
   - Check the checkbox next to 2-3 posts
   - You should see a **Bulk Actions** bar appear at the top
   - It should show "X items selected"

2. **Select All:**
   - Check the checkbox in the table header (first column)
   - All posts should be selected
   - Bulk Actions bar should show all selected count

3. **Deselect:**
   - Uncheck the header checkbox
   - All selections should clear

### Step 3: Test Bulk Status Update
1. Select 2-3 posts
2. In the Bulk Actions bar:
   - Choose a status from dropdown (e.g., "Published")
   - Click **"Update"** button
3. **Expected Result:**
   - Toast notification: "Status updated"
   - Selected posts should change to the new status
   - Bulk Actions bar should disappear

### Step 4: Test Bulk Delete
1. Select 2-3 posts you want to delete
2. In Bulk Actions bar:
   - Click **"More Actions"** dropdown
   - Click **"Delete Selected"**
3. **Expected Result:**
   - Confirmation dialog appears
   - Click "OK" to confirm
   - Toast notification: "Posts deleted"
   - Posts should disappear from table
   - Check Supabase → Table Editor → `posts` to verify deletion

## Test 2: Export/Import

### Step 1: Export All Posts to CSV
1. Go to `http://localhost:3000/dashboard/scheduler`
2. Click **"Export CSV"** button (top right of Posts card)
3. **Expected Result:**
   - File downloads: `posts-export-YYYY-MM-DD.csv`
   - Open the file - should contain all your posts

### Step 2: Export All Posts to JSON
1. Click **"Export JSON"** button
2. **Expected Result:**
   - File downloads: `posts-export-YYYY-MM-DD.json`
   - Open the file - should be formatted JSON with all posts

### Step 3: Export Selected Posts
1. Select 2-3 posts using checkboxes
2. In Bulk Actions bar:
   - Click **"More Actions"** → **"Export as CSV"** or **"Export as JSON"**
3. **Expected Result:**
   - File downloads with only selected posts
   - Verify the file contains only selected items

### Step 4: Export Campaigns
1. Go to `http://localhost:3000/dashboard/campaign`
2. Create a few test campaigns if needed
3. Click **"Export CSV"** or **"Export JSON"** buttons
4. **Expected Result:**
   - Campaigns export successfully

## Test 3: Templates

### Step 1: Run Templates Migration
1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/002_templates_schema.sql`
3. Copy all the SQL
4. Paste into SQL Editor and click **Run**
5. **Expected Result:**
   - Success message
   - Check Table Editor → `templates` table exists

### Step 2: Create a Post Template
1. Go to `http://localhost:3000/dashboard/scheduler`
2. Click **"New Post"** button
3. Fill out the form:
   - Platform: Select any (e.g., Twitter)
   - Content: Write something like "Check out our new product launch!"
   - Date & Time: Set any future date/time
   - (Optional) Add image URL or link URL
4. Click the **"Templates"** tab (4th tab)
5. Click **"Save Current as Template"** button
6. Fill in:
   - Template Name: "Product Launch Post"
   - Description: "Template for product announcements"
7. Click **"Save Template"**
8. **Expected Result:**
   - Toast: "Template saved"
   - Template appears in the template library
   - Check Supabase → Table Editor → `templates` to verify

### Step 3: Use a Template
1. Click **"New Post"** again (or close and reopen)
2. Click the **"Templates"** tab
3. You should see your saved template
4. Click **"Use Template"** button
5. **Expected Result:**
   - Toast: "Template loaded"
   - Form should be pre-filled with:
     - Content from template
     - Platform from template
     - Image/link URLs if they were saved
   - You can now edit and schedule the post

### Step 4: Search Templates
1. In Templates tab, type in the search box
2. **Expected Result:**
   - Templates filter as you type
   - Only matching templates show

### Step 5: Delete a Template
1. In Templates tab, find a template
2. Click the trash icon (🗑️) on the template card
3. Confirm deletion
4. **Expected Result:**
   - Toast: "Template deleted"
   - Template disappears from library
   - Verify in Supabase that it's deleted

### Step 6: Create Campaign Template
1. Go to `http://localhost:3000/dashboard/campaign`
2. Click **"New Campaign"** button
3. Fill out campaign form
4. (Note: Campaign templates integration coming - for now templates work for posts)

## Troubleshooting

### Bulk Actions Not Appearing
- **Check:** Are items actually selected? (Checkboxes should be checked)
- **Check:** Browser console for errors (F12)
- **Fix:** Refresh the page

### Export Not Working
- **Check:** Do you have posts/campaigns to export?
- **Check:** Browser console for errors
- **Check:** Network tab to see if API call succeeded
- **Fix:** Check API route is working: `http://localhost:3000/api/export`

### Templates Not Showing
- **Check:** Did you run the migration SQL?
- **Check:** Supabase → Table Editor → `templates` table exists
- **Check:** Browser console for errors
- **Fix:** Run the migration again if needed

### Template Not Loading Form
- **Check:** Template content structure matches form fields
- **Check:** Browser console for errors
- **Fix:** Try creating a new template with simpler data

## Quick Test Checklist

- [ ] Bulk select posts (individual checkboxes)
- [ ] Select all posts (header checkbox)
- [ ] Bulk update status
- [ ] Bulk delete posts
- [ ] Export all posts to CSV
- [ ] Export all posts to JSON
- [ ] Export selected posts
- [ ] Export campaigns
- [ ] Create post template
- [ ] Use post template
- [ ] Search templates
- [ ] Delete template

## Expected Behavior Summary

✅ **Bulk Operations:**
- Checkboxes work
- Bulk Actions bar appears when items selected
- Status updates work
- Bulk delete works with confirmation

✅ **Export:**
- CSV export downloads file
- JSON export downloads file
- Selected items export correctly
- Files contain correct data

✅ **Templates:**
- Can save current form as template
- Templates appear in library
- Can use template to fill form
- Can delete templates
- Search works

---

**Happy Testing!** 🚀

If you encounter any issues, check the browser console (F12) for error messages.


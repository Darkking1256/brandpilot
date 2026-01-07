# 🚀 Advanced Features Guide

All advanced features have been successfully implemented! Here's how to use them.

## ✅ Completed Features

### 1. Bulk Operations

**Features:**
- ✅ Select multiple posts/campaigns with checkboxes
- ✅ Bulk delete
- ✅ Bulk status updates
- ✅ Select all functionality

**How to Use:**
1. Go to **Dashboard → Scheduler** or **Dashboard → Campaigns**
2. Check the boxes next to items you want to select
3. Use the **Bulk Actions** bar that appears:
   - Select a status and click **Update** to change status of all selected items
   - Click **More Actions** → **Delete Selected** to bulk delete
   - Click **More Actions** → **Export as CSV/JSON** to export selected items

### 2. Export/Import

**Features:**
- ✅ Export all posts/campaigns to CSV
- ✅ Export all posts/campaigns to JSON
- ✅ Export selected items to CSV/JSON
- ✅ Import from JSON (CSV import coming soon)

**How to Export:**
1. **Export All:**
   - Go to **Scheduler** or **Campaigns** page
   - Click **Export CSV** or **Export JSON** button in the header
   - File will download automatically

2. **Export Selected:**
   - Select items using checkboxes
   - Click **More Actions** → **Export as CSV** or **Export as JSON**

**How to Import:**
1. Prepare a JSON file with your data (matching the schema)
2. Use the import API endpoint: `POST /api/import`
3. Format:
   ```json
   {
     "type": "posts", // or "campaigns"
     "data": [
       {
         "content": "Post content",
         "platform": "twitter",
         "scheduledDate": "2025-01-01",
         "scheduledTime": "10:00",
         "status": "draft"
       }
     ]
   }
   ```

### 3. Templates & Content Library

**Features:**
- ✅ Save posts as templates
- ✅ Save campaigns as templates
- ✅ Template library with search
- ✅ Quick insert templates into forms
- ✅ Delete templates

**How to Use Templates:**

1. **Save Current Post/Campaign as Template:**
   - Fill out your post/campaign form
   - Click the **Templates** tab
   - Click **Save Current as Template**
   - Enter a name and optional description
   - Click **Save Template**

2. **Use a Template:**
   - Click the **Templates** tab in the post/campaign form
   - Browse your saved templates
   - Click **Use Template** on any template
   - The form will be pre-filled with template data

3. **Manage Templates:**
   - Search templates using the search bar
   - Delete templates by clicking the trash icon
   - Templates are organized by type (post/campaign)

## Database Setup

### Run Templates Migration

To enable templates, run this SQL in your Supabase SQL Editor:

```sql
-- See: supabase/migrations/002_templates_schema.sql
```

Or copy the contents of `supabase/migrations/002_templates_schema.sql` and run it.

## API Endpoints

### Bulk Operations
- `POST /api/posts/bulk` - Bulk operations for posts
- `POST /api/campaigns/bulk` - Bulk operations for campaigns

**Actions:**
- `{ action: "delete", ids: [...] }`
- `{ action: "update", ids: [...], data: { status: "..." } }`

### Export/Import
- `POST /api/export` - Export data (CSV/JSON)
- `POST /api/import` - Import data (JSON)

### Templates
- `GET /api/templates?type=post` - Get templates
- `POST /api/templates` - Create template
- `DELETE /api/templates/[id]` - Delete template

## Usage Examples

### Bulk Delete Posts
1. Select multiple posts using checkboxes
2. Click **More Actions** → **Delete Selected**
3. Confirm deletion

### Bulk Status Update
1. Select multiple items
2. Choose status from dropdown (e.g., "Published")
3. Click **Update**
4. All selected items will be updated

### Export All Campaigns
1. Go to **Campaigns** page
2. Click **Export JSON** button
3. File downloads with all campaign data

### Create Post Template
1. Fill out post form with your content
2. Click **Templates** tab
3. Click **Save Current as Template**
4. Name it (e.g., "Product Launch")
5. Save

### Use Template
1. Open post creation form
2. Click **Templates** tab
3. Find your template
4. Click **Use Template**
5. Form is pre-filled - adjust as needed

## Tips & Best Practices

1. **Bulk Operations:**
   - Use "Select All" checkbox in table header to select all visible items
   - Bulk operations work on selected items only
   - Always confirm before bulk deleting

2. **Export/Import:**
   - Export regularly for backups
   - JSON format preserves all data types
   - CSV is better for spreadsheet editing

3. **Templates:**
   - Create templates for frequently used content
   - Use descriptive names and descriptions
   - Organize with tags (coming soon)
   - Delete unused templates to keep library clean

## Next Steps

After setting up templates migration:
1. ✅ Test bulk operations
2. ✅ Test export/import
3. ✅ Create some templates
4. 🔄 Consider implementing authentication (next feature)

---

**All advanced features are now live!** 🎉


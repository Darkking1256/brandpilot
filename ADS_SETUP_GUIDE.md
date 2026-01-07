# 💰 Ads Management Feature Guide

Your Ads Management feature is now fully functional! Here's how to set it up and use it.

## ✅ Features Implemented

- ✅ **Ad Campaign Creation** - Create and manage ad campaigns
- ✅ **Budget Management** - Set total budget and daily budget limits
- ✅ **Performance Tracking** - Track impressions, clicks, conversions, spend
- ✅ **Performance Metrics** - CTR, CPC, CPM, CPA, ROAS calculations
- ✅ **Multi-Platform Support** - Twitter, LinkedIn, Facebook, Instagram, TikTok, Google Ads
- ✅ **Ad Types** - Image, Video, Carousel, Story, Sponsored ads
- ✅ **Bid Strategies** - Lowest cost, cost cap, bid cap, target cost
- ✅ **Performance Charts** - Visual analytics for spend and performance
- ✅ **Filtering & Sorting** - Search, filter by status/platform, sort by various metrics

## Setup Steps

### Step 1: Run Database Migration

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy contents of `supabase/migrations/005_ads_schema.sql`
4. Paste and run it

This creates:
- `ads` table with all ad campaign fields
- Performance metrics columns (impressions, clicks, conversions, spend, CTR, CPC, CPM, CPA, ROAS)
- Indexes for better query performance

### Step 2: Verify Setup

1. **Check Tables:**
   - Go to **Database** → **Tables**
   - You should see `ads` table

2. **Test Ads Page:**
   - Navigate to: `http://localhost:3000/dashboard/ads`
   - Click "Create Ad" button
   - Fill out the form and create your first ad

## How to Use

### Creating an Ad Campaign

1. **Navigate to Ads Page:**
   - Go to: `http://localhost:3000/dashboard/ads`
   - Click "Create Ad" button

2. **Fill Out Ad Details:**
   - **Ad Name**: Give your campaign a name
   - **Platform**: Select where to run the ad (Twitter, LinkedIn, Facebook, etc.)
   - **Ad Type**: Choose image, video, carousel, story, or sponsored
   - **Objective**: Select awareness, traffic, engagement, conversions, leads, or sales
   - **Budget**: Set total budget (required)
   - **Daily Budget**: Set daily spending limit (optional)
   - **Bid Strategy**: Choose how to bid (optional)
   - **Dates**: Set start and end dates
   - **Creative**: Add creative URL and landing page URL

3. **Save Ad:**
   - Click "Create Ad" button
   - Ad is saved as "draft" by default
   - Change status to "active" to start running

### Managing Ads

1. **View All Ads:**
   - See all ads in the table
   - View performance metrics for each ad

2. **Filter Ads:**
   - **Search**: Search by ad name or description
   - **Status Filter**: Filter by draft, active, paused, completed, archived
   - **Platform Filter**: Filter by platform
   - **Sort**: Sort by date, name, budget, or spend

3. **Edit Ad:**
   - Click the three dots menu on any ad
   - Select "Edit"
   - Update ad details
   - Change status (e.g., pause, activate)

4. **Delete Ad:**
   - Click the three dots menu
   - Select "Delete"
   - Confirm deletion

5. **Duplicate Ad:**
   - Click the three dots menu
   - Select "Duplicate"
   - Creates a copy with "(Copy)" suffix

### Tracking Performance

1. **View Stats Cards:**
   - **Total Spend**: See total amount spent across all ads
   - **Impressions**: Total ad views
   - **CTR**: Average click-through rate
   - **Active Ads**: Number of currently running ads

2. **Performance Charts:**
   - **Spend Over Time**: Visualize spending trends
   - **Performance Trends**: See impressions and clicks over time

3. **Individual Ad Metrics:**
   - View in the ads table:
     - Impressions
     - Clicks
     - CTR (Click-through rate)
     - CPC (Cost per click)
     - Budget vs Spend
     - Status

### Updating Performance Metrics

Performance metrics can be updated manually or via API:

1. **Manual Update:**
   - Edit the ad
   - Update impressions, clicks, conversions, or spend
   - System automatically calculates:
     - CTR (Click-through rate)
     - CPC (Cost per click)
     - CPM (Cost per 1000 impressions)
     - CPA (Cost per acquisition)

2. **API Update:**
   - Use `PUT /api/ads/[id]` endpoint
   - Send updated metrics
   - System calculates derived metrics automatically

## API Endpoints

### GET `/api/ads`
- Fetches all ads
- Query params: `status`, `platform`
- Returns: `{ ads: [...] }`

### GET `/api/ads/[id]`
- Fetches a single ad
- Returns: `{ ad: {...} }`

### POST `/api/ads`
- Creates a new ad
- Body: Ad data (name, platform, ad_type, objective, budget, etc.)
- Returns: `{ ad: {...} }`

### PUT `/api/ads/[id]`
- Updates an ad
- Body: Partial ad data
- Automatically calculates performance metrics
- Returns: `{ ad: {...} }`

### DELETE `/api/ads/[id]`
- Deletes an ad
- Returns: `{ message: "Ad deleted successfully" }`

## Database Schema

### ads table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- name (TEXT, Required)
- description (TEXT)
- platform (TEXT, Required)
- ad_type (TEXT, Required)
- objective (TEXT, Required)
- budget (DECIMAL, Required)
- daily_budget (DECIMAL)
- bid_strategy (TEXT)
- target_audience (JSONB)
- creative_url (TEXT)
- creative_type (TEXT)
- landing_page_url (TEXT)
- start_date (DATE, Required)
- end_date (DATE)
- status (TEXT, Default: 'draft')
- Performance metrics:
  - impressions (INTEGER, Default: 0)
  - clicks (INTEGER, Default: 0)
  - conversions (INTEGER, Default: 0)
  - spend (DECIMAL, Default: 0)
  - ctr (DECIMAL, Calculated)
  - cpc (DECIMAL, Calculated)
  - cpm (DECIMAL, Calculated)
  - cpa (DECIMAL, Calculated)
  - roas (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Performance Metrics Explained

### CTR (Click-Through Rate)
- Formula: `(clicks / impressions) * 100`
- Percentage of impressions that resulted in clicks
- Higher is better

### CPC (Cost Per Click)
- Formula: `spend / clicks`
- Average cost for each click
- Lower is better

### CPM (Cost Per 1000 Impressions)
- Formula: `(spend / impressions) * 1000`
- Cost to reach 1000 people
- Lower is better

### CPA (Cost Per Acquisition)
- Formula: `spend / conversions`
- Cost for each conversion
- Lower is better

### ROAS (Return on Ad Spend)
- Formula: `revenue / spend`
- Revenue generated per dollar spent
- Higher is better (requires revenue tracking)

## Example Workflow

### Example 1: Create Facebook Ad
1. Click "Create Ad"
2. Name: "Summer Sale 2024"
3. Platform: Facebook
4. Type: Image
5. Objective: Conversions
6. Budget: $1000
7. Daily Budget: $50
8. Start Date: Today
9. End Date: 30 days from now
10. Creative URL: Link to ad image
11. Landing Page: Link to product page
12. Click "Create Ad"
13. Change status to "Active"

### Example 2: Track Performance
1. View ads table
2. See impressions: 10,000
3. See clicks: 250
4. See CTR: 2.5%
5. See spend: $150
6. See CPC: $0.60
7. See budget usage: 15% ($150 of $1000)

### Example 3: Update Metrics
1. Edit ad
2. Update impressions: 15,000
3. Update clicks: 400
4. Update spend: $200
5. System automatically calculates:
   - CTR: 2.67%
   - CPC: $0.50
   - CPM: $13.33

## Tips for Best Results

1. **Set Realistic Budgets**: Start with smaller budgets to test
2. **Use Daily Budgets**: Prevent overspending with daily limits
3. **Track Performance**: Regularly update metrics for accurate insights
4. **Test Different Ad Types**: Try image vs video to see what works
5. **Monitor CTR**: Low CTR may indicate targeting or creative issues
6. **Optimize CPC**: Lower CPC means better ad efficiency
7. **Use Bid Strategies**: Choose strategy based on your objective

## Troubleshooting

### Ads Not Showing
- **Check**: Database migration ran successfully
- **Check**: API routes are working
- **Fix**: Refresh page and check browser console

### Performance Metrics Not Calculating
- **Check**: Impressions, clicks, and spend are set
- **Note**: Metrics calculate automatically when base values are updated
- **Fix**: Update ad with new metric values

### Budget Not Updating
- **Check**: Budget field is a positive number
- **Check**: Daily budget is less than total budget
- **Fix**: Edit ad and update budget values

---

**Ads Management is now live!** 🎉

Create, manage, and track your ad campaigns! ✨


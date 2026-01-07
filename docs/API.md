# MarketPilot AI - API Documentation

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

Most API endpoints require authentication. Include the session cookie in requests, or use the Supabase client for authenticated requests.

---

## Table of Contents

1. [Posts API](#posts-api)
2. [Campaigns API](#campaigns-api)
3. [Ads API](#ads-api)
4. [Templates API](#templates-api)
5. [Analytics API](#analytics-api)
6. [Platform Connections API](#platform-connections-api)
7. [Media API](#media-api)
8. [Teams API](#teams-api)
9. [User API](#user-api)
10. [Export API](#export-api)
11. [Search API](#search-api)

---

## Posts API

### Get All Posts

```http
GET /api/posts
```

**Response:**
```json
[
  {
    "id": "uuid",
    "content": "Post content",
    "platform": "twitter",
    "status": "scheduled",
    "scheduledDate": "2024-01-15",
    "scheduledTime": "10:00",
    "imageUrl": "https://...",
    "linkUrl": "https://...",
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-10T10:00:00Z"
  }
]
```

### Get Single Post

```http
GET /api/posts/:id
```

### Create Post

```http
POST /api/posts
Content-Type: application/json

{
  "content": "Post content",
  "platform": "twitter",
  "scheduledDate": "2024-01-15",
  "scheduledTime": "10:00",
  "imageUrl": "https://...",
  "linkUrl": "https://..."
}
```

### Update Post

```http
PUT /api/posts/:id
Content-Type: application/json

{
  "content": "Updated content",
  "status": "scheduled"
}
```

### Delete Post

```http
DELETE /api/posts/:id
```

### Bulk Delete Posts

```http
POST /api/posts/bulk-delete
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

### Bulk Update Status

```http
POST /api/posts/bulk-update-status
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2"],
  "status": "published"
}
```

### Save Draft

```http
POST /api/posts/draft
Content-Type: application/json

{
  "draftData": {
    "content": "Draft content",
    "platform": "twitter"
  },
  "postId": "uuid" // optional, for updating existing draft
}
```

### Get Draft

```http
GET /api/posts/draft/:id
```

### Approve Post

```http
POST /api/posts/:id/approve
Content-Type: application/json

{
  "comment": "Approved, looks good!"
}
```

### Reject Post

```http
POST /api/posts/:id/reject
Content-Type: application/json

{
  "comment": "Needs revision"
}
```

### Request Review

```http
POST /api/posts/:id/request-review
Content-Type: application/json

{
  "comment": "Ready for review"
}
```

---

## Campaigns API

### Get All Campaigns

```http
GET /api/campaigns
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Campaign Name",
    "description": "Campaign description",
    "status": "active",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "budget": 1000,
    "spent": 500,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Get Single Campaign

```http
GET /api/campaigns/:id
```

### Create Campaign

```http
POST /api/campaigns
Content-Type: application/json

{
  "name": "Campaign Name",
  "description": "Description",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "budget": 1000
}
```

### Update Campaign

```http
PUT /api/campaigns/:id
Content-Type: application/json

{
  "status": "paused"
}
```

### Delete Campaign

```http
DELETE /api/campaigns/:id
```

---

## Ads API

### Get All Ads

```http
GET /api/ads
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Ad Title",
    "description": "Ad description",
    "platform": "facebook",
    "status": "active",
    "budget": 500,
    "spent": 250,
    "impressions": 10000,
    "clicks": 500,
    "ctr": 5.0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Get Single Ad

```http
GET /api/ads/:id
```

### Create Ad

```http
POST /api/ads
Content-Type: application/json

{
  "title": "Ad Title",
  "description": "Description",
  "platform": "facebook",
  "budget": 500,
  "targeting": {},
  "creative": {}
}
```

### Update Ad

```http
PUT /api/ads/:id
Content-Type: application/json

{
  "status": "paused"
}
```

### Delete Ad

```http
DELETE /api/ads/:id
```

---

## Templates API

### Get All Templates

```http
GET /api/templates
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Template Name",
    "content": "Template content",
    "platform": "twitter",
    "category": "promotional",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Get Single Template

```http
GET /api/templates/:id
```

### Create Template

```http
POST /api/templates
Content-Type: application/json

{
  "name": "Template Name",
  "content": "Template content",
  "platform": "twitter",
  "category": "promotional"
}
```

### Update Template

```http
PUT /api/templates/:id
Content-Type: application/json

{
  "content": "Updated content"
}
```

### Delete Template

```http
DELETE /api/templates/:id
```

---

## Analytics API

### Get Analytics Overview

```http
GET /api/analytics/overview?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "totalPosts": 100,
  "publishedPosts": 80,
  "totalEngagement": 5000,
  "totalReach": 50000,
  "engagementRate": 10.0
}
```

### Get Post Metrics

```http
GET /api/analytics/post-metrics?postIds=uuid1,uuid2&startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
[
  {
    "postId": "uuid",
    "impressions": 1000,
    "likes": 50,
    "comments": 10,
    "shares": 5,
    "clicks": 100
  }
]
```

### Get Hashtag Performance

```http
GET /api/analytics/hashtags?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
[
  {
    "hashtag": "#marketing",
    "usageCount": 20,
    "totalEngagement": 500,
    "avgEngagement": 25.0
  }
]
```

### Get Best Times to Post

```http
GET /api/analytics/best-times?platform=twitter&startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "platform": "twitter",
  "bestDays": ["Monday", "Wednesday", "Friday"],
  "bestHours": [9, 10, 14, 15],
  "heatmap": {
    "Monday": { "9": 100, "10": 120, ... },
    ...
  }
}
```

### Export Analytics PDF

```http
POST /api/analytics/export-pdf
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "includeCharts": true
}
```

**Response:** PDF file download

---

## Platform Connections API

### Get Platform Connections

```http
GET /api/platforms
```

**Response:**
```json
[
  {
    "id": "uuid",
    "platform": "twitter",
    "platform_username": "@username",
    "is_active": true,
    "connected_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Platform Status

```http
GET /api/platforms/status
```

**Response:**
```json
{
  "twitter": {
    "configured": true,
    "connected": true,
    "missingVars": []
  },
  "linkedin": {
    "configured": false,
    "connected": false,
    "missingVars": ["CLIENT_ID", "CLIENT_SECRET"]
  }
}
```

### Initiate OAuth

```http
GET /api/platforms/oauth/:platform
```

**Response:** Redirects to platform OAuth page

### OAuth Callback

```http
GET /api/platforms/oauth/:platform/callback?code=authorization_code
```

**Response:** Redirects back to dashboard

### Test Connection

```http
POST /api/platforms/test
Content-Type: application/json

{
  "platform": "twitter"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connection successful"
}
```

---

## Media API

### Get Media Assets

```http
GET /api/media
```

**Query Parameters:**
- `search`: Search term
- `type`: File type filter (image, video)
- `tags`: Comma-separated tags

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "image.jpg",
    "url": "https://...",
    "type": "image",
    "size": 1024000,
    "tags": ["social", "promo"],
    "uploadedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Upload Media

```http
POST /api/media/upload
Content-Type: multipart/form-data

file: [file]
tags: "tag1,tag2"
```

**Response:**
```json
{
  "id": "uuid",
  "url": "https://...",
  "name": "image.jpg"
}
```

### Delete Media

```http
DELETE /api/media/:id
```

---

## Teams API

### Get Teams

```http
GET /api/teams
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Team Name",
    "description": "Description",
    "memberCount": 5,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Create Team

```http
POST /api/teams
Content-Type: application/json

{
  "name": "Team Name",
  "description": "Description"
}
```

### Get Team Members

```http
GET /api/teams/:id/members
```

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "user-uuid",
    "role": "admin",
    "joinedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Add Team Member

```http
POST /api/teams/:id/members
Content-Type: application/json

{
  "email": "user@example.com",
  "role": "editor"
}
```

### Update Team Member Role

```http
PUT /api/teams/:id/members/:memberId
Content-Type: application/json

{
  "role": "viewer"
}
```

### Remove Team Member

```http
DELETE /api/teams/:id/members/:memberId
```

### Get Team Activity

```http
GET /api/teams/:id/activity?limit=50&offset=0
```

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "post_created",
    "userId": "user-uuid",
    "description": "User created a post",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

## User API

### Get User Profile

```http
GET /api/user/profile
```

**Response:**
```json
{
  "id": "uuid",
  "name": "User Name",
  "email": "user@example.com",
  "avatar": "https://...",
  "bio": "Bio text"
}
```

### Update User Profile

```http
PUT /api/user/profile
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "Updated bio"
}
```

### Get User Preferences

```http
GET /api/user/preferences
```

**Response:**
```json
{
  "emailNotifications": true,
  "inAppNotifications": true,
  "notificationTypes": {
    "postPublished": true,
    "campaignMilestone": true
  }
}
```

### Update User Preferences

```http
PUT /api/user/preferences
Content-Type: application/json

{
  "emailNotifications": false,
  "notificationTypes": {
    "postPublished": true
  }
}
```

### Change Password

```http
POST /api/user/password
Content-Type: application/json

{
  "currentPassword": "current",
  "newPassword": "newpassword"
}
```

---

## Export API

### Enhanced Export

```http
POST /api/export/enhanced
Content-Type: application/json

{
  "type": "posts",
  "format": "csv",
  "includeImages": true,
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "filters": {
    "platform": ["twitter", "linkedin"],
    "status": ["published"]
  }
}
```

**Response:** File download

### Get Scheduled Exports

```http
GET /api/exports/scheduled
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Weekly Report",
    "type": "posts",
    "format": "pdf",
    "frequency": "weekly",
    "nextRun": "2024-01-15T00:00:00Z",
    "enabled": true
  }
]
```

### Create Scheduled Export

```http
POST /api/exports/scheduled
Content-Type: application/json

{
  "name": "Weekly Report",
  "type": "posts",
  "format": "pdf",
  "frequency": "weekly",
  "dayOfWeek": 1,
  "time": "09:00"
}
```

### Update Scheduled Export

```http
PUT /api/exports/scheduled/:id
Content-Type: application/json

{
  "enabled": false
}
```

### Delete Scheduled Export

```http
DELETE /api/exports/scheduled/:id
```

---

## Search API

### Global Search

```http
GET /api/search?q=search+term&type=posts&limit=20
```

**Query Parameters:**
- `q`: Search query
- `type`: Content type (posts, campaigns, templates, all)
- `limit`: Results limit

**Response:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "content": "Post content...",
      "platform": "twitter"
    }
  ],
  "campaigns": [],
  "templates": []
}
```

### Get Search History

```http
GET /api/search/history
```

**Response:**
```json
[
  {
    "query": "marketing",
    "searchedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Save Search History

```http
POST /api/search/history
Content-Type: application/json

{
  "query": "marketing"
}
```

---

## Error Responses

All API endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

API requests are rate-limited to prevent abuse. Rate limits:

- **Standard**: 100 requests per minute
- **Bulk Operations**: 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Webhooks (Future)

Webhook support for real-time notifications is planned for future releases.

---

*Last Updated: 2024*


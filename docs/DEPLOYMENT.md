# Deployment Guide

This guide covers deploying MarketPilot AI to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Deploying to Vercel](#deploying-to-vercel)
5. [Deploying to Other Platforms](#deploying-to-other-platforms)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- GitHub account (for Vercel deployment)
- Domain name (optional but recommended)

---

## Environment Setup

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Note your project URL and anon key
3. Enable the following Supabase features:
   - Authentication
   - Storage (for media library)
   - Realtime (for live updates)

### 2. Environment Variables

Create a `.env.local` file (for local development) or set environment variables in your hosting platform:

#### Required Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### Optional Variables

```env
# AI Features
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key

# Platform OAuth (or configure in admin panel)
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Encryption (auto-generated if not provided)
ENCRYPTION_KEY=your_32_byte_encryption_key

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Generate Encryption Key (Optional)

If you want to use a custom encryption key for OAuth credentials:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and set it as `ENCRYPTION_KEY`.

---

## Database Setup

### 1. Run Migrations

Run all database migrations in order:

1. Connect to your Supabase project
2. Go to SQL Editor
3. Run each migration file in order:
   - `001_initial_schema.sql`
   - `002_templates_schema.sql`
   - `003_enable_realtime.sql`
   - `004_user_profiles_and_preferences.sql`
   - `005_ads_schema.sql`
   - `006_platform_connections.sql`
   - `007_add_platform_post_fields.sql`
   - `008_add_youtube_to_posts.sql`
   - `009_oauth_app_credentials.sql`
   - `010_content_features.sql`
   - `011_analytics_metrics.sql`

### 2. Enable Storage Buckets

Create storage buckets for media assets:

1. Go to Storage in Supabase dashboard
2. Create a bucket named `media-assets`
3. Set it to public (or configure RLS policies)
4. Enable file uploads

### 3. Configure Row Level Security (RLS)

Ensure RLS policies are set up correctly:

- Users can only access their own data
- Team members can access shared team data
- Admins have full access

### 4. Enable Realtime

Realtime is enabled via migration `003_enable_realtime.sql`. Verify it's enabled:

1. Go to Database → Replication in Supabase
2. Ensure tables are set to replicate:
   - `posts`
   - `campaigns`
   - `notifications`
   - `team_activities`

---

## Deploying to Vercel

### 1. Connect Repository

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository

### 2. Configure Project

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (default)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)

### 3. Set Environment Variables

Add all environment variables in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add all required and optional variables
3. Set them for Production, Preview, and Development environments

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `your-project.vercel.app`

### 5. Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

### 6. Configure Cron Jobs

For scheduled post publishing, configure Vercel cron:

1. Create `vercel.json` in project root (already included)
2. Vercel will automatically detect and configure cron jobs
3. The cron job runs every minute to check for scheduled posts

---

## Deploying to Other Platforms

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t marketpilot-ai .
docker run -p 3000:3000 --env-file .env.local marketpilot-ai
```

### Railway

1. Connect your GitHub repository
2. Railway will auto-detect Next.js
3. Add environment variables
4. Deploy

### Render

1. Create a new Web Service
2. Connect your repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

### Self-Hosted (VPS)

1. SSH into your server
2. Install Node.js 18+
3. Clone repository
4. Install dependencies: `npm install`
5. Build: `npm run build`
6. Set up PM2 or similar process manager
7. Configure reverse proxy (Nginx)
8. Set up SSL certificate (Let's Encrypt)
9. Configure cron jobs for scheduled tasks

---

## Post-Deployment

### 1. Verify Deployment

1. Visit your deployed URL
2. Test authentication
3. Test creating a post
4. Verify platform connections work
5. Check real-time updates

### 2. Configure OAuth Credentials

1. Log in as admin
2. Go to **Admin** → **OAuth Credentials**
3. Add OAuth credentials for each platform
4. Test platform connections

### 3. Set Up Scheduled Tasks

For platforms that don't support Vercel cron:

1. Use a cron service (e.g., cron-job.org)
2. Set up a job to call `/api/scheduler/check-posts` every minute
3. Set up a job to call `/api/scheduler/retry-failed` every hour

### 4. Configure Email (Optional)

If using email notifications:

1. Set up SMTP server
2. Configure email service (SendGrid, Mailgun, etc.)
3. Add email credentials to environment variables

### 5. Set Up Monitoring

1. Configure error tracking (Sentry, etc.)
2. Set up uptime monitoring
3. Configure log aggregation
4. Set up performance monitoring

---

## Monitoring & Maintenance

### Regular Tasks

1. **Weekly**:
   - Review error logs
   - Check platform connection status
   - Monitor scheduled posts

2. **Monthly**:
   - Review analytics
   - Update dependencies
   - Backup database
   - Review security settings

3. **Quarterly**:
   - Security audit
   - Performance optimization
   - Feature updates

### Database Backups

Supabase provides automatic backups. For manual backups:

1. Go to Supabase dashboard
2. Database → Backups
3. Download backup or configure automatic backups

### Updating Dependencies

```bash
npm update
npm audit fix
```

Test thoroughly before deploying updates.

### Scaling

For high traffic:

1. **Database**: Upgrade Supabase plan
2. **CDN**: Use Vercel Edge Network
3. **Caching**: Implement Redis caching
4. **Load Balancing**: Use multiple instances

---

## Troubleshooting

### Build Failures

1. Check Node.js version (18+)
2. Verify all dependencies are installed
3. Check environment variables are set
4. Review build logs for errors

### Runtime Errors

1. Check environment variables
2. Verify database connection
3. Check Supabase project status
4. Review application logs

### Platform Connection Issues

1. Verify OAuth credentials are correct
2. Check redirect URIs match
3. Verify platform API status
4. Check token expiration

### Scheduled Posts Not Publishing

1. Verify cron job is running
2. Check `/api/scheduler/check-posts` endpoint
3. Review post status in database
4. Check platform connection status

---

## Security Checklist

- [ ] Environment variables are secure
- [ ] Encryption key is set
- [ ] RLS policies are configured
- [ ] HTTPS is enabled
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] OAuth credentials are encrypted
- [ ] Regular security updates
- [ ] Backup strategy in place

---

## Support

For deployment issues:

1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review [API Documentation](./API.md)
3. Check GitHub Issues
4. Contact support

---

*Last Updated: 2024*


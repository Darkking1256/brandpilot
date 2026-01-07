# MarketPilot AI - Production Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Set `NODE_ENV=production`
- [ ] Configure production Supabase URL and keys
- [ ] Set up Stripe production keys
- [ ] Configure all OAuth credentials
- [ ] Generate secure `ENCRYPTION_KEY` (32-char hex)
- [ ] Set `CRON_SECRET` for secure cron jobs

### 2. Supabase Configuration
- [ ] Create production Supabase project
- [ ] Run all migrations in order (001-021)
- [ ] Enable Row Level Security on all tables
- [ ] Configure email templates
- [ ] Set up email confirmation redirect URLs
- [ ] Enable required auth providers

### 3. Stripe Configuration
- [ ] Create products and prices in Stripe dashboard
- [ ] Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
- [ ] Configure webhook events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

### 4. Social Media Apps
- [ ] Register Twitter app at developer.twitter.com
- [ ] Register LinkedIn app at linkedin.com/developers
- [ ] Register Facebook app at developers.facebook.com
- [ ] Register TikTok app at developers.tiktok.com
- [ ] Register Google app at console.developers.google.com
- [ ] Submit apps for review (may take 1-4 weeks)

### 5. Security
- [ ] Remove `NEXT_PUBLIC_DISABLE_AUTH` from production env
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Review CSP headers
- [ ] Set up rate limiting
- [ ] Enable audit logging

### 6. Monitoring & Analytics
- [ ] Set up Sentry for error tracking
- [ ] Configure Google Analytics or Mixpanel
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation

## Deployment Steps

### Vercel Deployment

1. **Connect Repository**
   ```bash
   # Push code to GitHub/GitLab/Bitbucket
   git push origin main
   ```

2. **Create Vercel Project**
   - Go to vercel.com
   - Import your repository
   - Configure environment variables

3. **Configure Domain**
   - Add custom domain in Vercel dashboard
   - Update DNS records
   - Enable HTTPS (automatic)

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Post-Deployment

1. **Verify**
   - [ ] Test authentication flow
   - [ ] Test Stripe checkout
   - [ ] Test OAuth connections
   - [ ] Test cron job execution
   - [ ] Test AI content generation

2. **Monitor**
   - [ ] Check error logs
   - [ ] Monitor API response times
   - [ ] Track user signups
   - [ ] Monitor subscription conversions

## Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `OPENAI_API_KEY` | Recommended | OpenAI API key |
| `GROQ_API_KEY` | Recommended | Groq API key |
| `ENCRYPTION_KEY` | Yes | 32-char hex for token encryption |
| `CRON_SECRET` | Yes | Secret for cron authentication |
| `TWITTER_CLIENT_ID` | Optional | Twitter OAuth client ID |
| `TWITTER_CLIENT_SECRET` | Optional | Twitter OAuth client secret |
| `LINKEDIN_CLIENT_ID` | Optional | LinkedIn OAuth client ID |
| `LINKEDIN_CLIENT_SECRET` | Optional | LinkedIn OAuth client secret |
| `FACEBOOK_APP_ID` | Optional | Facebook app ID |
| `FACEBOOK_APP_SECRET` | Optional | Facebook app secret |
| `TIKTOK_CLIENT_KEY` | Optional | TikTok client key |
| `TIKTOK_CLIENT_SECRET` | Optional | TikTok client secret |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Sentry DSN for error tracking |

## Support

For deployment assistance, contact support@marketpilotai.com


# MarketPilot AI

AI-powered marketing automation and social media management platform built with Next.js 14, Supabase, and TypeScript.

## Features

- 🔐 **Authentication** - Secure user authentication with Supabase Auth
- 📅 **Content Scheduler** - Schedule and manage social media posts
- 📊 **Campaign Management** - Create and track marketing campaigns
- 📱 **Ads Management** - Manage advertising campaigns across platforms
- ✨ **AI Content Repurposing** - Use AI to repurpose content for different platforms
- 💳 **Stripe Integration** - Payment processing ready
- 🎨 **Modern UI** - Built with Radix UI and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod
- **Payments**: Stripe
- **AI**: OpenAI SDK, Groq SDK

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account (for database and authentication)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd market-pilot-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── ui/               # UI components (Radix UI)
├── lib/                   # Library code
│   ├── ai/               # AI integrations
│   ├── oauth/            # OAuth handlers
│   ├── platforms/        # Platform integrations
│   ├── stripe/           # Stripe integration
│   └── supabase/         # Supabase client setup
├── hooks/                # React hooks
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── supabase/             # Supabase migrations
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_SITE_URL` - Your site URL (for redirects)

Optional (for future features):

- `OPENAI_API_KEY` - OpenAI API key for AI features
- `GROQ_API_KEY` - Groq API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Features Documentation](./docs/FEATURES.md)** - Complete feature reference
- **[Getting Started Guide](./docs/GETTING_STARTED.md)** - Step-by-step user guide
- **[API Documentation](./docs/API.md)** - API reference and endpoints
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Troubleshooting Guide](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

## Key Features

### Content Management
- ✅ Multi-platform scheduling (Twitter, LinkedIn, Facebook, Instagram, TikTok, YouTube)
- ✅ AI-powered content generation and optimization
- ✅ Content templates and library
- ✅ Draft autosave with version history
- ✅ Post preview and validation
- ✅ Media library with cloud storage

### Campaign & Ads
- ✅ Campaign management with budget tracking
- ✅ Ads management with performance metrics
- ✅ A/B testing capabilities
- ✅ ROI calculations

### Analytics
- ✅ Comprehensive analytics dashboard
- ✅ Post performance comparison
- ✅ Best time to post analysis
- ✅ Hashtag performance tracking
- ✅ Competitor analysis
- ✅ Custom date ranges and exports

### Collaboration
- ✅ Team management with roles and permissions
- ✅ Content approval workflow
- ✅ Team activity feed
- ✅ Shared templates and assets

### Platform Integrations
- ✅ OAuth 2.0 one-click platform connections
- ✅ Auto-publish scheduled posts
- ✅ Retry logic for failed posts
- ✅ Real-time status updates

### Advanced Features
- ✅ Content calendar with drag-and-drop
- ✅ Bulk operations (delete, update, export)
- ✅ Advanced filtering and search
- ✅ Scheduled exports (CSV, JSON, PDF, Excel)
- ✅ Global search with history
- ✅ Real-time updates via WebSocket
- ✅ Mobile-responsive design
- ✅ Keyboard shortcuts
- ✅ Dark mode support

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_SITE_URL` - Your site URL (for redirects)

### Optional (for AI features)
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `GROQ_API_KEY` - Groq API key

### Optional (for platform integrations)
- `TWITTER_CLIENT_ID` - Twitter OAuth client ID (or configure in admin panel)
- `TWITTER_CLIENT_SECRET` - Twitter OAuth client secret (or configure in admin panel)
- `LINKEDIN_CLIENT_ID` - LinkedIn OAuth client ID
- `LINKEDIN_CLIENT_SECRET` - LinkedIn OAuth client secret
- `FACEBOOK_CLIENT_ID` - Facebook OAuth client ID
- `FACEBOOK_CLIENT_SECRET` - Facebook OAuth client secret
- `YOUTUBE_CLIENT_ID` - YouTube OAuth client ID
- `YOUTUBE_CLIENT_SECRET` - YouTube OAuth client secret
- `TIKTOK_CLIENT_KEY` - TikTok OAuth client key
- `TIKTOK_CLIENT_SECRET` - TikTok OAuth client secret

### Optional (for encryption)
- `ENCRYPTION_KEY` - 32-byte key for encrypting OAuth credentials (auto-generated if not provided)

### Optional (for payments)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Database Setup

Run the Supabase migrations in order:

1. `supabase/migrations/001_initial_schema.sql` - Initial database schema
2. `supabase/migrations/002_templates_schema.sql` - Templates table
3. `supabase/migrations/003_enable_realtime.sql` - Enable Realtime
4. `supabase/migrations/004_user_profiles_and_preferences.sql` - User profiles
5. `supabase/migrations/005_ads_schema.sql` - Ads management
6. `supabase/migrations/006_platform_connections.sql` - Platform connections
7. `supabase/migrations/007_add_platform_post_fields.sql` - Platform post fields
8. `supabase/migrations/008_add_youtube_to_posts.sql` - YouTube support
9. `supabase/migrations/009_oauth_app_credentials.sql` - OAuth credentials
10. `supabase/migrations/010_content_features.sql` - Content features
11. `supabase/migrations/011_analytics_metrics.sql` - Analytics metrics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT


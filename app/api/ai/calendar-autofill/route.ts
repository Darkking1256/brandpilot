export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { generateCalendarContent, CalendarAutoFillOptions } from '@/lib/ai'
import { createClient } from '@supabase/supabase-js'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Check if user has Pro subscription or higher
async function checkProSubscription(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    // In demo mode, allow access
    return true
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .single()

  if (!subscription) return false
  
  const isPro = subscription.tier === 'pro' || subscription.tier === 'enterprise'
  const isActive = subscription.status === 'active' || subscription.status === 'trialing'
  
  return isPro && isActive
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!isSupabaseConfigured()) {
      // Demo mode - return sample data
      return NextResponse.json({
        ideas: generateDemoContent()
      })
    }

    const { user, error: authError } = await requireAuth()
    if (authError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check Pro subscription
    const hasProAccess = await checkProSubscription(user.id)
    if (!hasProAccess) {
      return NextResponse.json(
        { 
          error: 'Pro subscription required',
          message: 'AI Calendar Auto-Fill is a Pro feature. Upgrade your subscription to access this feature.'
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { industry, niche, platforms, postsPerWeek, tone } = body as CalendarAutoFillOptions

    if (!industry || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Industry and at least one platform are required' },
        { status: 400 }
      )
    }

    // Generate content ideas
    const ideas = await generateCalendarContent({
      industry,
      niche,
      platforms,
      postsPerWeek: postsPerWeek || 3,
      tone: tone || 'professional',
      startDate: new Date(),
    })

    return NextResponse.json({ ideas })
  } catch (error) {
    console.error('Calendar auto-fill error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content ideas' },
      { status: 500 }
    )
  }
}

// Demo content for when Supabase is not configured
function generateDemoContent() {
  const startDate = new Date()
  const demoIdeas = [
    {
      title: "Industry Insights Monday",
      content: "Starting the week with key insights about what's trending in your industry. Here's what we're watching this week... #IndustryInsights #MondayMotivation",
      platform: "linkedin",
      suggestedDate: getDateOffset(startDate, 1),
      suggestedTime: "09:00",
      hashtags: ["#IndustryInsights", "#MondayMotivation"],
      contentType: "text"
    },
    {
      title: "Tutorial Tuesday",
      content: "Quick tip! Here's how to solve a common problem your audience faces. Save this for later! 💡 #TipsAndTricks #Tutorial",
      platform: "instagram",
      suggestedDate: getDateOffset(startDate, 2),
      suggestedTime: "11:00",
      hashtags: ["#TipsAndTricks", "#Tutorial"],
      contentType: "carousel"
    },
    {
      title: "Behind the Scenes",
      content: "Take a peek behind the curtain! Here's what goes into making our products/services... #BehindTheScenes #Authentic",
      platform: "tiktok",
      suggestedDate: getDateOffset(startDate, 3),
      suggestedTime: "19:00",
      hashtags: ["#BehindTheScenes", "#Authentic"],
      contentType: "video"
    },
    {
      title: "Customer Success Story",
      content: "We love hearing from our customers! Here's an amazing success story that made our week... #CustomerSuccess #Testimonial",
      platform: "facebook",
      suggestedDate: getDateOffset(startDate, 4),
      suggestedTime: "13:00",
      hashtags: ["#CustomerSuccess", "#Testimonial"],
      contentType: "image"
    },
    {
      title: "Weekend Engagement",
      content: "Happy Friday! Quick question for our community: What's the biggest challenge you face in [industry]? Let us know in the replies! 👇",
      platform: "twitter",
      suggestedDate: getDateOffset(startDate, 5),
      suggestedTime: "12:00",
      hashtags: ["#FridayVibes", "#Community"],
      contentType: "text"
    },
    {
      title: "Educational Content",
      content: "📚 5 things every [industry professional] should know in 2025. Number 3 might surprise you! #Education #Learning",
      platform: "youtube",
      suggestedDate: getDateOffset(startDate, 7),
      suggestedTime: "14:00",
      hashtags: ["#Education", "#Learning"],
      contentType: "video"
    },
    {
      title: "Product Feature Spotlight",
      content: "Did you know our [product/service] can do this? Here's a feature that saves our customers hours every week! ⏱️",
      platform: "linkedin",
      suggestedDate: getDateOffset(startDate, 8),
      suggestedTime: "08:00",
      hashtags: ["#ProductFeature", "#Productivity"],
      contentType: "text"
    },
    {
      title: "Trending Topic Take",
      content: "Hot take on [trending topic in industry]: Here's our perspective and why it matters for you... 🔥",
      platform: "twitter",
      suggestedDate: getDateOffset(startDate, 9),
      suggestedTime: "18:00",
      hashtags: ["#HotTake", "#Trending"],
      contentType: "text"
    },
    {
      title: "Interactive Poll",
      content: "We want to hear from you! Which of these features would you find most valuable? Vote below! 📊",
      platform: "instagram",
      suggestedDate: getDateOffset(startDate, 10),
      suggestedTime: "14:00",
      hashtags: ["#Poll", "#YourOpinion"],
      contentType: "story"
    },
    {
      title: "Team Introduction",
      content: "Meet the team! This week we're introducing [team member] who handles [role]. Fun fact: They [interesting fact]! 👋",
      platform: "facebook",
      suggestedDate: getDateOffset(startDate, 11),
      suggestedTime: "16:00",
      hashtags: ["#MeetTheTeam", "#CompanyCulture"],
      contentType: "image"
    },
    {
      title: "How-To Guide",
      content: "Step-by-step guide: How to [achieve specific goal]. Follow along! #HowTo #Guide #Tutorial",
      platform: "tiktok",
      suggestedDate: getDateOffset(startDate, 12),
      suggestedTime: "10:00",
      hashtags: ["#HowTo", "#Guide", "#Tutorial"],
      contentType: "video"
    },
    {
      title: "Industry News Roundup",
      content: "📰 This week's top news in [industry]: What you need to know and how it affects you. Thread 🧵",
      platform: "twitter",
      suggestedDate: getDateOffset(startDate, 14),
      suggestedTime: "09:00",
      hashtags: ["#IndustryNews", "#Roundup"],
      contentType: "text"
    }
  ]

  return demoIdeas
}

function getDateOffset(startDate: Date, daysOffset: number): string {
  const date = new Date(startDate)
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}

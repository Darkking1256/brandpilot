export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

interface ContentSuggestion {
  id: string
  title: string
  content: string
  platform: string
  reason: string
  category: "trending" | "seasonal" | "evergreen" | "promotional"
}

export async function GET() {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    // Get top performing posts for context (for this user)
    const { data: topPosts } = await supabase
      .from("posts")
      .select("content, platform, status")
      .eq("user_id", user.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(10)

    // Get user's posting history for personalization
    const { data: userPosts } = await supabase
      .from("posts")
      .select("platform, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    // Generate AI-powered suggestions
    const suggestions = await generateAISuggestions(topPosts || [], userPosts || [])
    
    // Save suggestions to database for tracking
    if (suggestions.length > 0) {
      const suggestionsToSave = suggestions.map(s => ({
        user_id: user.id,
        title: s.title,
        content: s.content,
        platform: s.platform,
        category: s.category,
        reason: s.reason,
      }))

      await supabase.from("content_suggestions").insert(suggestionsToSave)
    }
    
    return NextResponse.json({ suggestions })
  } catch (error: any) {
    console.error("Error generating content suggestions:", error)
    return NextResponse.json(
      { error: "Failed to generate suggestions", details: error.message },
      { status: 500 }
    )
  }
}

async function generateAISuggestions(
  topPosts: any[],
  userPosts: any[]
): Promise<ContentSuggestion[]> {
  // Get current date for seasonal suggestions
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  // Analyze user's posting patterns
  const platformFrequency: Record<string, number> = {}
  userPosts.forEach(post => {
    platformFrequency[post.platform] = (platformFrequency[post.platform] || 0) + 1
  })

  const mostUsedPlatform = Object.entries(platformFrequency)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "twitter"

  // Generate suggestions based on patterns
  const suggestions: ContentSuggestion[] = []

  // Seasonal suggestions
  const seasonalTopics = getSeasonalTopics(month)
  seasonalTopics.forEach((topic, index) => {
    suggestions.push({
      id: `seasonal-${index}`,
      title: `Seasonal: ${topic.title}`,
      content: topic.content,
      platform: mostUsedPlatform,
      reason: `Perfect timing for ${topic.season}`,
      category: "seasonal",
    })
  })

  // Trending suggestions (based on top posts)
  if (topPosts.length > 0) {
    const topPlatform = topPosts[0].platform
    suggestions.push({
      id: "trending-1",
      title: "Trending Topic",
      content: `Join the conversation about ${topPlatform}! Share your insights and connect with your audience.`,
      platform: topPlatform,
      reason: "Based on your top-performing content",
      category: "trending",
    })
  }

  // Evergreen content suggestions
  const evergreenTopics = [
    {
      title: "Tip Tuesday",
      content: "💡 Quick tip: [Your tip here]. What's your favorite tip? Share in the comments!",
    },
    {
      title: "Motivational Monday",
      content: "🌟 Start your week strong! [Your motivational message]. What are you working on this week?",
    },
    {
      title: "Question of the Week",
      content: "❓ [Your question here]. I'd love to hear your thoughts!",
    },
  ]

  evergreenTopics.forEach((topic, index) => {
    suggestions.push({
      id: `evergreen-${index}`,
      title: topic.title,
      content: topic.content,
      platform: mostUsedPlatform,
      reason: "Evergreen content that always performs well",
      category: "evergreen",
    })
  })

  // If AI API keys are available, enhance with AI
  const openaiKey = process.env.OPENAI_API_KEY
  const groqKey = process.env.GROQ_API_KEY

  if (openaiKey || groqKey) {
    try {
      const aiSuggestions = await generateAISuggestionsWithAPI(topPosts, userPosts, (openaiKey || groqKey) as string)
      suggestions.push(...aiSuggestions)
    } catch (error) {
      console.error("AI suggestion generation failed, using fallback:", error)
    }
  }

  return suggestions.slice(0, 10) // Return top 10 suggestions
}

function getSeasonalTopics(month: number): Array<{ title: string; content: string; season: string }> {
  const topics: Record<number, Array<{ title: string; content: string; season: string }>> = {
    1: [
      { title: "New Year Goals", content: "🎯 New year, new goals! What are you aiming to achieve this year? Share your resolutions!", season: "January" },
      { title: "Fresh Start", content: "✨ A fresh start begins today. What's one thing you're excited about this year?", season: "January" },
    ],
    2: [
      { title: "Valentine's Day", content: "💝 Love is in the air! Share what you love about [your topic/industry].", season: "February" },
    ],
    3: [
      { title: "Spring Begins", content: "🌸 Spring is here! Time for new beginnings and fresh ideas.", season: "March" },
    ],
    4: [
      { title: "April Showers", content: "🌧️ April brings growth and renewal. What's growing in your world?", season: "April" },
    ],
    5: [
      { title: "May Flowers", content: "🌺 May is blooming with opportunities! What opportunities are you pursuing?", season: "May" },
    ],
    6: [
      { title: "Summer Kickoff", content: "☀️ Summer is here! Share your summer plans and goals.", season: "June" },
    ],
    7: [
      { title: "Mid-Year Review", content: "📊 Halfway through the year! How are your goals progressing?", season: "July" },
    ],
    8: [
      { title: "Back to School", content: "📚 Back to school season! Share your favorite learning resources.", season: "August" },
    ],
    9: [
      { title: "Fall Begins", content: "🍂 Fall is here! Time to reflect and plan for the rest of the year.", season: "September" },
    ],
    10: [
      { title: "Halloween Prep", content: "🎃 Spooky season is here! Share your favorite [topic] tips.", season: "October" },
    ],
    11: [
      { title: "Thanksgiving", content: "🦃 Grateful for [what you're grateful for]. What are you thankful for?", season: "November" },
    ],
    12: [
      { title: "Holiday Season", content: "🎄 Happy holidays! Wishing you joy and success in the new year!", season: "December" },
      { title: "Year in Review", content: "📅 Reflecting on the year. What were your biggest wins?", season: "December" },
    ],
  }

  return topics[month] || []
}

async function generateAISuggestionsWithAPI(
  topPosts: any[],
  userPosts: any[],
  apiKey: string
): Promise<ContentSuggestion[]> {
  // This would use OpenAI or Groq API to generate more sophisticated suggestions
  // For now, return empty array as fallback
  return []
}


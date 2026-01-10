export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] })
    }

    const supabase = await createClient()
    const searchLower = query.toLowerCase()

    const results: Array<{
      id: string
      type: "post" | "campaign" | "ad"
      title: string
      description: string
      url: string
    }> = []

    // Search posts
    const { data: posts } = await supabase
      .from("posts")
      .select("id, content, platform, scheduled_date")
      .eq("user_id", user.id)
      .ilike("content", `%${query}%`)
      .limit(5)

    if (posts) {
      posts.forEach((post) => {
        results.push({
          id: post.id,
          type: "post",
          title: post.content.substring(0, 50) + (post.content.length > 50 ? "..." : ""),
          description: `Platform: ${post.platform} • Scheduled: ${post.scheduled_date}`,
          url: `/dashboard/scheduler?post=${post.id}`,
        })
      })
    }

    // Search campaigns
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id, name, description, platform")
      .eq("user_id", user.id)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5)

    if (campaigns) {
      campaigns.forEach((campaign) => {
        results.push({
          id: campaign.id,
          type: "campaign",
          title: campaign.name,
          description: campaign.description || `Platform: ${campaign.platform}`,
          url: `/dashboard/campaign?campaign=${campaign.id}`,
        })
      })
    }

    // Search ads
    const { data: ads } = await supabase
      .from("ads")
      .select("id, name, description, platform")
      .eq("user_id", user.id)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5)

    if (ads) {
      ads.forEach((ad) => {
        results.push({
          id: ad.id,
          type: "ad",
          title: ad.name,
          description: ad.description || `Platform: ${ad.platform}`,
          url: `/dashboard/ads?ad=${ad.id}`,
        })
      })
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error in GET /api/search:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


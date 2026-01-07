import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const days = parseInt(searchParams.get("days") || "30")

    const supabase = await createClient()

    // Calculate date threshold
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    // Get published posts from the last N days for the authenticated user
    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, content, platform, status, scheduled_date, created_at")
      .eq("user_id", user.id) // Filter by user.id
      .eq("status", "published")
      .gte("created_at", dateThreshold.toISOString())
      .order("created_at", { ascending: false })
      .limit(limit * 2) // Get more to calculate engagement

    if (error) {
      throw error
    }

    // For now, we'll use a simple heuristic: posts with more content or recent posts
    // In a real implementation, you'd join with analytics tables to get actual engagement
    const postsWithEngagement = (posts || []).map((post, index) => ({
      ...post,
      // Simulated engagement score (replace with real analytics)
      engagement: Math.floor(Math.random() * 1000) + (post.content.length > 100 ? 100 : 0),
      publishedAt: post.created_at,
    }))

    // Sort by engagement (simulated) and take top N
    const topPosts = postsWithEngagement
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, limit)

    return NextResponse.json({ posts: topPosts })
  } catch (error: any) {
    console.error("Error fetching top posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch top posts", details: error.message },
      { status: 500 }
    )
  }
}


export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
}

interface QuickStats {
  totalPosts: number
  totalEngagement: number
  avgEngagementRate: number
  topPlatform: string
  bestPost: {
    content: string
    engagement: number
    platform: string
  } | null
}

const emptyStats = { stats: { totalPosts: 0, totalEngagement: 0, avgEngagementRate: 0, topPlatform: "none", bestPost: null } }

export async function GET() {
  try {
    // Return empty stats if Supabase is not configured (demo mode)
    if (!isSupabaseConfigured()) {
      return NextResponse.json(emptyStats)
    }

    // Try to authenticate, return empty data if auth fails (guest mode)
    let user
    try {
      const authResult = await requireAuth()
      if (authResult.error) {
        return NextResponse.json(emptyStats)
      }
      user = authResult.user
    } catch {
      return NextResponse.json(emptyStats)
    }
    
    if (!user) {
      return NextResponse.json(emptyStats)
    }

    const supabase = await createClient()

    // Get all published posts for the authenticated user
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id, content, platform, status, created_at")
      .eq("user_id", user.id)
      .eq("status", "published")

    if (postsError) {
      throw postsError
    }

    const totalPosts = posts?.length || 0

    // Calculate platform distribution
    const platformCounts: Record<string, number> = {}
    posts?.forEach((post) => {
      platformCounts[post.platform] = (platformCounts[post.platform] || 0) + 1
    })

    const topPlatform =
      Object.entries(platformCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "none"

    // Simulate engagement (in real implementation, join with analytics tables)
    // For now, use a simple heuristic based on content length and recency
    const postsWithEngagement = (posts || []).map((post) => {
      const daysSincePost = Math.floor(
        (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      const recencyScore = Math.max(0, 100 - daysSincePost * 5)
      const contentScore = Math.min(100, post.content.length / 3)
      const engagement = Math.floor(recencyScore + contentScore + Math.random() * 200)
      return {
        ...post,
        engagement,
      }
    })

    const totalEngagement = postsWithEngagement.reduce(
      (sum, post) => sum + post.engagement,
      0
    )
    const avgEngagementRate =
      totalPosts > 0 ? (totalEngagement / totalPosts / 10).toFixed(1) : "0.0"

    // Find best performing post
    const bestPost =
      postsWithEngagement.length > 0
        ? postsWithEngagement.sort((a, b) => b.engagement - a.engagement)[0]
        : null

    const stats: QuickStats = {
      totalPosts,
      totalEngagement,
      avgEngagementRate: parseFloat(avgEngagementRate),
      topPlatform,
      bestPost: bestPost
        ? {
            content: bestPost.content.substring(0, 150),
            engagement: bestPost.engagement,
            platform: bestPost.platform,
          }
        : null,
    }

    return NextResponse.json({ stats })
  } catch (error: any) {
    console.error("Error fetching quick stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats", details: error.message },
      { status: 500 }
    )
  }
}


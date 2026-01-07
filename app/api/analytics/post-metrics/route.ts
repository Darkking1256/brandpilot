import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")
    const platform = searchParams.get("platform")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const supabase = await createClient()

    let query = supabase
      .from("post_metrics")
      .select(`
        *,
        posts!inner(user_id, platform)
      `)
      .eq("posts.user_id", user.id)

    if (postId) {
      query = query.eq("post_id", postId)
    }

    if (platform) {
      query = query.eq("posts.platform", platform)
    }

    if (startDate) {
      query = query.gte("recorded_at", startDate)
    }

    if (endDate) {
      query = query.lte("recorded_at", endDate)
    }

    const { data: metrics, error } = await query.order("recorded_at", { ascending: false })

    if (error) {
      console.error("Error fetching post metrics:", error)
      return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
    }

    return NextResponse.json({ metrics: metrics || [] })
  } catch (error) {
    console.error("Error in GET /api/analytics/post-metrics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


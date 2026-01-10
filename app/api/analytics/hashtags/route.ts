export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get("platform")

    const supabase = await createClient()

    let query = supabase
      .from("hashtag_performance")
      .select("*")
      .eq("user_id", user.id)

    if (platform) {
      query = query.eq("platform", platform)
    }

    const { data: hashtags, error } = await query.order("total_engagement", { ascending: false })

    if (error) {
      console.error("Error fetching hashtag performance:", error)
      return NextResponse.json({ error: "Failed to fetch hashtag performance" }, { status: 500 })
    }

    return NextResponse.json({ hashtags: hashtags || [] })
  } catch (error) {
    console.error("Error in GET /api/analytics/hashtags:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


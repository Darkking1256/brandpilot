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
      .from("posting_time_analysis")
      .select("*")
      .eq("user_id", user.id)

    if (platform) {
      query = query.eq("platform", platform)
    }

    const { data: times, error } = await query.order("avg_engagement_rate", { ascending: false })

    if (error) {
      console.error("Error fetching best times:", error)
      return NextResponse.json({ error: "Failed to fetch best times" }, { status: 500 })
    }

    return NextResponse.json({ times: times || [] })
  } catch (error) {
    console.error("Error in GET /api/analytics/best-times:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


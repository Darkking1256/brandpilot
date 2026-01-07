import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()

    const { data: connections, error } = await supabase
      .from("platform_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("platform", { ascending: true })

    if (error) {
      console.error("Error fetching platform connections:", error)
      return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 })
    }

    // Don't return sensitive tokens in the response
    const safeConnections = (connections || []).map((conn) => ({
      id: conn.id,
      platform: conn.platform,
      platform_username: conn.platform_username,
      platform_user_id: conn.platform_user_id,
      is_active: conn.is_active,
      last_used_at: conn.last_used_at,
      created_at: conn.created_at,
    }))

    return NextResponse.json({ connections: safeConnections })
  } catch (error) {
    console.error("Error in GET /api/platforms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


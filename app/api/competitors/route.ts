export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()

    const { data: competitors, error } = await supabase
      .from("competitors")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching competitors:", error)
      return NextResponse.json({ error: "Failed to fetch competitors" }, { status: 500 })
    }

    return NextResponse.json({ competitors: competitors || [] })
  } catch (error) {
    console.error("Error in GET /api/competitors:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { name, platform, handle, profileUrl } = await request.json()
    const supabase = await createClient()

    if (!name || !platform || !handle) {
      return NextResponse.json(
        { error: "Name, platform, and handle are required" },
        { status: 400 }
      )
    }

    const { data: competitor, error } = await supabase
      .from("competitors")
      .insert({
        user_id: user.id,
        name,
        platform,
        handle,
        profile_url: profileUrl || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating competitor:", error)
      return NextResponse.json({ error: "Failed to create competitor" }, { status: 500 })
    }

    return NextResponse.json({ competitor })
  } catch (error) {
    console.error("Error in POST /api/competitors:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


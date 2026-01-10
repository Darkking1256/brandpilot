export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { query, entityType } = await request.json()
    const supabase = await createClient()

    await supabase.from("search_history").insert({
      user_id: user.id,
      query,
      entity_type: entityType,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/search/history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


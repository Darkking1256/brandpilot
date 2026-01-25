export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
}

// GET /api/ads - Fetch all ads for the current user
export async function GET(request: NextRequest) {
  try {
    // Return empty ads if Supabase is not configured (demo mode)
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ads: [] })
    }

    // Try to authenticate, return empty data if auth fails (guest mode)
    let user
    try {
      const authResult = await requireAuth()
      if (authResult.error) {
        return NextResponse.json({ ads: [] })
      }
      user = authResult.user
    } catch {
      return NextResponse.json({ ads: [] })
    }
    
    if (!user) {
      return NextResponse.json({ ads: [] })
    }

    const supabase = await createClient()

    const { data: ads, error } = await supabase
      .from("ads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching ads:", error)
      return NextResponse.json({ ads: [] })
    }

    return NextResponse.json({ ads: ads || [] })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ ads: [] })
  }
}

// POST /api/ads - Create a new ad
export async function POST(request: NextRequest) {
  try {
    // Return error if Supabase is not configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured. Please set up Supabase." },
        { status: 503 }
      )
    }

    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    const body = await request.json()

    const { data: ad, error } = await supabase
      .from("ads")
      .insert({
        user_id: user.id,
        ...body,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating ad:", error)
      return NextResponse.json(
        { error: "Failed to create ad" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ad }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get("keyword")
    const platform = searchParams.get("platform")
    const sentiment = searchParams.get("sentiment")
    const limit = parseInt(searchParams.get("limit") || "50")

    let query = supabase
      .from("brand_mentions")
      .select("*")
      .eq("user_id", user.id)
      .limit(limit)

    if (keyword) {
      query = query.eq("keyword", keyword)
    }

    if (platform) {
      query = query.eq("platform", platform)
    }

    if (sentiment) {
      query = query.eq("sentiment", sentiment)
    }

    const { data, error } = await query.order("detected_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ mentions: data || [] })
  } catch (error: any) {
    console.error("Error fetching brand mentions:", error)
    return NextResponse.json(
      { error: "Failed to fetch brand mentions", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("brand_mentions")
      .insert({
        user_id: user.id,
        ...body,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ mention: data }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating brand mention:", error)
    return NextResponse.json(
      { error: "Failed to create brand mention", details: error.message },
      { status: 500 }
    )
  }
}


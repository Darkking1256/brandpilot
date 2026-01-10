export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get("platform")
    const messageType = searchParams.get("type")
    const isRead = searchParams.get("read")
    const isArchived = searchParams.get("archived")

    let query = supabase
      .from("inbox_messages")
      .select("*")
      .eq("user_id", user.id)

    if (platform) {
      query = query.eq("platform", platform)
    }

    if (messageType) {
      query = query.eq("message_type", messageType)
    }

    if (isRead !== null) {
      query = query.eq("is_read", isRead === "true")
    }

    if (isArchived !== null) {
      query = query.eq("is_archived", isArchived === "true")
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ messages: data || [] })
  } catch (error: any) {
    console.error("Error fetching inbox messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch inbox messages", details: error.message },
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
      .from("inbox_messages")
      .insert({
        user_id: user.id,
        ...body,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ message: data }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating inbox message:", error)
    return NextResponse.json(
      { error: "Failed to create inbox message", details: error.message },
      { status: 500 }
    )
  }
}


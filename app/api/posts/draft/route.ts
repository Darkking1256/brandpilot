export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { draftData, postId } = await request.json()
    const supabase = await createClient()

    if (postId) {
      // Update existing post draft (verify it belongs to the user)
      const { error } = await supabase
        .from("posts")
        .update({
          draft_data: draftData,
          last_autosaved_at: new Date().toISOString(),
        })
        .eq("id", postId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error saving draft:", error)
        return NextResponse.json({ error: "Failed to save draft" }, { status: 500 })
      }
    } else {
      // Create new draft post
      const { error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: draftData.content || "",
          platform: draftData.platform || "twitter",
          scheduled_date: draftData.scheduledDate || new Date().toISOString().split("T")[0],
          scheduled_time: draftData.scheduledTime || "09:00",
          status: "draft",
          image_url: draftData.imageUrl || null,
          link_url: draftData.linkUrl || null,
          draft_data: draftData,
          last_autosaved_at: new Date().toISOString(),
        })

      if (error) {
        console.error("Error creating draft:", error)
        return NextResponse.json({ error: "Failed to create draft" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/posts/draft:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")
    const supabase = await createClient()

    if (postId) {
      const { data, error } = await supabase
        .from("posts")
        .select("draft_data, last_autosaved_at")
        .eq("id", postId)
        .eq("user_id", user.id)
        .single()

      if (error) {
        return NextResponse.json({ error: "Draft not found" }, { status: 404 })
      }

      return NextResponse.json({ draft: data })
    }

    // Get all drafts
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "draft")
      .order("last_autosaved_at", { ascending: false })

    if (error) {
      console.error("Error fetching drafts:", error)
      return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 })
    }

    return NextResponse.json({ drafts: data || [] })
  } catch (error) {
    console.error("Error in GET /api/posts/draft:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


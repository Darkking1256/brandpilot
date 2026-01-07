import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { id } = params
    const supabase = await createClient()

    // Verify post exists and belongs to user
    const { data: post } = await supabase
      .from("posts")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Update post approval status
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        approval_status: "pending_review",
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error requesting review:", updateError)
      return NextResponse.json({ error: "Failed to request review" }, { status: 500 })
    }

    // In production, send notification to approvers here

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/posts/[id]/request-review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


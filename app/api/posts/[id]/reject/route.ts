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
    const { comment } = await request.json()
    const supabase = await createClient()

    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: "Rejection comment is required" }, { status: 400 })
    }

    // Verify post exists
    const { data: post } = await supabase
      .from("posts")
      .select("id, user_id")
      .eq("id", id)
      .single()

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Update post approval status
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        approval_status: "rejected",
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error rejecting post:", updateError)
      return NextResponse.json({ error: "Failed to reject post" }, { status: 500 })
    }

    // Add rejection comment
    await supabase.from("post_comments").insert({
      post_id: id,
      user_id: user.id,
      comment: `Rejected: ${comment}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/posts/[id]/reject:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


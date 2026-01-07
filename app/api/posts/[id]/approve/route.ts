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

    // Verify post exists and user has access (either owns it or is team admin)
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
        approval_status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error approving post:", updateError)
      return NextResponse.json({ error: "Failed to approve post" }, { status: 500 })
    }

    // Add comment if provided
    if (comment) {
      await supabase.from("post_comments").insert({
        post_id: id,
        user_id: user.id,
        comment: `Approved: ${comment}`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/posts/[id]/approve:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


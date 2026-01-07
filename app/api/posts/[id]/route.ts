import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

// GET /api/posts/[id] - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    const { data: post, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id) // Only get user's own posts
      .single()

    if (error || !post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Transform response to match frontend format
    const transformedPost = {
      id: post.id,
      content: post.content,
      platform: post.platform,
      scheduledDate: post.scheduled_date,
      scheduledTime: post.scheduled_time,
      status: post.status,
      imageUrl: post.image_url || undefined,
      linkUrl: post.link_url || undefined,
      createdAt: post.created_at,
    }

    return NextResponse.json(transformedPost)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    const body = await request.json()
    const { content, platform, scheduledDate, scheduledTime, imageUrl, linkUrl, status } = body

    // Determine status if not provided
    let finalStatus = status
    if (!finalStatus && scheduledDate && scheduledTime) {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
      const now = new Date()
      finalStatus = scheduledDateTime > now ? "scheduled" : "draft"
    }

    const updateData: any = {}
    if (content !== undefined) updateData.content = content
    if (platform !== undefined) updateData.platform = platform
    if (scheduledDate !== undefined) updateData.scheduled_date = scheduledDate
    if (scheduledTime !== undefined) updateData.scheduled_time = scheduledTime
    if (imageUrl !== undefined) updateData.image_url = imageUrl || null
    if (linkUrl !== undefined) updateData.link_url = linkUrl || null
    if (finalStatus !== undefined) updateData.status = finalStatus

    const { data: post, error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", params.id)
      .eq("user_id", user.id) // Only update user's own posts
      .select()
      .single()

    if (error) {
      console.error("Error updating post:", error)
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 }
      )
    }

    // Transform response to match frontend format
    const transformedPost = {
      id: post.id,
      content: post.content,
      platform: post.platform,
      scheduledDate: post.scheduled_date,
      scheduledTime: post.scheduled_time,
      status: post.status,
      imageUrl: post.image_url || undefined,
      linkUrl: post.link_url || undefined,
      createdAt: post.created_at,
    }

    return NextResponse.json(transformedPost)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id) // Only delete user's own posts

    if (error) {
      console.error("Error deleting post:", error)
      return NextResponse.json(
        { error: "Failed to delete post" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


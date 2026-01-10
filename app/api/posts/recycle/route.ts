export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { postIds, scheduleDays = 30 } = await request.json()

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: "Post IDs are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get original posts (verify they belong to the user)
    const { data: originalPosts, error: fetchError } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .in("id", postIds)

    if (fetchError) {
      throw fetchError
    }

    if (!originalPosts || originalPosts.length === 0) {
      return NextResponse.json(
        { error: "Posts not found" },
        { status: 404 }
      )
    }

    // Calculate new scheduled date (default: 30 days from now)
    const scheduledDate = new Date()
    scheduledDate.setDate(scheduledDate.getDate() + scheduleDays)

    // Create new scheduled posts based on originals
    const recycledPosts = originalPosts.map((post) => ({
      user_id: user.id,
      content: post.content,
      platform: post.platform,
      scheduled_date: scheduledDate.toISOString().split("T")[0],
      scheduled_time: post.scheduled_time || "10:00",
      status: "scheduled",
      image_url: post.image_url,
      link_url: post.link_url,
      recycled_from: post.id,
      recycle_count: (post.recycle_count || 0) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { data: insertedPosts, error: insertError } = await supabase
      .from("posts")
      .insert(recycledPosts)
      .select()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({
      success: true,
      count: insertedPosts?.length || 0,
      posts: insertedPosts,
    })
  } catch (error: any) {
    console.error("Error recycling posts:", error)
    return NextResponse.json(
      { error: "Failed to recycle posts", details: error.message },
      { status: 500 }
    )
  }
}


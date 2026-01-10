export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

// GET /api/posts - Fetch all posts for the current user
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()

    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching posts:", error)
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      )
    }

    // Transform data to match frontend format
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      platform: post.platform,
      scheduledDate: post.scheduled_date,
      scheduledTime: post.scheduled_time,
      status: post.status,
      imageUrl: post.image_url || undefined,
      linkUrl: post.link_url || undefined,
      createdAt: post.created_at,
    }))

    return NextResponse.json(transformedPosts)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    const body = await request.json()
    const { content, platform, scheduledDate, scheduledTime, imageUrl, linkUrl } = body

    // Validate required fields
    if (!content || !platform || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Determine status based on scheduled date/time
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
    const now = new Date()
    const status = scheduledDateTime > now ? "scheduled" : "draft"

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content,
        platform,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        status,
        image_url: imageUrl || null,
        link_url: linkUrl || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating post:", error)
      return NextResponse.json(
        { error: "Failed to create post" },
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

    return NextResponse.json(transformedPost, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


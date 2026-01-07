import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Retry failed posts
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { postIds, maxRetries = 3 } = body

    // Get failed posts
    let query = supabase
      .from("posts")
      .select("*")
      .eq("status", "failed")

    if (postIds && Array.isArray(postIds) && postIds.length > 0) {
      query = query.in("id", postIds)
    }

    const { data: failedPosts, error } = await query

    if (error) {
      console.error("Error fetching failed posts:", error)
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
    }

    const retriedPosts = []
    const stillFailedPosts = []

    for (const post of failedPosts || []) {
      try {
        // Check if post is still scheduled (not past due date/time)
        const scheduledDateTime = new Date(`${post.scheduled_date}T${post.scheduled_time}`)
        const now = new Date()

        if (scheduledDateTime > now) {
          // Post is still scheduled, change status back to scheduled
          const { error: updateError } = await supabase
            .from("posts")
            .update({
              status: "scheduled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", post.id)

          if (updateError) {
            console.error(`Error retrying post ${post.id}:`, updateError)
            stillFailedPosts.push({ id: post.id, error: updateError.message })
          } else {
            retriedPosts.push({ id: post.id, platform: post.platform })
          }
        } else {
          // Post is past due, try to publish immediately
          // In production, call platform API here
          const { error: updateError } = await supabase
            .from("posts")
            .update({
              status: "published",
              updated_at: new Date().toISOString(),
            })
            .eq("id", post.id)

          if (updateError) {
            console.error(`Error publishing post ${post.id}:`, updateError)
            stillFailedPosts.push({ id: post.id, error: updateError.message })
          } else {
            retriedPosts.push({ id: post.id, platform: post.platform })
          }
        }
      } catch (error: any) {
        console.error(`Error retrying post ${post.id}:`, error)
        stillFailedPosts.push({ id: post.id, error: error.message })
      }
    }

    return NextResponse.json({
      success: true,
      retried: retriedPosts.length,
      stillFailed: stillFailedPosts.length,
      retriedPosts,
      stillFailedPosts,
    })
  } catch (error) {
    console.error("Error in retry failed posts:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


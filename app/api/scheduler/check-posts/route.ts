import { NextRequest, NextResponse } from "next/server"
import { processScheduledPosts, getQueueStatus } from "@/lib/publishing/publisher"

// This endpoint checks for posts that need to be published
// It's a wrapper around the main publisher function
// For production, use the /api/cron/publish-posts endpoint with Vercel Cron

export async function GET(request: NextRequest) {
  try {
    // Get queue status
    const status = await getQueueStatus()

    return NextResponse.json({
      success: true,
      queue: status,
      message: "Use /api/cron/publish-posts to trigger actual publishing",
    })
  } catch (error) {
    console.error("Error in scheduler check:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST endpoint to manually trigger publishing
export async function POST(request: NextRequest) {
  try {
    // Verify authorization (optional - for manual triggering)
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Process scheduled posts
    const results = await processScheduledPosts()

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in scheduler:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


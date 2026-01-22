export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { processScheduledPosts, getQueueStatus } from '@/lib/publishing/publisher'

// This endpoint is called by Vercel Cron or external cron service
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/publish-posts", "schedule": "* * * * *" }] }

export async function GET(request: NextRequest) {
  try {
    // Skip during build time - environment variables may not be available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Service not configured', message: 'Supabase environment variables are not set' },
        { status: 503 }
      )
    }

    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Process scheduled posts
    const results = await processScheduledPosts()

    // Log results
    console.log('Cron job completed:', {
      timestamp: new Date().toISOString(),
      processed: results.processed,
      successful: results.successful,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
    })

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Cron job failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}


import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getUserSubscription, hasFeatureAccess } from '@/lib/auth'
import { repurposeContent } from '@/lib/ai'
import { Platform } from '@/types'
import { z } from 'zod'

const repurposeSchema = z.object({
  content: z.string().min(1).max(5000),
  platforms: z.array(z.enum(['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube'])).min(1),
  tone: z.enum(['professional', 'casual', 'humorous', 'inspirational', 'educational']).optional(),
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'llama3-70b', 'mixtral-8x7b']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    // Check subscription for AI access
    const subscription = await getUserSubscription(user.id)
    if (!hasFeatureAccess(subscription.tier, 'ai')) {
      return NextResponse.json(
        { error: 'Content repurposing requires a Pro or Enterprise subscription' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = repurposeSchema.parse(body)

    const results = await repurposeContent(
      validated.content,
      validated.platforms as Platform[],
      {
        tone: validated.tone,
        model: validated.model,
      }
    )

    return NextResponse.json({ 
      success: true,
      results 
    })
  } catch (error) {
    console.error('Repurpose error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to repurpose content' },
      { status: 500 }
    )
  }
}


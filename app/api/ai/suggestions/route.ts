import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getUserSubscription, hasFeatureAccess } from '@/lib/auth'
import { generateContentIdeas, improveContent, analyzeContent } from '@/lib/ai'
import { Platform } from '@/types'
import { z } from 'zod'

// Generate content ideas
const ideasSchema = z.object({
  action: z.literal('ideas'),
  topic: z.string().min(1).max(500),
  count: z.number().int().min(1).max(10).optional(),
  platforms: z.array(z.enum(['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube'])).optional(),
})

// Improve existing content
const improveSchema = z.object({
  action: z.literal('improve'),
  content: z.string().min(1).max(5000),
  platform: z.enum(['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube']),
  improvements: z.array(z.enum(['engagement', 'clarity', 'hashtags', 'call-to-action'])).min(1),
})

// Analyze content
const analyzeSchema = z.object({
  action: z.literal('analyze'),
  content: z.string().min(1).max(5000),
  platform: z.enum(['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube']),
})

const requestSchema = z.discriminatedUnion('action', [
  ideasSchema,
  improveSchema,
  analyzeSchema,
])

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    // Check subscription for AI access
    const subscription = await getUserSubscription(user.id)
    if (!hasFeatureAccess(subscription.tier, 'ai')) {
      return NextResponse.json(
        { error: 'AI suggestions require a Pro or Enterprise subscription' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = requestSchema.parse(body)

    switch (validated.action) {
      case 'ideas': {
        const ideas = await generateContentIdeas(
          validated.topic,
          validated.count ?? 5,
          validated.platforms as Platform[] | undefined
        )
        return NextResponse.json({ success: true, ideas })
      }

      case 'improve': {
        const result = await improveContent(
          validated.content,
          validated.platform as Platform,
          validated.improvements
        )
        return NextResponse.json({ success: true, ...result })
      }

      case 'analyze': {
        const analysis = await analyzeContent(
          validated.content,
          validated.platform as Platform
        )
        return NextResponse.json({ success: true, ...analysis })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('AI suggestions error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    )
  }
}


export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getUserSubscription, hasFeatureAccess } from '@/lib/auth'
import { generateContent, GenerateContentOptions } from '@/lib/ai'
import { Platform } from '@/types'
import { z } from 'zod'

const generateSchema = z.object({
  prompt: z.string().min(1).max(1000),
  platform: z.enum(['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube']),
  tone: z.enum(['professional', 'casual', 'humorous', 'inspirational', 'educational']).optional(),
  includeHashtags: z.boolean().optional(),
  includeEmojis: z.boolean().optional(),
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
        { error: 'AI content generation requires a Pro or Enterprise subscription' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = generateSchema.parse(body)

    const result = await generateContent({
      prompt: validated.prompt,
      platform: validated.platform as Platform,
      tone: validated.tone,
      includeHashtags: validated.includeHashtags ?? true,
      includeEmojis: validated.includeEmojis ?? false,
      model: validated.model,
    })

    return NextResponse.json({ 
      success: true,
      ...result 
    })
  } catch (error) {
    console.error('AI generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    )
  }
}


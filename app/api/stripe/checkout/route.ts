export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, PRICING_TIERS, PricingTier } from '@/lib/stripe'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const body = await request.json()
    const { tier } = body as { tier: PricingTier }

    if (!tier || !['pro', 'enterprise'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      )
    }

    if (!PRICING_TIERS[tier].priceId) {
      return NextResponse.json(
        { error: 'Stripe price not configured. Please set STRIPE_PRO_PRICE_ID and STRIPE_ENTERPRISE_PRICE_ID in environment variables.' },
        { status: 500 }
      )
    }

    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email!,
      tier: tier as 'pro' | 'enterprise',
      successUrl: `${baseUrl}/dashboard/billing?success=true`,
      cancelUrl: `${baseUrl}/dashboard/billing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}


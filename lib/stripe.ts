import Stripe from 'stripe'

// Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Pricing configuration
export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    annualPrice: 0,
    priceId: null,
    annualPriceId: null,
    trialDays: 0, // No trial for free tier
    features: [
      '5 scheduled posts/month',
      '1 social account',
      'Basic analytics',
      'Standard support',
    ],
    limits: {
      posts_per_month: 5,
      social_accounts: 1,
      ai_generations: 0,
      video_exports: 0,
    },
  },
  pro: {
    name: 'Pro',
    price: 29,
    annualPrice: 278, // 20% discount: $29 * 12 = $348, with 20% off = $278.40 ≈ $278
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    annualPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
    trialDays: 14, // 14-day free trial
    features: [
      'Unlimited scheduled posts',
      '10 social accounts',
      'Advanced analytics',
      'AI content generation',
      'Video editing & export',
      'Priority support',
    ],
    limits: {
      posts_per_month: -1, // unlimited
      social_accounts: 10,
      ai_generations: 100,
      video_exports: 20,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    annualPrice: 950, // 20% discount: $99 * 12 = $1188, with 20% off = $950.40 ≈ $950
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    annualPriceId: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID,
    trialDays: 14, // 14-day free trial
    features: [
      'Everything in Pro',
      'Unlimited social accounts',
      'Unlimited AI generations',
      'Team collaboration',
      'API access',
      'White-label options',
      'Dedicated support',
    ],
    limits: {
      posts_per_month: -1,
      social_accounts: -1,
      ai_generations: -1,
      video_exports: -1,
    },
  },
} as const

export type PricingTier = keyof typeof PRICING_TIERS

// Helper to create checkout session
export async function createCheckoutSession({
  userId,
  userEmail,
  tier,
  billingPeriod = 'monthly',
  successUrl,
  cancelUrl,
}: {
  userId: string
  userEmail: string
  tier: 'pro' | 'enterprise'
  billingPeriod?: 'monthly' | 'annual'
  successUrl: string
  cancelUrl: string
}) {
  const priceId = billingPeriod === 'annual' 
    ? PRICING_TIERS[tier].annualPriceId 
    : PRICING_TIERS[tier].priceId

  if (!priceId) {
    throw new Error(`No price ID configured for tier: ${tier} (${billingPeriod})`)
  }

  // Get trial days for the tier (default to 0 if not specified)
  const trialDays = PRICING_TIERS[tier].trialDays || 0

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      tier,
      billingPeriod,
    },
    subscription_data: {
      metadata: {
        userId,
        tier,
        billingPeriod,
      },
      // Add 14-day free trial for Pro and Enterprise tiers
      ...(trialDays > 0 && { trial_period_days: trialDays }),
    },
  })

  return session
}

// Helper to create customer portal session
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

// Helper to cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

// Helper to resume subscription
export async function resumeSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}


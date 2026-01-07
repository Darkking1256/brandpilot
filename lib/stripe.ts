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
    priceId: null,
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
    priceId: process.env.STRIPE_PRO_PRICE_ID,
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
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
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
  successUrl,
  cancelUrl,
}: {
  userId: string
  userEmail: string
  tier: 'pro' | 'enterprise'
  successUrl: string
  cancelUrl: string
}) {
  const priceId = PRICING_TIERS[tier].priceId

  if (!priceId) {
    throw new Error(`No price ID configured for tier: ${tier}`)
  }

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
    },
    subscription_data: {
      metadata: {
        userId,
        tier,
      },
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


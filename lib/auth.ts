import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Get the authenticated user from Supabase
 * Returns the user object or null if not authenticated
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * Require authentication in API routes
 * Returns the user or sends a 401 response
 */
export async function requireAuth() {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      )
    }
  }
  
  return { user, error: null }
}

/**
 * Get user subscription tier
 * Returns 'free', 'pro', or 'enterprise'
 */
export async function getUserSubscription(userId: string): Promise<{
  tier: 'free' | 'pro' | 'enterprise'
  isActive: boolean
  expiresAt: Date | null
}> {
  const supabase = await createClient()
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()
  
  if (!subscription) {
    return { tier: 'free', isActive: true, expiresAt: null }
  }
  
  return {
    tier: subscription.tier || 'free',
    isActive: subscription.status === 'active',
    expiresAt: subscription.current_period_end ? new Date(subscription.current_period_end) : null
  }
}

/**
 * Check if user has access to a feature based on subscription tier
 */
export function hasFeatureAccess(
  tier: 'free' | 'pro' | 'enterprise',
  feature: 'ai' | 'analytics' | 'video' | 'unlimited_posts' | 'team' | 'api'
): boolean {
  const featureAccess: Record<string, ('free' | 'pro' | 'enterprise')[]> = {
    ai: ['pro', 'enterprise'],
    analytics: ['pro', 'enterprise'],
    video: ['pro', 'enterprise'],
    unlimited_posts: ['pro', 'enterprise'],
    team: ['enterprise'],
    api: ['enterprise'],
  }
  
  return featureAccess[feature]?.includes(tier) ?? false
}


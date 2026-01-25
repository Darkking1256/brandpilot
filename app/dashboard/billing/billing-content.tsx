"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Check, CreditCard, Loader2, Sparkles, Zap, Building2, ArrowRight, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/utils/cn"

interface Subscription {
  tier: 'free' | 'pro' | 'enterprise'
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
}

const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    icon: Sparkles,
    features: [
      '5 scheduled posts/month',
      '1 social account',
      'Basic analytics',
      'Standard support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    icon: Zap,
    popular: true,
    features: [
      'Unlimited scheduled posts',
      '10 social accounts',
      'Advanced analytics',
      'AI content generation',
      'Video editing & export',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    icon: Building2,
    features: [
      'Everything in Pro',
      'Unlimited social accounts',
      'Unlimited AI generations',
      'Team collaboration',
      'API access',
      'White-label options',
      'Dedicated support',
    ],
  },
}

export function BillingContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null)
  const [isPortalLoading, setIsPortalLoading] = useState(false)

  useEffect(() => {
    fetchSubscription()
    
    // Show success/cancel messages
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Subscription activated!",
        description: "Welcome to your new plan. Enjoy the premium features!",
      })
    }
    if (searchParams.get('canceled') === 'true') {
      toast({
        title: "Checkout canceled",
        description: "No changes were made to your subscription.",
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      } else {
        // No subscription, user is on free tier
        setSubscription({ tier: 'free', status: 'active', current_period_end: null, cancel_at_period_end: false })
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
      setSubscription({ tier: 'free', status: 'active', current_period_end: null, cancel_at_period_end: false })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckout = async (tier: 'pro' | 'enterprise') => {
    setIsCheckoutLoading(tier)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to start checkout",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCheckoutLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    setIsPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to open billing portal",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPortalLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const currentTier = subscription?.tier || 'free'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
      {/* Animated background blobs */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Billing & <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Subscription</span>
              </h1>
              <p className="text-slate-400">Manage your subscription and billing</p>
            </div>
            {currentTier !== 'free' && (
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                disabled={isPortalLoading}
                className="border-slate-700/50 bg-slate-900/50 backdrop-blur-xl text-slate-300 hover:text-white hover:border-blue-500/50"
              >
                {isPortalLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Manage Subscription
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Current Plan */}
        {subscription && subscription.status !== 'canceled' && (
          <div className="p-6 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-blue-500/30 hover:border-blue-500/50 transition-all duration-500">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-slate-300">
                  You&apos;re currently on the <strong className="font-semibold text-white">{PRICING_TIERS[currentTier].name}</strong> plan.
                  {subscription.current_period_end && (
                    <span className="text-slate-400">
                      {subscription.cancel_at_period_end 
                        ? ` Your subscription will end on ${new Date(subscription.current_period_end).toLocaleDateString()}.`
                        : ` Next billing date: ${new Date(subscription.current_period_end).toLocaleDateString()}.`
                      }
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.entries(PRICING_TIERS) as [keyof typeof PRICING_TIERS, typeof PRICING_TIERS[keyof typeof PRICING_TIERS]][]).map(([tier, plan]) => {
            const Icon = plan.icon
            const isCurrent = tier === currentTier
            const isPopular = 'popular' in plan && plan.popular

            return (
              <div 
                key={tier} 
                className={cn(
                  "relative flex flex-col p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border transition-all duration-500 hover:-translate-y-1",
                  isPopular 
                    ? 'border-blue-500/50 hover:border-blue-400/70 shadow-lg shadow-blue-500/10' 
                    : 'border-slate-700/50 hover:border-slate-600/50',
                  isCurrent && 'ring-2 ring-green-500/50'
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">Most Popular</Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">Current Plan</Badge>
                  </div>
                )}
                
                <div className="text-center pb-4">
                  <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div>
                    <span className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">${plan.price}</span>
                    {plan.price > 0 && <span className="text-slate-400">/month</span>}
                  </div>
                </div>

                <div className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-green-500/20 mt-0.5">
                        <Check className="h-3 w-3 text-green-400" />
                      </div>
                      <span className="text-sm text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <div>
                  {tier === 'free' ? (
                    <Button className="w-full border-slate-700/50 bg-slate-800/50 text-slate-400" variant="outline" disabled>
                      {isCurrent ? 'Current Plan' : 'Downgrade'}
                    </Button>
                  ) : isCurrent ? (
                    <Button className="w-full border-green-500/50 bg-green-500/10 text-green-400" variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className={cn(
                        "w-full shadow-lg transition-all duration-300",
                        isPopular 
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700' 
                          : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800'
                      )}
                      onClick={() => handleCheckout(tier as 'pro' | 'enterprise')}
                      disabled={isCheckoutLoading !== null}
                    >
                      {isCheckoutLoading === tier ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Upgrade to {plan.name}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <h4 className="font-medium text-white mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-slate-400">
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <h4 className="font-medium text-white mb-2">What payment methods do you accept?</h4>
              <p className="text-sm text-slate-400">
                We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment provider, Stripe.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <h4 className="font-medium text-white mb-2">Can I switch plans?</h4>
              <p className="text-sm text-slate-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated based on your remaining billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

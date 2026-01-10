"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Check, CreditCard, Loader2, Sparkles, Zap, Building2, ArrowRight, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription and billing</p>
        </div>
        {currentTier !== 'free' && (
          <Button 
            variant="outline" 
            onClick={handleManageSubscription}
            disabled={isPortalLoading}
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

      {/* Current Plan */}
      {subscription && subscription.status !== 'canceled' && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            You&apos;re currently on the <strong className="font-semibold">{PRICING_TIERS[currentTier].name}</strong> plan.
            {subscription.current_period_end && (
              <span>
                {subscription.cancel_at_period_end 
                  ? ` Your subscription will end on ${new Date(subscription.current_period_end).toLocaleDateString()}.`
                  : ` Next billing date: ${new Date(subscription.current_period_end).toLocaleDateString()}.`
                }
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {(Object.entries(PRICING_TIERS) as [keyof typeof PRICING_TIERS, typeof PRICING_TIERS[keyof typeof PRICING_TIERS]][]).map(([tier, plan]) => {
          const Icon = plan.icon
          const isCurrent = tier === currentTier
          const isPopular = 'popular' in plan && plan.popular

          return (
            <Card 
              key={tier} 
              className={`relative flex flex-col ${
                isPopular ? 'border-2 border-blue-500 shadow-lg' : ''
              } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white">Current Plan</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-3">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {tier === 'free' ? (
                  <Button className="w-full" variant="outline" disabled>
                    {isCurrent ? 'Current Plan' : 'Downgrade'}
                  </Button>
                ) : isCurrent ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className={`w-full ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
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
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* FAQ or Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium">What payment methods do you accept?</h4>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment provider, Stripe.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Can I switch plans?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated based on your remaining billing period.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

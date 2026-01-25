"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Mail, Lock, ArrowRight, RefreshCw, Plus } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const supabase = createClient()

  const redirectTo = searchParams.get("redirect") || "/dashboard"
  const errorParam = searchParams.get("error")

  // Show error message if redirected from callback with error
  useEffect(() => {
    if (errorParam === "email_confirmation_failed") {
      toast({
        title: "Confirmation failed",
        description: "There was an issue confirming your email. Please try again.",
        variant: "destructive",
      })
    }
  }, [errorParam, toast])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowResendConfirmation(false)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Check if error is due to email not confirmed
        if (error.message.includes("email not confirmed") || error.message.includes("Email not confirmed")) {
          setShowResendConfirmation(true)
          toast({
            title: "Email not confirmed",
            description: "Please check your email and click the confirmation link before signing in.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          })
        }
        setIsLoading(false)
        return
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        })
        router.push(redirectTo)
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
        },
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        setIsResending(false)
        return
      }

      toast({
        title: "Confirmation email sent!",
        description: "Please check your email and click the confirmation link.",
      })
      setShowResendConfirmation(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend confirmation email",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950 to-blue-950 p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 right-1/4 w-[700px] h-[700px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 left-1/4 w-[700px] h-[700px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* Animated decorative plus signs */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, idx) => {
          const positions = [
            { top: '10%', left: '15%' },
            { top: '20%', right: '12%' },
            { bottom: '15%', left: '20%' },
            { bottom: '25%', right: '18%' },
            { top: '40%', left: '8%' },
            { top: '60%', right: '10%' },
            { top: '80%', left: '40%' },
            { bottom: '12%', right: '30%' },
          ]
          return (
            <Plus
              key={idx}
              className="absolute text-blue-500/20 animate-pulse-plus"
              style={{
                ...positions[idx],
                animationDelay: `${idx * 0.5}s`,
                width: '20px',
                height: '20px',
              }}
            />
          )
        })}
      </div>
      
      <Card className="w-full max-w-md border-2 border-slate-700/50 shadow-2xl bg-slate-900/50 backdrop-blur-xl relative z-10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 p-3 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base text-slate-400">
            Sign in to your MarketPilot AI account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-slate-300">
                <Mail className="h-4 w-4 text-blue-400" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-slate-300">
                <Lock className="h-4 w-4 text-blue-400" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          {showResendConfirmation && (
            <div className="mt-4 p-4 bg-yellow-900/20 backdrop-blur-xl border border-yellow-600/50 rounded-lg space-y-3">
              <p className="text-sm text-yellow-300">
                Your email address hasn&apos;t been confirmed yet. Please check your inbox for the confirmation email.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendConfirmation}
                disabled={isResending}
                className="w-full border-yellow-600/50 text-yellow-300 hover:bg-yellow-900/40 hover:border-yellow-500"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Confirmation Email
                  </>
                )}
              </Button>
              <p className="text-xs text-yellow-400 text-center">
                Check your spam folder if you don&apos;t see the email.
              </p>
            </div>
          )}

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors">
                Sign up
              </Link>
            </p>
            <Link href="/auth/forgot-password" className="text-sm text-slate-400 hover:text-blue-400 hover:underline transition-colors block">
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

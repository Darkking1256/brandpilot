"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Mail, Lock, User, ArrowRight, Check, X, Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

// Password requirements
const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
]

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const supabase = createClient()

  // Check password requirements
  const passwordChecks = useMemo(() => {
    return PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      passed: req.test(password)
    }))
  }, [password])

  const allRequirementsMet = passwordChecks.every(req => req.passed)

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "Password must be at least 8 characters long."
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter."
    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter."
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number."
    return null
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptedTerms) {
      toast({
        title: "Terms required",
        description: "Please accept the terms of service and privacy policy.",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      })
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      toast({
        title: "Weak password",
        description: passwordError,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // #region agent log
    console.log('[DEBUG][HYP-D] Signup attempt starting:', { emailPrefix: email.substring(0, 5) + '***', hasPassword: !!password });
    // #endregion

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      
      // #region agent log
      console.log('[DEBUG][HYP-D] About to call supabase.auth.signUp:', { baseUrl });
      // #endregion

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
        },
      })

      // #region agent log
      console.log('[DEBUG][HYP-D] signUp call completed:', { hasData: !!data, hasError: !!error, errorMsg: error?.message, userId: data?.user?.id?.substring(0, 8) });
      // #endregion

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (data.user) {
        setIsSuccess(true)
        toast({
          title: "Account created!",
          description: "Please check your email and click the confirmation link to verify your account before signing in.",
        })
        // Don't redirect immediately - show success message on same page
        setPassword("")
        setConfirmPassword("")
      }
    } catch (error: any) {
      // #region agent log
      console.log('[DEBUG][HYP-E] Caught exception in signup:', { errorName: error?.name, errorMsg: error?.message, errorStack: error?.stack?.substring(0, 300) });
      // #endregion

      toast({
        title: "Signup failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950 to-blue-950 p-4 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-1/4 w-[700px] h-[700px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-1/4 left-1/4 w-[700px] h-[700px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        
        <Card className="w-full max-w-md border-2 border-slate-700/50 shadow-2xl bg-slate-900/50 backdrop-blur-xl relative z-10">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-3 shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Check your email</CardTitle>
            <CardDescription className="text-slate-400">
              We&apos;ve sent a confirmation email to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-900/20 backdrop-blur-xl border border-blue-600/50 rounded-lg">
              <p className="text-sm text-blue-300">
                Please check your inbox and click the confirmation link to verify your account. 
                You&apos;ll be able to sign in once your email is confirmed.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400 text-center">
                Didn&apos;t receive the email? Check your spam folder or try signing up again.
              </p>
              <Button
                onClick={() => {
                  setIsSuccess(false)
                  setEmail("")
                }}
                variant="outline"
                className="w-full border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-blue-500"
              >
                Try again
              </Button>
              <Link href="/auth/login" className="block">
                <Button variant="ghost" className="w-full text-slate-300 hover:bg-slate-800 hover:text-white">
                  Go to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
            Get Started
          </CardTitle>
          <CardDescription className="text-base text-slate-400">
            Create your MarketPilot AI account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2 text-slate-300">
                <User className="h-4 w-4 text-blue-400" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
              />
            </div>
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
                minLength={8}
              />
              {password && (
                <div className="space-y-1">
                  {passwordChecks.map((req) => (
                    <div key={req.id} className="flex items-center gap-2 text-xs">
                      {req.passed ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <X className="h-3 w-3 text-red-400" />
                      )}
                      <span className={req.passed ? "text-green-400" : "text-slate-500"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-slate-300">
                <Lock className="h-4 w-4 text-blue-400" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                disabled={isLoading}
                className="border-slate-600"
              />
              <Label htmlFor="terms" className="text-sm text-slate-400 leading-tight cursor-pointer">
                I agree to the{" "}
                <Link href="/terms" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading || !allRequirementsMet || !acceptedTerms}
            >
              {isLoading ? "Creating account..." : "Create Account"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


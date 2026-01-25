"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, Mail, ArrowRight, ArrowLeft, Plus } from "lucide-react"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      setIsSent(true)
      toast({
        title: "Email sent!",
        description: "Please check your email for password reset instructions.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  if (isSent) {
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
              <div className="rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 p-3 shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Check your email</CardTitle>
            <CardDescription className="text-slate-400">
              We&apos;ve sent password reset instructions to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400 text-center">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            <Button
              onClick={() => setIsSent(false)}
              variant="outline"
              className="w-full border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-blue-500"
            >
              Try again
            </Button>
            <Link href="/auth/login" className="block text-center">
              <Button variant="ghost" className="w-full text-slate-300 hover:bg-slate-800 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
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
            Reset Password
          </CardTitle>
          <CardDescription className="text-base text-slate-400">
            Enter your email and we&apos;ll send you reset instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
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
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-slate-400 hover:text-blue-400 hover:underline flex items-center justify-center gap-1 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Zap, BarChart3, Calendar, FileText, Wand2, TrendingUp, CheckCircle2, ArrowRight, Star, Mail, Users, Clock, Target, ChevronLeft, ChevronRight, Building2, ShoppingBag, Briefcase, Rocket } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = 0
    const endValue = end

    const updateCount = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = Math.floor(startValue + (endValue - startValue) * easeOutQuart)
      
      setCount(current)
      
      if (progress < 1) {
        requestAnimationFrame(updateCount)
      } else {
        setCount(endValue)
      }
    }

    updateCount()
  }, [end, duration])

  return <span>{count.toLocaleString()}{suffix}</span>
}

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isStatsVisible, setIsStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  const testimonials = [
    { quote: "MarketPilot AI has become my not-so-secret weapon in the world of marketing. It's a game-changer for creating captivating campaigns that leave a lasting impression on our audience.", author: "John Reynolds", role: "Marketing Maven at Peak Promotions" },
    { quote: "The automation features have transformed how we manage our social media presence. The AI-powered content suggestions are spot-on and save us hours every week.", author: "Sarah Chen", role: "Content Director at Digital Dynamics" },
    { quote: "The team collaboration features are fantastic. We can now manage multiple client accounts efficiently with proper approval workflows and role-based access.", author: "Michael Rodriguez", role: "Agency Owner at SocialPro" },
    { quote: "MarketPilot AI has revolutionized our e-commerce social media strategy. The product promotion features and analytics insights have increased our engagement by 300%.", author: "Dan Sawyer", role: "E-commerce Manager at TechStore" },
  ]

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsStatsVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current)
      }
    }
  }, [])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container flex h-20 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              MarketPilot AI
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#about" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group">
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group">
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#faq" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group">
              FAQs
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="hover:bg-slate-100 dark:hover:bg-slate-800">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center p-8 overflow-hidden min-h-[90vh]">
        {/* Enhanced Gradient Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/30 via-cyan-50/50 to-white dark:from-blue-950/30 dark:via-purple-950/20 dark:via-cyan-950/20 dark:to-background" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/30 via-purple-400/20 to-transparent rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400/30 via-purple-400/20 to-transparent rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        
        <div className="relative z-10 max-w-6xl w-full mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-cyan-100 dark:from-blue-900/40 dark:via-purple-900/40 dark:to-cyan-900/40 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-4 shadow-md border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            AI-Powered Social Media Management Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Manage, Schedule & Grow
            </span>
            <br />
            <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
              Your Social Media Presence
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
            All-in-one platform for scheduling posts, managing campaigns, analyzing performance, collaborating with teams, and automating your social media marketing across Twitter, LinkedIn, Facebook, Instagram, TikTok, and YouTube.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button asChild size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-white font-semibold">
              <Link href="/auth/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-10 py-7 border-2 border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 font-semibold">
              <Link href="/dashboard">Watch Demo</Link>
            </Button>
          </div>

          {/* Platform Logo Badges */}
          <div className="pt-12">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Connect & manage all your platforms:</p>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              {[
                { name: "Twitter", icon: "🐦", color: "from-blue-400 to-blue-600" },
                { name: "LinkedIn", icon: "💼", color: "from-blue-500 to-blue-700" },
                { name: "Facebook", icon: "📘", color: "from-blue-600 to-blue-800" },
                { name: "Instagram", icon: "📷", color: "from-pink-500 to-purple-600" },
                { name: "TikTok", icon: "🎵", color: "from-black to-gray-800" },
                { name: "YouTube", icon: "▶️", color: "from-red-500 to-red-700" },
              ].map((platform, idx) => (
                <div
                  key={idx}
                  className="group px-6 py-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:scale-105 flex items-center gap-2"
                >
                  <span className="text-2xl">{platform.icon}</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {platform.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Animated Counters */}
      <section ref={statsRef} className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: 10000, suffix: "+", label: "Active Users", gradient: "from-blue-400 to-cyan-400" },
              { icon: FileText, value: 1000000, suffix: "+", label: "Posts Scheduled", gradient: "from-purple-400 to-pink-400" },
              { icon: TrendingUp, value: 99, suffix: "%", label: "Uptime", gradient: "from-cyan-400 to-blue-400" },
              { icon: Clock, value: 24, suffix: "/7", label: "Support", gradient: "from-pink-400 to-purple-400" },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="text-center group">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {isStatsVisible ? (
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    ) : (
                      <span>0{stat.suffix}</span>
                    )}
                  </div>
                  <p className="text-sm md:text-base opacity-90 font-medium">{stat.label}</p>
                </div>
              )
            })}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold px-8" asChild>
              <Link href="/dashboard">
                Join Thousands of Marketers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gradient-to-b from-white via-blue-50/40 via-purple-50/20 to-white dark:from-background dark:via-blue-950/20 dark:via-purple-950/10 dark:to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                Features
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-100 dark:via-blue-100 dark:to-slate-100 bg-clip-text text-transparent">
              Powerful Features for Modern Marketers
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
              Everything you need to manage, grow, and optimize your social media presence—all in one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Wand2, title: "AI Content Generation", desc: "Generate engaging posts, optimize content for each platform, get hashtag suggestions, and repurpose content with AI assistance.", gradient: "from-purple-500 to-pink-500" },
              { icon: Calendar, title: "Smart Scheduling", desc: "Schedule posts across Twitter, LinkedIn, Facebook, Instagram, TikTok, and YouTube. Set recurring posts and optimize timing for maximum engagement.", gradient: "from-blue-500 to-cyan-500" },
              { icon: BarChart3, title: "Advanced Analytics", desc: "Track post performance, identify best posting times, analyze hashtag effectiveness, monitor competitors, and get actionable insights.", gradient: "from-cyan-500 to-blue-500" },
              { icon: FileText, title: "Team Collaboration", desc: "Work together with role-based permissions, content approval workflows, shared templates, and real-time activity feeds.", gradient: "from-indigo-500 to-purple-500" },
              { icon: Zap, title: "Automation Tools", desc: "Automate replies, recycle top-performing content, set up recurring posts, and schedule exports to save time and maintain consistency.", gradient: "from-yellow-500 to-orange-500" },
              { icon: TrendingUp, title: "Multi-Platform Management", desc: "Manage all your social media accounts from one dashboard. Connect and publish to 6+ platforms seamlessly.", gradient: "from-green-500 to-emerald-500" },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Card key={idx} className="group border-2 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold px-8" asChild>
              <Link href="/dashboard">
                Explore All Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-32 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-purple-950/20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                Use Cases
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-100 dark:via-blue-100 dark:to-slate-100 bg-clip-text text-transparent">
              Perfect for Every Type of Marketer
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-medium">
              Whether you&apos;re a solo creator, part of a growing business, or managing an agency, MarketPilot AI adapts to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: Users, 
                title: "Solo Marketers", 
                desc: "Perfect for individual creators and freelancers. Manage all your social accounts, schedule content, and track performance—all by yourself.", 
                gradient: "from-blue-500 to-cyan-500",
                features: ["Single-user dashboard", "AI content suggestions", "Basic analytics", "Free plan available"]
              },
              { 
                icon: Building2, 
                title: "Growing Businesses", 
                desc: "Scale your social media presence as your business grows. Collaborate with your team, automate workflows, and drive engagement.", 
                gradient: "from-purple-500 to-pink-500",
                features: ["Team collaboration", "Advanced analytics", "Automation tools", "Priority support"]
              },
              { 
                icon: ShoppingBag, 
                title: "E-commerce Brands", 
                desc: "Promote products, track campaigns, and drive sales through social media. Integrate with your store and automate product posts.", 
                gradient: "from-orange-500 to-red-500",
                features: ["Product promotion", "Campaign tracking", "Sales analytics", "Auto-scheduling"]
              },
              { 
                icon: Briefcase, 
                title: "Agencies", 
                desc: "Manage multiple client accounts efficiently. White-label options, custom reports, and advanced team features for agencies.", 
                gradient: "from-green-500 to-emerald-500",
                features: ["Multi-client management", "White-label options", "Custom reports", "Dedicated support"]
              },
            ].map((useCase, idx) => {
              const Icon = useCase.icon
              return (
                <Card key={idx} className="group border-2 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-3">
                      {useCase.title}
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {useCase.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {useCase.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 font-semibold" asChild>
                      <Link href="/auth/signup">Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-300 rounded-full blur-3xl animate-blob animation-delay-4000 opacity-50" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block">
              <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold border border-white/30">
                About Us
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              What is MarketPilot AI?
            </h2>
            <p className="text-xl opacity-95 leading-relaxed font-medium">
              MarketPilot AI is a comprehensive social media management and marketing automation platform that helps businesses and marketers streamline their social media presence. From content creation to analytics, team collaboration to automation—everything you need in one place.
            </p>
            <p className="text-lg opacity-85 leading-relaxed">
              Whether you&apos;re a solo marketer or part of a large team, MarketPilot AI provides the tools to schedule posts, analyze performance, collaborate effectively, and automate repetitive tasks across all major social media platforms.
            </p>
            <Button size="lg" variant="secondary" className="mt-8 bg-white text-blue-600 hover:bg-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold px-8" asChild>
              <Link href="/dashboard">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Step-by-Step Process Section */}
      <section className="py-32 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-purple-950/20 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                How It Works
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-100 dark:via-blue-100 dark:to-slate-100 bg-clip-text text-transparent">
              How MarketPilot AI Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-medium">
              Get started in minutes and transform your social media management workflow with our simple three-step process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-cyan-200 dark:from-blue-800 dark:via-purple-800 dark:to-cyan-800" />
            
            {[
              { step: "01", title: "Connect Your Platforms", desc: "Securely connect your social media accounts (Twitter, LinkedIn, Facebook, Instagram, TikTok, YouTube) with one-click OAuth authentication.", cta: "Connect Platforms", gradient: "from-blue-500 to-cyan-500" },
              { step: "02", title: "Create & Schedule Content", desc: "Use AI to generate content, upload media, schedule posts, or set up recurring content. Our smart scheduler optimizes posting times for maximum engagement.", cta: "Create Post", gradient: "from-purple-500 to-pink-500" },
              { step: "03", title: "Analyze & Optimize", desc: "Monitor performance with real-time analytics, identify what works best, automate responses, and continuously improve your social media strategy.", cta: "View Analytics", gradient: "from-cyan-500 to-blue-500" },
            ].map((item, idx) => (
              <Card key={idx} className="group border-2 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 text-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm relative">
                <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-xl text-white font-bold text-lg group-hover:scale-110 transition-all duration-300`}>
                  {item.step}
                </div>
                <CardHeader className="pt-8">
                  <CardTitle className="text-xl mb-4 font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-base mb-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </CardDescription>
                  <Button variant="outline" className="w-full border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 font-semibold" asChild>
                    <Link href="/dashboard">{item.cta}</Link>
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold px-8" asChild>
              <Link href="/dashboard">
                Start Your Journey Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Powerful AI Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">Powerful AI Features Built for Marketing</h2>
            <p className="text-lg text-muted-foreground mb-8 text-center">
              MarketPilot AI leverages advanced artificial intelligence to help you create better content, make smarter decisions, and grow your social media presence faster.
            </p>
            <div className="space-y-5">
              {[
                "AI-powered content generation and optimization for all platforms",
                "Smart scheduling recommendations based on engagement data",
                "Automated hashtag suggestions and performance tracking",
                "Intelligent content repurposing across multiple platforms",
                "Sentiment analysis for comments and messages",
                "Predictive analytics for post performance",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg text-slate-700 dark:text-slate-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold px-8" asChild>
                <Link href="/dashboard">
                  Try AI Features Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-300 rounded-full blur-3xl animate-blob animation-delay-4000 opacity-50" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold border border-white/30">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Why Choose MarketPilot AI?</h2>
            <p className="text-xl max-w-3xl mx-auto opacity-95 font-medium">
              Join thousands of marketers who trust MarketPilot AI to manage their social media presence efficiently and effectively.
            </p>
            <Button size="lg" variant="secondary" className="mt-8 bg-white text-blue-600 hover:bg-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold px-8" asChild>
              <Link href="/dashboard">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: "All-in-One Platform", desc: "No need to juggle multiple tools. Everything you need for social media management is in one place—scheduling, analytics, collaboration, and automation." },
              { title: "AI-Powered Insights", desc: "Leverage advanced AI to generate content, optimize posting times, analyze performance, and get actionable recommendations for growth." },
              { title: "Time-Saving Automation", desc: "Automate repetitive tasks like posting, replying, and recycling content. Focus on strategy while we handle the execution." },
            ].map((item, idx) => (
              <Card key={idx} className="text-center border-2 bg-white/10 backdrop-blur-md border-white/30 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 group">
                <CardHeader>
                  <CardTitle className="text-2xl mb-3 text-white font-bold group-hover:text-yellow-200 transition-colors">{item.title}</CardTitle>
                  <CardDescription className="text-base text-white/90 leading-relaxed">{item.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Creatives People Are Saying About Us</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              In user speeches about MarketPilot AI on our marketing automation platform, creativity takes the stage, showcasing the marketing brilliance this tool unlocks.
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {/* Carousel Container */}
            <div className="relative overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, idx) => (
                  <div key={idx} className="min-w-full px-4">
                    <Card className="border-2 hover:shadow-xl transition-all bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
                      <CardHeader className="text-center">
                        <div className="flex gap-1 mb-4 justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <CardDescription className="text-lg italic mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
                          &quot;{testimonial.quote}&quot;
                        </CardDescription>
                        <div>
                          <CardTitle className="text-xl mb-1">{testimonial.author}</CardTitle>
                          <CardDescription className="text-base">{testimonial.role}</CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full w-12 h-12 border-2 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-500 transition-all duration-300"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              {/* Dots Indicator */}
              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonial(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentTestimonial
                        ? "bg-blue-600 w-8"
                        : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                    }`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full w-12 h-12 border-2 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-500 transition-all duration-300"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-white to-blue-50/30 dark:from-background dark:to-blue-950/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose the plan that fits your needs. All plans include core features with no hidden fees. Start free and upgrade anytime.
            </p>
            <div className="inline-flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
              <button 
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!isAnnual ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isAnnual ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
              >
                Annually
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "STARTER", price: "$0", period: "/Month", level: "Perfect for individuals", features: ["Up to 3 platform connections", "50 scheduled posts per month", "Basic analytics & reports", "AI content generation", "Email support"], link: "/dashboard" },
              { name: "PROFESSIONAL", price: "$29", period: "/Month", level: "For growing businesses", features: ["Unlimited platform connections", "Unlimited scheduled posts", "Advanced analytics & reports", "Team collaboration (up to 5 members)", "Auto-reply & automation", "Social listening", "Priority support"], popular: true, link: "/dashboard" },
              { name: "ENTERPRISE", price: "$99", period: "/Month", level: "For agencies & large teams", features: ["Everything in Professional", "Unlimited team members", "Custom reports & API access", "White-label options", "Dedicated account manager", "24/7 premium support"], link: "/dashboard" },
            ].map((plan, idx) => (
              <Card key={idx} className={`border-2 hover:shadow-2xl transition-all duration-500 relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm ${plan.popular ? 'border-blue-500 dark:border-blue-500 shadow-2xl scale-105 ring-4 ring-blue-500/20 dark:ring-blue-500/30' : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:scale-105'}`}>
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white text-xs font-bold rounded-full shadow-xl">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="text-base">{plan.level}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full font-semibold transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 shadow-lg hover:shadow-xl hover:scale-105' : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50'}`} variant={plan.popular ? 'default' : 'outline'} asChild>
                    <Link href={plan.link || "/dashboard"}>{plan.name === "STARTER" ? "Start Free" : "Get Started"}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 font-semibold px-8" asChild>
              <Link href="/dashboard">Compare All Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Questions? We have Answers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our FAQ section, your quick guide to essential insights and solutions, addressing the most common queries about MarketPilot AI.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {[
                { question: "What is MarketPilot AI?", answer: "MarketPilot AI is an all-in-one social media management platform that helps you schedule posts, analyze performance, collaborate with teams, and automate your social media marketing across multiple platforms including Twitter, LinkedIn, Facebook, Instagram, TikTok, and YouTube." },
                { question: "Which social media platforms are supported?", answer: "We support Twitter/X, LinkedIn, Facebook, Instagram, TikTok, and YouTube. You can connect multiple accounts from each platform and manage them all from a single dashboard." },
                { question: "How does the AI content generation work?", answer: "Our AI analyzes your brand voice, target audience, and platform best practices to generate engaging content suggestions. You can also use AI to optimize existing content, suggest hashtags, and repurpose content for different platforms." },
                { question: "Can I collaborate with my team?", answer: "Yes! MarketPilot AI includes comprehensive team collaboration features with role-based permissions (Owner, Admin, Editor, Viewer), content approval workflows, shared templates, and real-time activity feeds." },
                { question: "What automation features are available?", answer: "You can automate recurring posts, set up auto-reply rules for messages, automatically recycle top-performing content, schedule exports, and more. Our automation helps you maintain a consistent presence without manual effort." },
                { question: "Is there a free trial?", answer: "Yes! Our Starter plan is completely free and includes core features like content scheduling, basic analytics, and AI content generation. You can upgrade anytime to unlock advanced features." },
              ].map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 font-semibold px-8" asChild>
              <Link href="/dashboard">Still Have Questions? Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-300 rounded-full blur-3xl animate-blob animation-delay-2000 opacity-50" />
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold border border-white/30">
              Newsletter
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Stay Updated with MarketPilot AI</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-95 font-medium">
            Get the latest tips, features, and updates delivered to your inbox. Learn about new platform integrations, AI improvements, and best practices for social media management.
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-white/10 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm focus:bg-white/20 focus:border-white/50 h-12"
            />
            <Button size="lg" variant="secondary" className="px-8 bg-white text-blue-600 hover:bg-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold h-12">
              Subscribe
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-80 flex items-center justify-center gap-2">
            <input type="checkbox" className="rounded border-white/50" />
            I agree to the Privacy Policy.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Social Media Management?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            Join thousands of marketers who trust MarketPilot AI to streamline their social media workflow. Start your free trial today—no credit card required.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-lg px-10 py-7 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold" asChild>
            <Link href="/dashboard">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 dark:bg-slate-900 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  MarketPilot AI
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your all-in-one social media management and marketing automation platform. Schedule, analyze, collaborate, and grow your presence across all major platforms.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/dashboard">Try Free</Link>
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#about" className="hover:text-blue-600">About</Link></li>
                <li><Link href="#features" className="hover:text-blue-600">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-blue-600">Pricing</Link></li>
                <li><Link href="#" className="hover:text-blue-600">FAQs</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Request API Access</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/login" className="hover:text-blue-600">Login</Link></li>
                <li><Link href="/auth/signup" className="hover:text-blue-600">Register</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon"><span className="sr-only">Facebook</span>📘</Button>
                <Button variant="ghost" size="icon"><span className="sr-only">Instagram</span>📷</Button>
                <Button variant="ghost" size="icon"><span className="sr-only">Twitter</span>🐦</Button>
                <Button variant="ghost" size="icon"><span className="sr-only">LinkedIn</span>💼</Button>
              </div>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2025 - All rights reserved by MarketPilot AI.
          </div>
        </div>
      </footer>
    </div>
  )
}

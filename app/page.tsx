"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sparkles, Zap, BarChart3, Calendar, FileText, Wand2, TrendingUp, CheckCircle2, ArrowRight, Star, Mail, Users, Clock, Target, ChevronLeft, ChevronRight, Building2, ShoppingBag, Briefcase, Rocket, User, Cpu, Plus, Twitter, Linkedin, Facebook, Instagram, Youtube } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"

// TikTok Icon Component (custom SVG since lucide doesn't have it)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  )
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = 0
    const endValue = end

    const updateCount = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      
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
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0)
  const statsRef = useRef<HTMLDivElement>(null)
  
  const heroSlides = [
    {
      badge: "AI makes content fast & easy",
      title: ["Crafting digital", "brilliance", "AI-Driven social media"],
      description: "All-in-one platform for scheduling posts, managing campaigns, and automating your social media marketing across all major platforms.",
      rightContent: "stats"
    },
    {
      badge: "Join thousands of happy creators",
      title: ["Empowering", "influencers", "Worldwide growth"],
      description: "Trusted by content creators, influencers, and brands to amplify their reach and engage with millions of followers.",
      rightContent: "influencer"
    },
    {
      badge: "Powerful dashboard at your fingertips",
      title: ["All your analytics", "in one place", "Data-driven decisions"],
      description: "Comprehensive analytics dashboard with real-time insights, performance tracking, and AI-powered recommendations.",
      rightContent: "dashboard"
    }
  ]

  const testimonials = [
    { quote: "MarketPilot AI has become my not-so-secret weapon in the world of marketing. It's a game-changer for creating captivating campaigns that leave a lasting impression on our audience.", author: "John Reynolds", role: "Marketing Maven at Peak Promotions" },
    { quote: "The automation features have transformed how we manage our social media presence. The AI-powered content suggestions are spot-on and save us hours every week.", author: "Sarah Chen", role: "Content Director at Digital Dynamics" },
    { quote: "The team collaboration features are fantastic. We can now manage multiple client accounts efficiently with proper approval workflows and role-based access.", author: "Michael Rodriguez", role: "Agency Owner at SocialPro" },
    { quote: "MarketPilot AI has revolutionized our e-commerce social media strategy. The product promotion features and analytics insights have increased our engagement by 300%.", author: "Dan Sawyer", role: "E-commerce Manager at TechStore" },
  ]

  // Auto-rotate hero slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

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
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Navigation - DARK background */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/80">
        <div className="container flex h-20 items-center justify-between px-6 mx-auto">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              MarketPilot AI
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors">
              About
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors">
              FAQs
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="hover:bg-slate-800/50 backdrop-blur-xl text-slate-300 hover:text-white">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 shadow-lg backdrop-blur-xl">
              <Link href="/dashboard">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Braine Style with DARK gradient */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-blue-950">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-1/4 w-[700px] h-[700px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Hero Carousel */}
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentHeroSlide * 100}%)` }}
            >
              {heroSlides.map((slide, slideIdx) => (
                <div key={slideIdx} className="min-w-full">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                        <Zap className="h-4 w-4" />
                        {slide.badge}
                      </div>
                      
                      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                        <span className="block text-white">{slide.title[0]}</span>
                        <span className="block text-white">{slide.title[1]}</span>
                        <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                          {slide.title[2]}
                        </span>
                      </h1>

                      <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                        {slide.description}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button asChild size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 shadow-lg">
                          <Link href="/dashboard">Get started free</Link>
                        </Button>
                      </div>
                    </div>

                    {/* Right Side - Dynamic Content */}
                    <div className="relative">
                      {slide.rightContent === "stats" && (
                        <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50 animate-float">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                              <User className="h-8 w-8 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-white">Sara Ven</h3>
                              <p className="text-sm text-slate-400">Social media manager</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-400">Efficiency</span>
                                <span className="text-2xl font-bold text-blue-400">90%</span>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{width: "90%"}}></div>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-slate-700">
                              <p className="text-sm text-slate-400 mb-2">Annual goal</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">$98,541</span>
                                <span className="text-lg font-semibold text-green-400">110%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {slide.rightContent === "influencer" && (
                        <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 animate-float">
                          <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center overflow-hidden relative">
                            {/* TODO: Replace with real influencer image */}
                            {/* <Image src="/path/to/influencer-image.jpg" alt="Happy Influencer" fill className="object-cover" /> */}
                            
                            {/* Placeholder for influencer image */}
                            <div className="text-center p-8 z-10">
                              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                                <User className="w-16 h-16 text-white" />
                              </div>
                              <h3 className="text-2xl font-bold text-white mb-2">Happy Creator</h3>
                              <div className="flex items-center justify-center gap-2 mb-3">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                <p className="text-slate-100 font-semibold">10M+ Followers</p>
                              </div>
                              <p className="text-sm text-slate-200 italic mt-4 max-w-xs mx-auto">
                                &quot;MarketPilot AI transformed my content strategy and doubled my engagement!&quot;
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {slide.rightContent === "dashboard" && (
                        <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-slate-700/50 animate-float">
                          <div className="aspect-video rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-4 relative overflow-hidden">
                            {/* TODO: Replace with real dashboard screenshot */}
                            {/* <Image src="/path/to/dashboard-screenshot.png" alt="Dashboard Preview" fill className="object-cover rounded-lg" /> */}
                            
                            {/* Dashboard mockup */}
                            <div className="space-y-3 relative z-10">
                              <div className="flex gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="h-16 rounded-lg bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/40 flex items-center justify-center">
                                  <Calendar className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="h-16 rounded-lg bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/40 flex items-center justify-center">
                                  <Users className="w-6 h-6 text-purple-400" />
                                </div>
                              </div>
                              <div className="h-32 rounded-lg bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-end justify-around p-2">
                                  {[40, 65, 45, 80, 55, 70].map((height, i) => (
                                    <div key={i} className="w-8 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t" style={{ height: `${height}%` }}></div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <div className="flex-1 h-12 rounded-lg bg-slate-700/50 flex items-center px-3">
                                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                  <div className="text-xs text-slate-400">Active</div>
                                </div>
                                <div className="flex-1 h-12 rounded-lg bg-slate-700/50 flex items-center px-3">
                                  <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                                  <div className="text-xs text-slate-400">+23%</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-center mt-4 text-sm text-slate-400 font-medium">Real-time Analytics Dashboard</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Navigation Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentHeroSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentHeroSlide
                      ? "bg-blue-500 w-8"
                      : "bg-slate-700/70 w-2 hover:w-4"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integration Orbital Section - AIMug Style */}
      <section className="relative py-32 bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-blue-600 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-indigo-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        
        {/* Animated decorative plus signs */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, idx) => {
            const positions = [
              { top: '10%', left: '15%' },
              { top: '20%', right: '12%' },
              { bottom: '15%', left: '20%' },
              { bottom: '25%', right: '18%' },
              { top: '40%', left: '8%' },
              { top: '60%', right: '10%' },
              { top: '15%', left: '45%' },
              { top: '75%', left: '40%' },
              { top: '30%', right: '35%' },
              { bottom: '40%', left: '55%' },
              { top: '80%', right: '45%' },
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

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Orbital Container */}
          <div className="relative w-full h-[700px] md:h-[800px] mx-auto flex items-center justify-center">
            {/* Central MarketPilot Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse-glow"></div>
                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-xl border-2 border-blue-500/50 flex flex-col items-center justify-center gap-4 animate-float group-hover:scale-110 transition-all duration-500 cursor-pointer">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 flex items-center justify-center shadow-2xl">
                    <Sparkles className="w-12 h-12 md:w-14 md:h-14 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      MarketPilot
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Orbiting Platform Cards */}
            {[
              { name: "Twitter", Icon: Twitter, gradient: "from-blue-400 to-blue-600", angle: 0 },
              { name: "LinkedIn", Icon: Linkedin, gradient: "from-blue-500 to-blue-700", angle: 60 },
              { name: "Facebook", Icon: Facebook, gradient: "from-blue-600 to-blue-800", angle: 120 },
              { name: "Instagram", Icon: Instagram, gradient: "from-pink-500 to-purple-600", angle: 180 },
              { name: "TikTok", Icon: TikTokIcon, gradient: "from-slate-700 to-slate-900", angle: 240 },
              { name: "YouTube", Icon: Youtube, gradient: "from-red-500 to-red-700", angle: 300 },
            ].map((feature, idx) => {
              // Use a fixed radius for SSR compatibility, will adjust on client if needed
              const radius = 280
              const angleRad = (feature.angle * Math.PI) / 180
              const x = radius * Math.cos(angleRad)
              const y = radius * Math.sin(angleRad)
              const PlatformIcon = feature.Icon
              
              return (
                <div
                  key={idx}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  }}
                >
                  <div className="relative group cursor-pointer">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-300`}></div>
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 group-hover:border-blue-500 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-110 hover:-translate-y-2"
                      style={{
                        animationDelay: `${idx * 0.5}s`,
                      }}
                    >
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}>
                        <PlatformIcon className="w-7 h-7 md:w-9 md:h-9 text-white" />
                      </div>
                      <p className="text-white text-xs md:text-sm font-semibold text-center px-2">
                        {feature.name}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Info badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">10,000+ Active Users</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">6 Platforms Integrated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Prominent Solutions Style */}
      <section id="features" className="py-32 bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-0 w-[700px] h-[700px] bg-blue-600 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-1/4 right-0 w-[700px] h-[700px] bg-indigo-600 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center mb-16 p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50">
            <p className="text-blue-400 font-semibold mb-4">Our AI Solutions</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Generative AI Designed for creators.<br />Make your Life Easier with MarketPilot
            </h2>
          </div>

          {/* Feature 1 - AI Content Generation (Large Prominent) */}
          <div className="mb-12 p-8 md:p-12 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 group">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
                  <Wand2 className="h-4 w-4" />
                  AI Content Generation
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Write ✍️ Better Content Faster, The Future of AI Writing Tools is Finally here
                </h3>
                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  Generate engaging posts, optimize content for each platform, and get AI-powered hashtag suggestions automatically.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Platform-specific content optimization for maximum engagement</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Smart hashtag suggestions based on trending topics</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Save and reuse your best-performing content templates</span>
                  </li>
                </ul>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </div>
              <div className="relative h-80 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 flex items-center justify-center overflow-hidden">
                <Wand2 className="w-24 h-24 text-purple-400 opacity-50" />
              </div>
            </div>
          </div>

          {/* Features 2 & 3 - Side by Side */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Smart Scheduling */}
            <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 group">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
                <Calendar className="h-4 w-4" />
                Smart Scheduling
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Schedule posts across all platforms with intelligent timing ⏰
              </h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Our smart scheduler optimizes posting times for maximum engagement across Twitter, LinkedIn, Facebook, Instagram, TikTok, and YouTube.
              </p>
              <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10" asChild>
                <Link href="/dashboard">Start Scheduling</Link>
              </Button>
            </div>

            {/* Advanced Analytics */}
            <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 group">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
                <BarChart3 className="h-4 w-4" />
                Advanced Analytics
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Track post performance 📊 and get actionable insights for growth
              </h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Identify best posting times, analyze hashtag effectiveness, monitor competitors, and get AI-powered recommendations.
              </p>
              <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10" asChild>
                <Link href="/dashboard">View Analytics</Link>
              </Button>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Team Collaboration", desc: "Work together with role-based permissions and approval workflows", gradient: "from-indigo-500 to-purple-500" },
              { icon: Zap, title: "Automation Tools", desc: "Automate replies and recycle top-performing content", gradient: "from-orange-500 to-red-500" },
              { icon: TrendingUp, title: "Multi-Platform Management", desc: "Manage all social accounts from one unified dashboard", gradient: "from-green-500 to-emerald-500" },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 text-center group">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Section - Solutions Style with Social Media Examples */}
      <section id="about" className="py-32 bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="p-8 md:p-12 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  About us
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  Crafting Your Digital Narrative —<br />Discover Our Journey
                </h2>
                <p className="text-lg text-slate-200 leading-relaxed mb-6">
                  MarketPilot AI is a comprehensive social media management and marketing automation platform that helps businesses and marketers streamline their social media presence.
                </p>
                <p className="text-base text-slate-300 leading-relaxed mb-6">
                  From content creation to analytics, team collaboration to automation—everything you need to manage Twitter, LinkedIn, Facebook, Instagram, TikTok, and YouTube in one place.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Schedule and publish to 6+ social platforms</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>AI-powered content generation and optimization</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Advanced analytics and performance tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Team collaboration with approval workflows</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Smart automation to save time</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Real-time insights and reporting</span>
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Cross-platform content repurposing</span>
                  </li>
                </ul>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-lg font-bold">4.7</span>
                    <span className="text-sm text-slate-300">Customer rating</span>
                  </div>
                </div>
                
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                  <Link href="/dashboard">Get Started Free</Link>
                </Button>
              </div>

              {/* Right Side - Social Media Post Gallery (Overlapping Layout) */}
              <div className="relative h-[500px]">
                {/* Background decorative shape */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>

                {/* Twitter Post - Top Left */}
                <div className="absolute top-0 left-0 w-40 p-3 rounded-xl bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:z-30 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Twitter className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-slate-400">Twitter</span>
                  </div>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-2">
                    <Twitter className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-xs text-slate-300">Post preview</p>
                </div>

                {/* LinkedIn Post - Top Right */}
                <div className="absolute top-8 right-0 w-40 p-3 rounded-xl bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 hover:border-blue-600/50 transition-all duration-300 hover:scale-105 hover:z-30 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Linkedin className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-slate-400">LinkedIn</span>
                  </div>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-600/20 to-blue-800/20 flex items-center justify-center mb-2">
                    <Linkedin className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-slate-300">Professional</p>
                </div>

                {/* Instagram Post - Center Large */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 p-4 rounded-xl bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 z-10 shadow-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    <span className="text-xs text-slate-400 font-semibold">Instagram</span>
                  </div>
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-pink-500/30 to-purple-600/30 mb-2 flex items-center justify-center border border-pink-500/30">
                    <Instagram className="w-16 h-16 text-pink-400" />
                  </div>
                  <p className="text-xs text-slate-300 font-medium">Visual content</p>
                </div>

                {/* Facebook Post - Bottom Left */}
                <div className="absolute bottom-12 left-4 w-36 p-3 rounded-xl bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 hover:border-blue-700/50 transition-all duration-300 hover:scale-105 hover:z-30 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Facebook className="w-3 h-3 text-blue-700" />
                    <span className="text-xs text-slate-400">Facebook</span>
                  </div>
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-700/20 to-blue-900/20 flex items-center justify-center mb-2">
                    <Facebook className="w-6 h-6 text-blue-700" />
                  </div>
                  <p className="text-xs text-slate-300">Business</p>
                </div>

                {/* YouTube Post - Bottom Right */}
                <div className="absolute bottom-8 right-8 w-40 p-3 rounded-xl bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 hover:border-red-600/50 transition-all duration-300 hover:scale-105 hover:z-30 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Youtube className="w-3 h-3 text-red-600" />
                    <span className="text-xs text-slate-400">YouTube</span>
                  </div>
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-red-600/20 to-red-800/20 flex items-center justify-center mb-2">
                    <Youtube className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-xs text-slate-300">Video</p>
                </div>

                {/* TikTok Post - Middle Left */}
                <div className="absolute top-32 left-12 w-32 p-3 rounded-xl bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 hover:border-slate-500/50 transition-all duration-300 hover:scale-105 hover:z-30 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TikTokIcon className="w-3 h-3 text-slate-300" />
                    <span className="text-xs text-slate-400">TikTok</span>
                  </div>
                  <div className="aspect-[9/16] rounded-lg bg-gradient-to-br from-slate-700/20 to-slate-900/20 flex items-center justify-center mb-2">
                    <TikTokIcon className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-xs text-slate-300">Short</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - 3 Steps with DARK gradient */}
      <section className="py-32 bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/3 w-[700px] h-[700px] bg-indigo-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 right-1/3 w-[700px] h-[700px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
        
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16 p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50">
            <p className="text-blue-400 font-semibold mb-4">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              MarketPilot AI typically operates in<br />a three steps
            </h2>
            <Button variant="outline" className="border-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-blue-500 hover:text-white" asChild>
              <Link href="/dashboard">Know more</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-slate-800 -z-10" />
            
            {[
              { 
                step: "step 01", 
                title: "Connect Your Platforms", 
                desc: "Securely connect your social media accounts with one-click OAuth authentication across Twitter, LinkedIn, Facebook, Instagram, TikTok, and YouTube.",
                icon: Building2
              },
              { 
                step: "step 02", 
                title: "Create & Schedule Content", 
                desc: "Use AI to generate content, upload media, schedule posts, or set up recurring content with our smart scheduler.",
                icon: Calendar
              },
              { 
                step: "step 03", 
                title: "Analyze & Optimize", 
                desc: "Monitor performance with real-time analytics, identify what works best, and continuously improve your strategy.",
                icon: BarChart3
              },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="relative">
                  <Card className="text-center border-2 border-slate-700/50 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 bg-slate-900/50 backdrop-blur-xl relative z-10">
                    <CardHeader className="pb-6">
                      <div className="inline-flex w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 items-center justify-center shadow-lg">
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                      <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">{item.step}</div>
                      <CardTitle className="text-xl mb-4 text-white">{item.title}</CardTitle>
                      <CardDescription className="text-slate-400 leading-relaxed">
                        {item.desc}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section - DARK gradient */}
      <section ref={statsRef} className="py-32 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-0 w-[700px] h-[700px] bg-blue-600 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/2 right-0 w-[700px] h-[700px] bg-indigo-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="p-12 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: 8000, suffix: "+", label: "Active Customers" },
              { icon: FileText, value: 100000, suffix: "+", label: "Posts Created" },
              { icon: TrendingUp, value: 99, suffix: "%", label: "Success Rate" },
              { icon: Clock, value: 24, suffix: "/7", label: "Support" },
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="group">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-white">
                    {isStatsVisible ? (
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    ) : (
                      <span>0{stat.suffix}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 font-medium">{stat.label}</p>
                </div>
              )
            })}
          </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - DARK gradient */}
      <section className="py-32 bg-gradient-to-b from-slate-950 via-slate-950 to-blue-950 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/3 left-1/4 w-[700px] h-[700px] bg-indigo-600 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
        
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16 p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50">
            <p className="text-blue-400 font-semibold mb-4">Why choose us</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
              Reasons to choose our<br />platform
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "✓", text: "More than 8,000 customers have experimented with MarketPilot AI" },
              { icon: "✓", text: "AI-powered automation saves you hours every week" },
              { icon: "✓", text: "Seamless integration with all major social platforms" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-6 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  {item.icon}
                </div>
                <p className="text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - DARK gradient */}
      <section className="py-32 bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-blue-600 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-indigo-600 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
        
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <div className="text-center mb-16 p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50">
            <p className="text-blue-400 font-semibold mb-4">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              What our respectable<br />clients say
            </h2>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, idx) => (
                  <div key={idx} className="min-w-full px-4">
                    <Card className="border-2 border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
                      <CardHeader className="text-center p-8">
                        <div className="flex gap-1 mb-6 justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <CardDescription className="text-lg italic mb-8 text-slate-300 leading-relaxed">
                          &quot;{testimonial.quote}&quot;
                        </CardDescription>
                        <div>
                          <CardTitle className="text-xl mb-1 text-white">{testimonial.author}</CardTitle>
                          <CardDescription className="text-slate-400">{testimonial.role}</CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full border-2 border-slate-700/50 hover:bg-slate-800/50 hover:border-blue-500 text-white backdrop-blur-xl"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonial(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentTestimonial
                        ? "bg-blue-500 w-8"
                        : "bg-slate-700/70 w-2"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full border-2 border-slate-700/50 hover:bg-slate-800/50 hover:border-blue-500 text-white backdrop-blur-xl"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - DARK gradient */}
      <section id="pricing" className="py-32 bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-1/4 left-0 w-[700px] h-[700px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16 p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50">
            <p className="text-blue-400 font-semibold mb-4">Our Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
              Join for free Today
            </h2>
            <div className="inline-flex items-center gap-2 p-1 bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700/50">
              <button 
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${!isAnnual ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isAnnual ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Annual
                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                name: "Free", 
                subtitle: "Perfect for getting started",
                monthlyPrice: 0,
                annualPrice: 0,
                features: [
                  "5 scheduled posts/month",
                  "1 social account",
                  "Basic analytics",
                  "Standard support"
                ],
                cta: "Get Started Free"
              },
              { 
                name: "Pro", 
                subtitle: "For serious content creators",
                monthlyPrice: 29,
                annualPrice: 278,
                popular: true,
                features: [
                  "Unlimited scheduled posts",
                  "10 social accounts",
                  "Advanced analytics",
                  "AI content generation",
                  "Video editing & export",
                  "Priority support"
                ],
                cta: "Start 14-day free trial"
              },
              { 
                name: "Enterprise", 
                subtitle: "For teams and agencies",
                monthlyPrice: 99,
                annualPrice: 950,
                features: [
                  "Everything in Pro",
                  "Unlimited social accounts",
                  "Unlimited AI generations",
                  "Team collaboration",
                  "API access",
                  "White-label options",
                  "Dedicated support"
                ],
                cta: "Start 14-day free trial"
              },
            ].map((plan, idx) => {
              const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice
              const originalAnnualPrice = plan.monthlyPrice * 12
              const savings = originalAnnualPrice - plan.annualPrice
              
              return (
                <Card key={idx} className={`relative border-2 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 ${plan.popular ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105' : 'border-slate-700/50 hover:border-blue-500'} bg-slate-900/50 backdrop-blur-xl`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl mb-2 text-white">{plan.name}</CardTitle>
                    <p className="text-sm text-slate-400 mb-4">{plan.subtitle}</p>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-white">${displayPrice}</span>
                      <span className="text-slate-400">{isAnnual ? '/year' : '/mo'}</span>
                    </div>
                    {isAnnual && plan.monthlyPrice > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm text-slate-500 line-through">${originalAnnualPrice}/year</p>
                        <p className="text-sm text-green-400 font-medium">Save ${savings}/year (20% off)</p>
                      </div>
                    )}
                    {!isAnnual && plan.monthlyPrice > 0 && (
                      <p className="text-sm text-slate-500">Billed monthly</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className={`w-full font-semibold ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'border-slate-700 hover:bg-slate-800 hover:border-blue-500 text-white'}`} variant={plan.popular ? 'default' : 'outline'} asChild>
                      <Link href={plan.monthlyPrice === 0 ? "/auth/signup" : "/dashboard/billing"}>{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section with DARK gradient */}
      <section id="faq" className="py-32 bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-blue-600 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-1/4 w-[700px] h-[700px] bg-indigo-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <div className="text-center mb-16 p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50">
            <p className="text-blue-400 font-semibold mb-4">faq</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Frequently asked questions
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Everything you need to know about MarketPilot AI
            </p>
            <Button variant="outline" className="border-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-blue-500 hover:text-white" asChild>
              <Link href="#contact">Contact now</Link>
            </Button>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              { 
                question: "How does your AI copywriting tool work?", 
                answer: "Our AI analyzes your brand voice, target audience, and platform best practices to generate engaging content suggestions. You can use AI to optimize existing content, suggest hashtags, and repurpose content for different platforms."
              },
              { 
                question: "What is AI copywriting?", 
                answer: "AI copywriting uses advanced machine learning models to generate, optimize, and suggest content for your social media posts. It helps you create engaging content faster while maintaining your brand voice."
              },
              { 
                question: "Can I trust the content generated by AI?", 
                answer: "Yes! Our AI is trained on best practices and high-quality content. However, we always recommend reviewing and customizing AI-generated content to match your specific brand voice and requirements."
              },
              { 
                question: "What types of content can your AI generate?", 
                answer: "Our AI can generate social media posts, captions, hashtags, blog post ideas, ad copy, and more. It's optimized for Twitter, LinkedIn, Facebook, Instagram, TikTok, and YouTube content formats."
              },
              { 
                question: "What languages does your AI support?", 
                answer: "Currently, our AI primarily supports English content generation. We're actively working on expanding language support to serve a global audience."
              },
            ].map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-2 border-slate-700/50 rounded-xl px-6 bg-slate-900/50 backdrop-blur-xl hover:border-blue-500/50 transition-colors">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Newsletter Section - Darker gradient */}
      <section className="py-32 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-1/3 w-[700px] h-[700px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
        <div className="container mx-auto px-6 text-center max-w-2xl relative z-10">
          <div className="p-12 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50">
            <p className="text-blue-400 font-semibold mb-4">Newsletter</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Craft your next great content now.
            </h2>
            <p className="text-xl text-slate-200 mb-10">
              Subscribe to get the latest tips, features, and updates delivered to your inbox.
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-xl h-12"
              />
              <Button size="lg" variant="secondary" className="px-8 bg-white text-blue-600 hover:bg-slate-100 h-12 shadow-lg hover:shadow-xl transition-all duration-300">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - DARK gradient */}
      <footer className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 py-16 border-t border-slate-800/50 relative overflow-hidden">
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-slate-600 rounded-full blur-3xl animate-blob" />
        </div>
        
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="p-12 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  MarketPilot AI
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Your all-in-one social media management platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Services</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#features" className="hover:text-blue-400 transition-colors">AI-powered copywriting</Link></li>
                <li><Link href="#features" className="hover:text-blue-400 transition-colors">Social media management</Link></li>
                <li><Link href="#features" className="hover:text-blue-400 transition-colors">Analytics & insights</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Resources</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#faq" className="hover:text-blue-400 transition-colors">FAQs</Link></li>
                <li><Link href="#about" className="hover:text-blue-400 transition-colors">About</Link></li>
                <li><Link href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">About us</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/auth/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
                <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Sign up</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/50 pt-8 text-center text-sm text-slate-500">
            © 2025 MarketPilot AI. All rights reserved.
          </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

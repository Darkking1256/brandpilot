"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, BarChart3, FileText, TrendingUp, ArrowUpRight, Plus, Clock, Users, Zap, Activity, ArrowRight, Download, ChevronDown, Eye, Target, MessageSquare, Share2, Settings, RefreshCw } from "lucide-react"
import { cn } from "@/utils/cn"
import Link from "next/link"
import { CreatePostForm } from "@/components/forms/create-post-form"
import { CreateCampaignForm } from "@/components/forms/create-campaign-form"
import { useToast } from "@/hooks/use-toast"
import { EngagementChart } from "@/components/charts/engagement-chart"
import { PerformanceChart } from "@/components/charts/performance-chart"
import { TrendChart } from "@/components/charts/trend-chart"
import { PlatformDistributionChart } from "@/components/charts/pie-chart"
import { StatsCardSkeleton, ChartSkeleton } from "@/components/skeletons/card-skeleton"
import { getPosts, getCampaigns } from "@/lib/api"
import type { Post } from "@/components/posts-table"
import type { Campaign } from "@/components/campaigns-table"
import { AIAnalyticsInsights } from "@/components/ai/ai-analytics-insights"
import { useRealtimePosts } from "@/hooks/use-realtime-posts"
import { useRealtimeCampaigns } from "@/hooks/use-realtime-campaigns"
import { useOnboarding } from "@/components/onboarding/onboarding-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Sparkles, X } from "lucide-react"
import { ContentSuggestions } from "@/components/ai/content-suggestions"
import { QuickStats } from "@/components/stats/quick-stats"
import { PostRecycling } from "@/components/recycling/post-recycling"
import { subDays, startOfDay, endOfDay, isAfter, isBefore, format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }
  
  if (seconds < 60) return "just now"
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`
    }
  }
  
  return "just now"
}

type DateRange = "7d" | "30d" | "90d" | "all"

export default function DashboardPage() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false)
  const [showGuestBanner, setShowGuestBanner] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>("7d")
  const { toast } = useToast()
  const { startTour, hasCompletedOnboarding, completeOnboarding } = useOnboarding()

  // Check if user is authenticated (guest mode)
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/user/profile')
        if (response.status === 401 || response.status === 403) {
          setIsGuest(true)
          setShowGuestBanner(true)
        }
      } catch (error) {
        setIsGuest(true)
        setShowGuestBanner(true)
      }
    }
    checkAuth()
  }, [])

  // Show welcome banner and auto-start tour for new users
  useEffect(() => {
    if (!hasCompletedOnboarding && !isGuest) {
      setShowWelcomeBanner(true)
      // Auto-start tour after a short delay
      const timer = setTimeout(() => {
        startTour()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [hasCompletedOnboarding, startTour, isGuest])

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [fetchedPosts, fetchedCampaigns] = await Promise.all([
        getPosts(),
        getCampaigns(),
      ])
      setPosts(fetchedPosts)
      setCampaigns(fetchedCampaigns)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Use real-time updates for live dashboard
  const realtimePosts = useRealtimePosts(posts)
  const realtimeCampaigns = useRealtimeCampaigns(campaigns)
  
  // Update when real-time data changes
  useEffect(() => {
    if (realtimePosts.length > 0 || posts.length === 0) {
      setPosts(realtimePosts)
    }
  }, [realtimePosts])
  
  useEffect(() => {
    if (realtimeCampaigns.length > 0 || campaigns.length === 0) {
      setCampaigns(realtimeCampaigns)
    }
  }, [realtimeCampaigns])

  const handlePostCreated = () => {
    fetchData()
  }

  const handleCampaignCreated = () => {
    fetchData()
  }

  const handleCreatePostClick = () => {
    if (isGuest) {
      toast({
        title: "Account Required",
        description: "Please create a free account to start creating posts.",
        variant: "default",
      })
      window.location.href = `/auth/signup?redirect=${encodeURIComponent(window.location.pathname)}`
      return
    }
    setIsCreatePostOpen(true)
  }

  const handleCreateCampaignClick = () => {
    if (isGuest) {
      toast({
        title: "Account Required",
        description: "Please create a free account to start creating campaigns.",
        variant: "default",
      })
      window.location.href = `/auth/signup?redirect=${encodeURIComponent(window.location.pathname)}`
      return
    }
    setIsCreateCampaignOpen(true)
  }

  // Calculate date ranges for comparison
  const getDateRange = (range: DateRange) => {
    const now = new Date()
    const end = endOfDay(now)
    let start: Date
    
    switch (range) {
      case "7d":
        start = startOfDay(subDays(now, 7))
        break
      case "30d":
        start = startOfDay(subDays(now, 30))
        break
      case "90d":
        start = startOfDay(subDays(now, 90))
        break
      default:
        start = new Date(0) // All time
    }
    return { start, end }
  }

  // Filter posts and campaigns by date range
  const filteredPosts = useMemo(() => {
    const { start, end } = getDateRange(dateRange)
    return posts.filter((post) => {
      const postDate = new Date(post.createdAt || post.scheduledDate || new Date())
      return isAfter(postDate, start) && isBefore(postDate, end)
    })
  }, [posts, dateRange])

  const filteredCampaigns = useMemo(() => {
    const { start, end } = getDateRange(dateRange)
    return campaigns.filter((campaign) => {
      const campaignDate = new Date(campaign.createdAt || campaign.startDate || new Date())
      return isAfter(campaignDate, start) && isBefore(campaignDate, end)
    })
  }, [campaigns, dateRange])

  // Calculate previous period for comparison
  const getPreviousPeriod = (range: DateRange) => {
    const now = new Date()
    const currentEnd = endOfDay(now)
    let currentStart: Date
    let previousStart: Date
    let previousEnd: Date
    
    switch (range) {
      case "7d":
        currentStart = startOfDay(subDays(now, 7))
        previousEnd = startOfDay(subDays(now, 7))
        previousStart = startOfDay(subDays(now, 14))
        break
      case "30d":
        currentStart = startOfDay(subDays(now, 30))
        previousEnd = startOfDay(subDays(now, 30))
        previousStart = startOfDay(subDays(now, 60))
        break
      case "90d":
        currentStart = startOfDay(subDays(now, 90))
        previousEnd = startOfDay(subDays(now, 90))
        previousStart = startOfDay(subDays(now, 180))
        break
      default:
        // For "all", compare last 30 days vs previous 30 days
        currentStart = startOfDay(subDays(now, 30))
        previousEnd = startOfDay(subDays(now, 30))
        previousStart = startOfDay(subDays(now, 60))
    }
    return { currentStart, currentEnd, previousStart, previousEnd }
  }

  // Calculate stats from filtered data
  const currentStats = useMemo(() => {
    const scheduledPosts = filteredPosts.filter((p) => p.status === "scheduled").length
    const activeCampaigns = filteredCampaigns.filter((c) => c.status === "active").length
    const publishedPosts = filteredPosts.filter((p) => p.status === "published").length
    const engagementRate = filteredPosts.length > 0 
      ? Math.round((publishedPosts / filteredPosts.length) * 100) 
      : 0
    
    return { scheduledPosts, activeCampaigns, publishedPosts, engagementRate }
  }, [filteredPosts, filteredCampaigns])

  // Calculate previous period stats
  const previousStats = useMemo(() => {
    const { previousStart, previousEnd } = getPreviousPeriod(dateRange)
    
    const prevPosts = posts.filter((post) => {
      const postDate = new Date(post.createdAt || post.scheduledDate || new Date())
      return isAfter(postDate, previousStart) && isBefore(postDate, previousEnd)
    })
    
    const prevCampaigns = campaigns.filter((campaign) => {
      const campaignDate = new Date(campaign.createdAt || campaign.startDate || new Date())
      return isAfter(campaignDate, previousStart) && isBefore(campaignDate, previousEnd)
    })
    
    const scheduledPosts = prevPosts.filter((p) => p.status === "scheduled").length
    const activeCampaigns = prevCampaigns.filter((c) => c.status === "active").length
    const publishedPosts = prevPosts.filter((p) => p.status === "published").length
    const engagementRate = prevPosts.length > 0 
      ? Math.round((publishedPosts / prevPosts.length) * 100) 
      : 0
    
    return { scheduledPosts, activeCampaigns, publishedPosts, engagementRate }
  }, [posts, campaigns, dateRange])

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number): { value: string; trend: "up" | "down" | "neutral" } => {
    if (previous === 0) {
      return current > 0 ? { value: "+100%", trend: "up" } : { value: "0%", trend: "neutral" }
    }
    const change = ((current - previous) / previous) * 100
    const rounded = Math.round(change * 10) / 10
    if (rounded > 0) {
      return { value: `+${rounded}%`, trend: "up" }
    } else if (rounded < 0) {
      return { value: `${rounded}%`, trend: "down" }
    }
    return { value: "0%", trend: "neutral" }
  }

  const scheduledChange = calculateChange(currentStats.scheduledPosts, previousStats.scheduledPosts)
  const campaignsChange = calculateChange(currentStats.activeCampaigns, previousStats.activeCampaigns)
  const publishedChange = calculateChange(currentStats.publishedPosts, previousStats.publishedPosts)
  const engagementChange = calculateChange(currentStats.engagementRate, previousStats.engagementRate)

  // Quick Actions Configuration
  const quickActions = [
    {
      title: "Create New Post",
      description: "Schedule content for your social media platforms",
      icon: Calendar,
      onClick: handleCreatePostClick,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Start Campaign",
      description: "Launch a new marketing campaign",
      icon: BarChart3,
      onClick: handleCreateCampaignClick,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "Repurpose Content",
      description: "Use AI to adapt content for different platforms",
      icon: FileText,
      href: "/dashboard/repurpose",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    },
  ]

  // Generate dynamic recent activity from posts and campaigns
  const recentActivity = useMemo(() => {
    const activities: Array<{
      type: "post" | "campaign"
      action: string
      item: string
      time: string
      icon: typeof Calendar | typeof BarChart3 | typeof FileText
      timestamp: Date
    }> = []

    // Add post activities
    posts.slice(0, 5).forEach((post) => {
      const date = new Date(post.createdAt || new Date())
      let action = "Created"
      if (post.status === "scheduled") action = "Scheduled"
      else if (post.status === "published") action = "Published"
      else if (post.status === "failed") action = "Failed"

      activities.push({
        type: "post",
        action,
        item: post.content.substring(0, 40) + (post.content.length > 40 ? "..." : ""),
        time: formatTimeAgo(date),
        icon: Calendar,
        timestamp: date,
      })
    })

    // Add campaign activities
    campaigns.slice(0, 5).forEach((campaign) => {
      const date = new Date(campaign.createdAt || new Date())
      let action = "Created"
      if (campaign.status === "active") action = "Activated"
      else if (campaign.status === "paused") action = "Paused"
      else if (campaign.status === "completed") action = "Completed"

      activities.push({
        type: "campaign",
        action,
        item: campaign.name,
        time: formatTimeAgo(date),
        icon: BarChart3,
        timestamp: date,
      })
    })

    // Sort by timestamp (most recent first) and take top 5
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5)
  }, [posts, campaigns])

  const stats = [
    {
      title: "Scheduled Posts",
      value: currentStats.scheduledPosts.toString(),
      description: "Ready to publish",
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
      change: scheduledChange.value,
      trend: scheduledChange.trend
    },
    {
      title: "Active Campaigns",
      value: currentStats.activeCampaigns.toString(),
      description: "Currently running",
      icon: BarChart3,
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20",
      change: campaignsChange.value,
      trend: campaignsChange.trend
    },
    {
      title: "Published Posts",
      value: currentStats.publishedPosts.toString(),
      description: dateRange === "7d" ? "Last 7 days" : dateRange === "30d" ? "Last 30 days" : dateRange === "90d" ? "Last 90 days" : "All time",
      icon: FileText,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
      change: publishedChange.value,
      trend: publishedChange.trend
    },
    {
      title: "Engagement Rate",
      value: `${currentStats.engagementRate}%`,
      description: "Average across platforms",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      change: engagementChange.value,
      trend: engagementChange.trend
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
      {/* Animated background blobs */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 space-y-8 p-6 md:p-8 lg:p-10">
        {/* Welcome Banner for New Users */}
        {showWelcomeBanner && (
          <div className="p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Welcome to MarketPilot AI! 🎉
                  </h3>
                  <p className="text-slate-300 mb-4">
                    We&apos;re starting a quick tour to help you get familiar with the platform. You can skip it anytime or restart it from the help icon.
                  </p>
                  <div className="flex gap-3">
                    <Button size="sm" onClick={startTour} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                      Start Tour
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:border-slate-600"
                      onClick={() => {
                        setShowWelcomeBanner(false)
                        completeOnboarding()
                      }}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                onClick={() => {
                  setShowWelcomeBanner(false)
                  completeOnboarding()
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Guest Mode Banner */}
        {showGuestBanner && isGuest && (
          <div className="p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    🎉 Welcome to MarketPilot AI - Guest Mode
                  </h3>
                  <p className="text-slate-300 mb-4">
                    You&apos;re exploring in guest mode! Create a free account to connect your social media accounts and start managing your content.
                  </p>
                  <div className="flex gap-3">
                    <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 shadow-lg">
                      <Link href="/auth/signup">Create Free Account</Link>
                    </Button>
                    <Button size="sm" asChild variant="outline" className="border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:border-slate-600">
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                onClick={() => setShowGuestBanner(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="text-center mb-16 p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Dashboard <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Overview</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Welcome back! Here&apos;s what&apos;s happening with your social media marketing today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-700/50 bg-slate-900/50 backdrop-blur-xl text-slate-300 hover:bg-slate-800/50 hover:border-blue-500/50">
                  <Clock className="h-4 w-4 mr-2" />
                  {dateRange === "7d" ? "Last 7 days" : dateRange === "30d" ? "Last 30 days" : dateRange === "90d" ? "Last 90 days" : "All time"}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900/95 border-slate-700 backdrop-blur-xl">
                <DropdownMenuItem onClick={() => setDateRange("7d")} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                  Last 7 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateRange("30d")} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                  Last 30 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateRange("90d")} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                  Last 90 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateRange("all")} className="text-slate-300 hover:bg-slate-800 hover:text-white">
                  All time
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg backdrop-blur-xl">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button size="sm" variant="outline" className="border-slate-700/50 bg-slate-900/50 backdrop-blur-xl text-slate-300 hover:bg-slate-800/50 hover:border-blue-500/50">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.title}
                className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                    {stat.title}
                  </div>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md group-hover:scale-110 transition-transform">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className={cn(
                    "text-xs font-semibold px-2 py-1 rounded-full",
                    stat.trend === "up"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : stat.trend === "down"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                  )}>
                    {stat.change}
                  </div>
                </div>
                <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
                  {stat.description}
                </p>
              </div>
            )
          })}
        </div>

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Analytics Charts Section */}
        <div className="lg:col-span-8 space-y-8">
          {/* Engagement Overview */}
          <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Engagement Overview
                </h3>
                <p className="text-slate-400">
                  Track your content performance across all platforms
                </p>
              </div>
              <Button variant="ghost" size="sm" className="border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl text-slate-400 hover:text-white hover:border-blue-500/50">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
            <div className="pt-2">
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <EngagementChart posts={filteredPosts} />
              )}
            </div>
          </div>

          {/* Platform Performance */}
          <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  Platform Performance
                </h3>
                <p className="text-slate-400">
                  Compare engagement across different social media platforms
                </p>
              </div>
              <Button variant="ghost" size="sm" className="border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl text-slate-400 hover:text-white hover:border-purple-500/50">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
            <div className="pt-2">
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <PerformanceChart posts={filteredPosts} />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Actions */}
          <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Quick Actions</h3>
              <p className="text-slate-400 text-sm">Frequently used features</p>
            </div>
            <div className="space-y-3">
              {quickActions.map((action, idx) => {
                const Icon = action.icon

                if (action.href) {
                  return (
                    <Link key={idx} href={action.href}>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer group">
                        <div className={cn("p-2 rounded-lg", action.bgColor)}>
                          <Icon className={cn("h-4 w-4", action.color)} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                            {action.title}
                          </p>
                          <p className="text-xs text-slate-500">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </Link>
                  )
                }

                return (
                  <div
                    key={idx}
                    onClick={action.onClick}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all duration-300 cursor-pointer group"
                    data-tour={idx === 0 ? "create-post" : undefined}
                  >
                    <div className={cn("p-2 rounded-lg", action.bgColor)}>
                      <Icon className={cn("h-4 w-4", action.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                        {action.title}
                      </p>
                      <p className="text-xs text-slate-500">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-green-500/50 transition-all duration-500">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                Recent Activity
              </h3>
              <p className="text-slate-400 text-sm">Latest updates and actions</p>
            </div>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm text-slate-500">No recent activity</p>
                </div>
              ) : (
                <>
                  {recentActivity.slice(0, 4).map((activity, idx) => {
                    const Icon = activity.icon
                    return (
                      <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-slate-800/40 backdrop-blur-xl border border-slate-700/50">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">
                            <span className="text-green-400">{activity.action}</span> {activity.item}
                          </p>
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                      </div>
                    )
                  })}
                  <Button variant="ghost" size="sm" className="w-full border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl text-slate-400 hover:text-white hover:border-green-500/50 mt-4" asChild>
                    <Link href="/dashboard/scheduler">
                      View All Activity
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-500">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow-md">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                Platform Distribution
              </h3>
              <p className="text-slate-400 text-sm">Content across platforms</p>
            </div>
            <div className="pt-2">
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <PlatformDistributionChart posts={filteredPosts} />
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="p-6 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Create New Post</h4>
            <p className="text-slate-400 text-sm mb-4">Schedule content for your platforms</p>
            <Button
              onClick={handleCreatePostClick}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              Create Post
            </Button>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Start Campaign</h4>
            <p className="text-slate-400 text-sm mb-4">Launch a new marketing campaign</p>
            <Button
              onClick={handleCreateCampaignClick}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Start Campaign
            </Button>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-green-500/50 transition-all duration-500 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Repurpose Content</h4>
            <p className="text-slate-400 text-sm mb-4">Use AI to adapt content</p>
            <Button
              asChild
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Link href="/dashboard/repurpose">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>

    <CreatePostForm
      open={isCreatePostOpen}
      onOpenChange={setIsCreatePostOpen}
      onSubmit={handlePostCreated}
    />
    <CreateCampaignForm
      open={isCreateCampaignOpen}
      onOpenChange={setIsCreateCampaignOpen}
      onSubmit={handleCampaignCreated}
    />
    </div>
  )
}

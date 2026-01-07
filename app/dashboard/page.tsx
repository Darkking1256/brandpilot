"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, BarChart3, FileText, TrendingUp, ArrowUpRight, Plus, Clock, Users, Zap, Activity, ArrowRight, Download, ChevronDown } from "lucide-react"
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
  const [dateRange, setDateRange] = useState<DateRange>("7d")
  const { toast } = useToast()
  const { startTour, hasCompletedOnboarding, completeOnboarding } = useOnboarding()

  // Show welcome banner and auto-start tour for new users
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      setShowWelcomeBanner(true)
      // Auto-start tour after a short delay
      const timer = setTimeout(() => {
        startTour()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [hasCompletedOnboarding, startTour])

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
      onClick: () => setIsCreatePostOpen(true),
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Start Campaign",
      description: "Launch a new marketing campaign",
      icon: BarChart3,
      onClick: () => setIsCreateCampaignOpen(true),
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
    <>
    <div className="space-y-8">
      {/* Welcome Banner for New Users */}
      {showWelcomeBanner && (
        <Alert className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 dark:border-blue-800">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Welcome to MarketPilot AI! 🎉
          </AlertTitle>
          <AlertDescription className="mt-2 text-blue-800 dark:text-blue-200">
            <p>We&apos;re starting a quick tour to help you get familiar with the platform. You can skip it anytime or restart it from the help icon.</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={startTour} className="bg-blue-600 hover:bg-blue-700">
                Start Tour
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setShowWelcomeBanner(false)
                  completeOnboarding()
                }}
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={() => {
              setShowWelcomeBanner(false)
              completeOnboarding()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Welcome back! Here&apos;s what&apos;s happening with your marketing today.
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                {dateRange === "7d" ? "Last 7 days" : dateRange === "30d" ? "Last 30 days" : dateRange === "90d" ? "Last 90 days" : "All time"}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDateRange("7d")}>
                Last 7 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("30d")}>
                Last 30 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("90d")}>
                Last 90 days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("all")}>
                All time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                <Plus className="h-4 w-4 mr-2" />
                Quick Create
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsCreatePostOpen(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Create Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsCreateCampaignOpen(true)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Start Campaign
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/repurpose">
                  <FileText className="h-4 w-4 mr-2" />
                  Repurpose Content
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card 
              key={stat.title}
              className={cn(
                "relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group",
                `bg-gradient-to-br ${stat.bgGradient}`
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground/80">
                  {stat.title}
                </CardTitle>
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-br shadow-md group-hover:scale-110 transition-transform",
                  stat.gradient
                )}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between mb-1">
                  <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className={cn(
                    "text-xs font-semibold px-2 py-1 rounded-full",
                    stat.trend === "up" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                      : stat.trend === "down"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                  )}>
                    {stat.change}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {stat.description}
                  <ArrowUpRight className="h-3 w-3 opacity-50" />
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Quick Actions</h2>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3" data-tour="quick-actions">
              {quickActions.map((action, idx) => {
                const Icon = action.icon
                
                if (action.href) {
                  return (
                    <Link key={idx} href={action.href}>
                      <Card className={cn(
                        "border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group",
                        action.bgColor
                      )}>
                        <CardHeader>
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3", action.bgColor)}>
                            <Icon className={cn("h-6 w-6", action.color)} />
                          </div>
                          <CardTitle className="text-lg">{action.title}</CardTitle>
                          <CardDescription className="text-sm">{action.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  )
                }
                
                return (
                  <div 
                    key={idx} 
                    onClick={action.onClick}
                    data-tour={idx === 0 ? "create-post" : undefined}
                  >
                    <Card className={cn(
                      "border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group",
                      action.bgColor
                    )}>
                      <CardHeader>
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3", action.bgColor)}>
                          <Icon className={cn("h-6 w-6", action.color)} />
                        </div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                        <CardDescription className="text-sm">{action.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Engagement Chart */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Engagement Trends</CardTitle>
                  <CardDescription>Weekly engagement and reach metrics</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = "/dashboard/analytics"}
                >
                  View Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <EngagementChart posts={filteredPosts} />
              )}
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Platform Performance</CardTitle>
                  <CardDescription>Compare performance across platforms</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/analytics/export-pdf", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          dateRange: { start: getDateRange(dateRange).start, end: getDateRange(dateRange).end },
                          type: "performance",
                        }),
                      })
                      if (response.ok) {
                        const blob = await response.blob()
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `performance-report-${format(new Date(), "yyyy-MM-dd")}.pdf`
                        document.body.appendChild(a)
                        a.click()
                        window.URL.revokeObjectURL(url)
                        document.body.removeChild(a)
                        toast({
                          title: "Export successful",
                          description: "Performance report has been downloaded.",
                        })
                      }
                    } catch (error) {
                      toast({
                        variant: "destructive",
                        title: "Export failed",
                        description: "Failed to export performance report.",
                      })
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <PerformanceChart posts={filteredPosts} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Insights */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">No recent activity</p>
                    <p className="text-xs text-muted-foreground">Create your first post or campaign to see activity here</p>
                  </div>
                ) : (
                  <>
                    {recentActivity.map((activity, idx) => {
                      const Icon = activity.icon
                      return (
                        <div key={idx} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              <span className="text-blue-600">{activity.action}</span> {activity.item}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                          </div>
                        </div>
                      )
                    })}
                    <Button variant="ghost" className="w-full mt-2" asChild>
                      <Link href="/dashboard/scheduler">
                        View All Activity
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Platform Distribution
              </CardTitle>
              <CardDescription>Content distribution across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <PlatformDistributionChart posts={filteredPosts} />
              )}
            </CardContent>
          </Card>

          {/* Growth Trend */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Growth Trend
              </CardTitle>
              <CardDescription>Monthly growth trajectory</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <TrendChart posts={filteredPosts} />
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <AIAnalyticsInsights type="posts" />

          {/* Quick Stats */}
          <QuickStats />

          {/* Post Recycling */}
          <PostRecycling />
        </div>
      </div>

      {/* Content Suggestions Section */}
      <ContentSuggestions />
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
    </>
  )
}

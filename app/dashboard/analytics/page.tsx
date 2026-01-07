"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Download, TrendingUp, TrendingDown, BarChart3, FileText, Eye, MousePointerClick, DollarSign, Target } from "lucide-react"
import { EngagementChart } from "@/components/charts/engagement-chart"
import { PerformanceChart } from "@/components/charts/performance-chart"
import { TrendChart } from "@/components/charts/trend-chart"
import { PlatformDistributionChart } from "@/components/charts/pie-chart"
import { useToast } from "@/hooks/use-toast"
import { getPosts, getCampaigns, getAds } from "@/lib/api"
import { format, subDays, startOfDay, endOfDay, isAfter, isBefore } from "date-fns"
import { LoadingButton } from "@/components/loading-button"
import { PostPerformanceComparison } from "@/components/analytics/post-performance-comparison"
import { BestTimeToPost } from "@/components/analytics/best-time-to-post"
import { HashtagPerformance } from "@/components/analytics/hashtag-performance"
import { CompetitorAnalysis } from "@/components/analytics/competitor-analysis"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCardSkeleton, ChartSkeleton } from "@/components/skeletons/card-skeleton"
import { EmptyState } from "@/components/empty-states/empty-state"

type DateRange = {
  start: Date
  end: Date
}

type ComparisonPeriod = "previous" | "custom" | null

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date(),
  })
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>("previous")
  const [comparisonDateRange, setComparisonDateRange] = useState<DateRange | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Data states
  const [posts, setPosts] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [fetchedPosts, fetchedCampaigns, fetchedAds] = await Promise.all([
          getPosts(),
          getCampaigns(),
          getAds(),
        ])
        setPosts(fetchedPosts)
        setCampaigns(fetchedCampaigns)
        setAds(fetchedAds)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
        toast({
          variant: "destructive",
          title: "Failed to load analytics",
          description: "There was an error loading your analytics data.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter data by date range
  const filteredData = useMemo(() => {
    const start = startOfDay(dateRange.start)
    const end = endOfDay(dateRange.end)

    const filteredPosts = posts.filter((post) => {
      const postDate = new Date(post.scheduledDate || post.created_at)
      return !isBefore(postDate, start) && !isAfter(postDate, end)
    })

    const filteredCampaigns = campaigns.filter((campaign) => {
      const campaignDate = new Date(campaign.startDate || campaign.created_at)
      return !isBefore(campaignDate, start) && !isAfter(campaignDate, end)
    })

    const filteredAds = ads.filter((ad) => {
      const adDate = new Date(ad.start_date || ad.created_at)
      return !isBefore(adDate, start) && !isAfter(adDate, end)
    })

    return { posts: filteredPosts, campaigns: filteredCampaigns, ads: filteredAds }
  }, [posts, campaigns, ads, dateRange])

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    if (!comparisonPeriod) return null

    let compareStart: Date
    let compareEnd: Date

    if (comparisonPeriod === "previous") {
      const periodLength = dateRange.end.getTime() - dateRange.start.getTime()
      compareEnd = dateRange.start
      compareStart = new Date(compareEnd.getTime() - periodLength)
    } else if (comparisonDateRange) {
      compareStart = comparisonDateRange.start
      compareEnd = comparisonDateRange.end
    } else {
      return null
    }

    const start = startOfDay(compareStart)
    const end = endOfDay(compareEnd)

    const filteredPosts = posts.filter((post) => {
      const postDate = new Date(post.scheduledDate || post.created_at)
      return !isBefore(postDate, start) && !isAfter(postDate, end)
    })

    const filteredCampaigns = campaigns.filter((campaign) => {
      const campaignDate = new Date(campaign.startDate || campaign.created_at)
      return !isBefore(campaignDate, start) && !isAfter(campaignDate, end)
    })

    const filteredAds = ads.filter((ad) => {
      const adDate = new Date(ad.start_date || ad.created_at)
      return !isBefore(adDate, start) && !isAfter(adDate, end)
    })

    return { posts: filteredPosts, campaigns: filteredCampaigns, ads: filteredAds }
  }, [posts, campaigns, ads, comparisonPeriod, comparisonDateRange, dateRange])

  // Calculate metrics
  const currentMetrics = useMemo(() => {
    const publishedPosts = filteredData.posts.filter((p) => p.status === "published").length
    const activeCampaigns = filteredData.campaigns.filter((c) => c.status === "active").length
    const totalAdSpend = filteredData.ads.reduce((sum, ad) => sum + (ad.spend || 0), 0)
    const totalImpressions = filteredData.ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0)
    const totalClicks = filteredData.ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0)
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

    return {
      publishedPosts,
      activeCampaigns,
      totalAdSpend,
      totalImpressions,
      totalClicks,
      avgCTR,
    }
  }, [filteredData])

  const comparisonMetrics = useMemo(() => {
    if (!comparisonData) return null

    const publishedPosts = comparisonData.posts.filter((p) => p.status === "published").length
    const activeCampaigns = comparisonData.campaigns.filter((c) => c.status === "active").length
    const totalAdSpend = comparisonData.ads.reduce((sum, ad) => sum + (ad.spend || 0), 0)
    const totalImpressions = comparisonData.ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0)
    const totalClicks = comparisonData.ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0)
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

    return {
      publishedPosts,
      activeCampaigns,
      totalAdSpend,
      totalImpressions,
      totalClicks,
      avgCTR,
    }
  }, [comparisonData])

  // Calculate percentage changes
  const percentageChanges = useMemo(() => {
    if (!comparisonMetrics) return null

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    return {
      publishedPosts: calculateChange(currentMetrics.publishedPosts, comparisonMetrics.publishedPosts),
      activeCampaigns: calculateChange(currentMetrics.activeCampaigns, comparisonMetrics.activeCampaigns),
      totalAdSpend: calculateChange(currentMetrics.totalAdSpend, comparisonMetrics.totalAdSpend),
      totalImpressions: calculateChange(currentMetrics.totalImpressions, comparisonMetrics.totalImpressions),
      totalClicks: calculateChange(currentMetrics.totalClicks, comparisonMetrics.totalClicks),
      avgCTR: calculateChange(currentMetrics.avgCTR, comparisonMetrics.avgCTR),
    }
  }, [currentMetrics, comparisonMetrics])

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/analytics/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRange,
          comparisonPeriod,
          comparisonDateRange,
          metrics: currentMetrics,
          comparisonMetrics,
          percentageChanges,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to export PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-report-${format(dateRange.start, "yyyy-MM-dd")}-to-${format(dateRange.end, "yyyy-MM-dd")}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "PDF exported",
        description: "Your analytics report has been downloaded.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export PDF",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="section-header border-0 pb-0 mb-0">
        <div>
          <h1 className="section-title text-3xl">Analytics</h1>
          <p className="section-subtitle">
            Detailed insights and performance metrics
          </p>
        </div>
        <LoadingButton onClick={handleExportPDF} isLoading={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          Export PDF Report
        </LoadingButton>
      </div>

      {/* Date Range & Comparison Controls */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Date Range & Comparison</CardTitle>
          <CardDescription>Select date range and compare with previous period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={format(dateRange.start, "yyyy-MM-dd")}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: new Date(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={format(dateRange.end, "yyyy-MM-dd")}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: new Date(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Select</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                onChange={(e) => {
                  const days = Number(e.target.value)
                  if (days > 0) {
                    setDateRange({
                      start: subDays(new Date(), days),
                      end: new Date(),
                    })
                  }
                }}
              >
                <option value="">Select period</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Compare With</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={comparisonPeriod || ""}
                onChange={(e) => {
                  const value = e.target.value
                  setComparisonPeriod(value === "" ? null : (value as ComparisonPeriod))
                }}
              >
                <option value="">No comparison</option>
                <option value="previous">Previous period</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
          </div>

          {comparisonPeriod === "custom" && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Comparison Start Date</label>
                <Input
                  type="date"
                  value={comparisonDateRange ? format(comparisonDateRange.start, "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    setComparisonDateRange({
                      ...(comparisonDateRange || { start: new Date(), end: new Date() }),
                      start: new Date(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Comparison End Date</label>
                <Input
                  type="date"
                  value={comparisonDateRange ? format(comparisonDateRange.end, "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    setComparisonDateRange({
                      ...(comparisonDateRange || { start: new Date(), end: new Date() }),
                      end: new Date(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Cards with Comparison */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
              <FileText className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentMetrics.publishedPosts}</div>
              {percentageChanges && (
                <div className="flex items-center gap-1 mt-2">
                  {percentageChanges.publishedPosts >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm ${
                      percentageChanges.publishedPosts >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {percentageChanges.publishedPosts >= 0 ? "+" : ""}
                    {percentageChanges.publishedPosts.toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">vs previous</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Target className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentMetrics.activeCampaigns}</div>
              {percentageChanges && (
                <div className="flex items-center gap-1 mt-2">
                  {percentageChanges.activeCampaigns >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm ${
                      percentageChanges.activeCampaigns >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {percentageChanges.activeCampaigns >= 0 ? "+" : ""}
                    {percentageChanges.activeCampaigns.toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">vs previous</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Ad Spend</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${currentMetrics.totalAdSpend.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              {percentageChanges && (
                <div className="flex items-center gap-1 mt-2">
                  {percentageChanges.totalAdSpend >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm ${
                      percentageChanges.totalAdSpend >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {percentageChanges.totalAdSpend >= 0 ? "+" : ""}
                    {percentageChanges.totalAdSpend.toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">vs previous</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/20 dark:to-sky-950/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
              <Eye className="h-5 w-5 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {currentMetrics.totalImpressions.toLocaleString()}
              </div>
              {percentageChanges && (
                <div className="flex items-center gap-1 mt-2">
                  {percentageChanges.totalImpressions >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm ${
                      percentageChanges.totalImpressions >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {percentageChanges.totalImpressions >= 0 ? "+" : ""}
                    {percentageChanges.totalImpressions.toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">vs previous</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {currentMetrics.totalClicks.toLocaleString()}
              </div>
              {percentageChanges && (
                <div className="flex items-center gap-1 mt-2">
                  {percentageChanges.totalClicks >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm ${
                      percentageChanges.totalClicks >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {percentageChanges.totalClicks >= 0 ? "+" : ""}
                    {percentageChanges.totalClicks.toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">vs previous</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
              <BarChart3 className="h-5 w-5 text-rose-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentMetrics.avgCTR.toFixed(2)}%</div>
              {percentageChanges && (
                <div className="flex items-center gap-1 mt-2">
                  {percentageChanges.avgCTR >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm ${
                      percentageChanges.avgCTR >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {percentageChanges.avgCTR >= 0 ? "+" : ""}
                    {percentageChanges.avgCTR.toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">vs previous</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Engagement Trends</CardTitle>
            <CardDescription>
              {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : filteredData.posts.length > 0 ? (
              <EngagementChart posts={filteredData.posts} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>No data for selected period</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Performance by Platform</CardTitle>
            <CardDescription>
              {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : filteredData.posts.length > 0 ? (
              <PerformanceChart posts={filteredData.posts} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>No data for selected period</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>
              {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : filteredData.posts.length > 0 ? (
              <TrendChart posts={filteredData.posts} />
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <p>No data for selected period</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>
              {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : filteredData.posts.length > 0 ? (
              <PlatformDistributionChart posts={filteredData.posts} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>No data for selected period</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="timing">Best Times</TabsTrigger>
          <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {isLoading ? (
            <Card className="border-2 p-6">
              <ChartSkeleton />
            </Card>
          ) : filteredData.posts.length > 0 ? (
            <PostPerformanceComparison
              posts={filteredData.posts.map((post: any) => ({
                id: post.id,
                content: post.content,
                platform: post.platform,
                postedAt: post.scheduledDate || post.created_at,
                impressions: post.impressions || 0,
                reach: post.reach || 0,
                likes: post.likes || 0,
                comments: post.comments || 0,
                shares: post.shares || 0,
                clicks: post.clicks || 0,
                engagementRate: post.engagement_rate || 0,
              }))}
            />
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No performance data"
              description="Publish some posts to see performance comparisons here."
            />
          )}
        </TabsContent>

        <TabsContent value="timing" className="space-y-6">
          {isLoading ? (
            <Card className="border-2 p-6">
              <ChartSkeleton />
            </Card>
          ) : (
            <BestTimeToPost
              data={(() => {
                // Generate timing data from actual posts
                const timingMap = new Map<string, { postCount: number; totalEngagement: number }>()
                
                filteredData.posts.forEach((post: any) => {
                  const date = new Date(post.scheduledDate || post.created_at)
                  const day = date.getDay()
                  const hour = date.getHours()
                  const key = `${day}-${hour}`
                  
                  const existing = timingMap.get(key) || { postCount: 0, totalEngagement: 0 }
                  timingMap.set(key, {
                    postCount: existing.postCount + 1,
                    totalEngagement: existing.totalEngagement + (post.likes || 0) + (post.comments || 0) + (post.shares || 0),
                  })
                })
                
                return Array.from({ length: 168 }, (_, i) => {
                  const day = Math.floor(i / 24)
                  const hour = i % 24
                  const key = `${day}-${hour}`
                  const data = timingMap.get(key) || { postCount: 0, totalEngagement: 0 }
                  
                  return {
                    day,
                    hour,
                    postCount: data.postCount,
                    avgEngagementRate: data.postCount > 0 ? data.totalEngagement / data.postCount : 0,
                    totalEngagement: data.totalEngagement,
                  }
                })
              })()}
            />
          )}
        </TabsContent>

        <TabsContent value="hashtags" className="space-y-6">
          {isLoading ? (
            <Card className="border-2 p-6">
              <ChartSkeleton />
            </Card>
          ) : (
            <HashtagPerformance
              hashtags={(() => {
                // Extract hashtags from actual posts
                const hashtagMap = new Map<string, { platform: string; usageCount: number; totalEngagement: number; firstUsedAt: string; lastUsedAt: string }>()
                
                filteredData.posts.forEach((post: any) => {
                  const hashtags = post.content?.match(/#\w+/g) || []
                  hashtags.forEach((hashtag: string) => {
                    const existing = hashtagMap.get(hashtag)
                    const engagement = (post.likes || 0) + (post.comments || 0) + (post.shares || 0)
                    const postDate = post.scheduledDate || post.created_at
                    
                    if (existing) {
                      hashtagMap.set(hashtag, {
                        platform: existing.platform,
                        usageCount: existing.usageCount + 1,
                        totalEngagement: existing.totalEngagement + engagement,
                        firstUsedAt: postDate < existing.firstUsedAt ? postDate : existing.firstUsedAt,
                        lastUsedAt: postDate > existing.lastUsedAt ? postDate : existing.lastUsedAt,
                      })
                    } else {
                      hashtagMap.set(hashtag, {
                        platform: post.platform,
                        usageCount: 1,
                        totalEngagement: engagement,
                        firstUsedAt: postDate,
                        lastUsedAt: postDate,
                      })
                    }
                  })
                })
                
                return Array.from(hashtagMap.entries())
                  .map(([hashtag, data]) => ({
                    hashtag,
                    platform: data.platform,
                    usageCount: data.usageCount,
                    totalEngagement: data.totalEngagement,
                    avgEngagementRate: data.usageCount > 0 ? data.totalEngagement / data.usageCount : 0,
                    firstUsedAt: data.firstUsedAt,
                    lastUsedAt: data.lastUsedAt,
                  }))
                  .sort((a, b) => b.totalEngagement - a.totalEngagement)
                  .slice(0, 20)
              })()}
            />
          )}
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <CompetitorAnalysis
            competitors={[]}
            posts={[]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}


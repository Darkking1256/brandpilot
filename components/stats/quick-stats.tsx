"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, RefreshCw, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface QuickStats {
  totalPosts: number
  totalEngagement: number
  avgEngagementRate: number
  topPlatform: string
  bestPost: {
    content: string
    engagement: number
    platform: string
  } | null
}

export function QuickStats() {
  const [stats, setStats] = useState<QuickStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/analytics/quick-stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        throw new Error("Failed to fetch stats")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load stats",
        description: "Could not fetch quick stats. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (isLoading && !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Stats
          </CardTitle>
          <Button size="sm" variant="outline" onClick={fetchStats} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Posts</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{stats.totalEngagement.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Engagement</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{stats.avgEngagementRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">Avg Engagement Rate</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold capitalize">{stats.topPlatform}</div>
            <div className="text-xs text-muted-foreground mt-1">Top Platform</div>
          </div>
        </div>
        {stats.bestPost && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold">Best Performing Post</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {stats.bestPost.content}...
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Badge variant="secondary" className="capitalize">
                {stats.bestPost.platform}
              </Badge>
              <span className="text-muted-foreground">
                {stats.bestPost.engagement.toLocaleString()} engagements
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


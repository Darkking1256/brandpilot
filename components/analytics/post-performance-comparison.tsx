"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, BarChart3, Users, Heart, MessageSquare, Share2 } from "lucide-react"
import { cn } from "@/utils/cn"

interface PostPerformance {
  id: string
  content: string
  platform: string
  postedAt: string
  impressions: number
  reach: number
  likes: number
  comments: number
  shares: number
  clicks: number
  engagementRate: number
}

interface PostPerformanceComparisonProps {
  posts: PostPerformance[]
  comparisonPeriod?: "week" | "month" | "quarter"
}

export function PostPerformanceComparison({
  posts,
  comparisonPeriod = "month",
}: PostPerformanceComparisonProps) {
  const [sortBy, setSortBy] = useState<"engagement" | "impressions" | "likes">("engagement")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")

  const sortedPosts = useMemo(() => {
    let filtered = posts

    if (selectedPlatform !== "all") {
      filtered = filtered.filter((p) => p.platform === selectedPlatform)
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "engagement":
          return b.engagementRate - a.engagementRate
        case "impressions":
          return b.impressions - a.impressions
        case "likes":
          return b.likes - a.likes
        default:
          return 0
      }
    })
  }, [posts, sortBy, selectedPlatform])

  const avgMetrics = useMemo(() => {
    if (sortedPosts.length === 0) return null

    const totals = sortedPosts.reduce(
      (acc, post) => ({
        impressions: acc.impressions + post.impressions,
        reach: acc.reach + post.reach,
        likes: acc.likes + post.likes,
        comments: acc.comments + post.comments,
        shares: acc.shares + post.shares,
        clicks: acc.clicks + post.clicks,
        engagementRate: acc.engagementRate + post.engagementRate,
      }),
      {
        impressions: 0,
        reach: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        clicks: 0,
        engagementRate: 0,
      }
    )

    const count = sortedPosts.length
    return {
      impressions: Math.round(totals.impressions / count),
      reach: Math.round(totals.reach / count),
      likes: Math.round(totals.likes / count),
      comments: Math.round(totals.comments / count),
      shares: Math.round(totals.shares / count),
      clicks: Math.round(totals.clicks / count),
      engagementRate: Number((totals.engagementRate / count).toFixed(2)),
    }
  }, [sortedPosts])

  const platforms = useMemo(() => {
    const unique = new Set(posts.map((p) => p.platform))
    return Array.from(unique)
  }, [posts])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Post Performance Comparison
            </CardTitle>
            <CardDescription>
              Compare performance across your posts
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engagement">Engagement Rate</SelectItem>
                <SelectItem value="impressions">Impressions</SelectItem>
                <SelectItem value="likes">Likes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Metrics */}
        {avgMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg Impressions</p>
              <p className="text-2xl font-bold">{avgMetrics.impressions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg Engagement</p>
              <p className="text-2xl font-bold">{avgMetrics.engagementRate}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg Likes</p>
              <p className="text-2xl font-bold">{avgMetrics.likes.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg Clicks</p>
              <p className="text-2xl font-bold">{avgMetrics.clicks.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Top Performing Posts */}
        <div className="space-y-3">
          <h3 className="font-semibold">Top Performing Posts</h3>
          {sortedPosts.slice(0, 5).map((post, idx) => (
            <div
              key={post.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">#{idx + 1}</Badge>
                    <Badge>{post.platform}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.postedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{post.content}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-green-600">
                    {post.engagementRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">Engagement</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                    <p className="text-sm font-semibold">{post.impressions.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Likes</p>
                    <p className="text-sm font-semibold">{post.likes.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Comments</p>
                    <p className="text-sm font-semibold">{post.comments.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Shares</p>
                    <p className="text-sm font-semibold">{post.shares.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


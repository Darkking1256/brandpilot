"use client"

import { useState, useMemo } from "react"
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
    <div className="rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-400" />
              Post Performance Comparison
            </h3>
            <p className="text-slate-400 text-sm">
              Compare performance across your posts
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[140px] bg-slate-800/50 border-slate-700/50 text-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 border-slate-700 backdrop-blur-xl">
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[140px] bg-slate-800/50 border-slate-700/50 text-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 border-slate-700 backdrop-blur-xl">
                <SelectItem value="engagement">Engagement Rate</SelectItem>
                <SelectItem value="impressions">Impressions</SelectItem>
                <SelectItem value="likes">Likes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Average Metrics */}
        {avgMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <div>
              <p className="text-xs text-slate-500 mb-1">Avg Impressions</p>
              <p className="text-2xl font-bold text-white">{avgMetrics.impressions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Avg Engagement</p>
              <p className="text-2xl font-bold text-white">{avgMetrics.engagementRate}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Avg Likes</p>
              <p className="text-2xl font-bold text-white">{avgMetrics.likes.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Avg Clicks</p>
              <p className="text-2xl font-bold text-white">{avgMetrics.clicks.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Top Performing Posts */}
        <div className="space-y-3">
          <h3 className="font-semibold text-white">Top Performing Posts</h3>
          {sortedPosts.slice(0, 5).map((post, idx) => (
            <div
              key={post.id}
              className="p-4 border border-slate-700/50 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="border-slate-600 text-slate-300">#{idx + 1}</Badge>
                    <Badge className="bg-slate-700/50 text-slate-300">{post.platform}</Badge>
                    <span className="text-sm text-slate-500">
                      {new Date(post.postedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2 text-slate-300">{post.content}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-green-400">
                    {post.engagementRate}%
                  </div>
                  <div className="text-xs text-slate-500">Engagement</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-3 pt-3 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Impressions</p>
                    <p className="text-sm font-semibold text-slate-300">{post.impressions.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Likes</p>
                    <p className="text-sm font-semibold text-slate-300">{post.likes.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Comments</p>
                    <p className="text-sm font-semibold text-slate-300">{post.comments.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Shares</p>
                    <p className="text-sm font-semibold text-slate-300">{post.shares.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


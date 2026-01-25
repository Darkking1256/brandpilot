"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Hash, Search } from "lucide-react"
import { cn } from "@/utils/cn"

interface HashtagPerformance {
  hashtag: string
  platform: string
  usageCount: number
  totalEngagement: number
  avgEngagementRate: number
  firstUsedAt: string
  lastUsedAt: string
}

interface HashtagPerformanceProps {
  hashtags: HashtagPerformance[]
}

export function HashtagPerformance({ hashtags }: HashtagPerformanceProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"usage" | "engagement" | "rate">("engagement")

  const filteredAndSorted = useMemo(() => {
    let filtered = hashtags

    if (selectedPlatform !== "all") {
      filtered = filtered.filter((h) => h.platform === selectedPlatform)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((h) => h.hashtag.toLowerCase().includes(query))
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "usage":
          return b.usageCount - a.usageCount
        case "engagement":
          return b.totalEngagement - a.totalEngagement
        case "rate":
          return b.avgEngagementRate - a.avgEngagementRate
        default:
          return 0
      }
    })
  }, [hashtags, searchQuery, selectedPlatform, sortBy])

  const platforms = useMemo(() => {
    const unique = new Set(hashtags.map((h) => h.platform))
    return Array.from(unique)
  }, [hashtags])

  const topHashtags = useMemo(() => {
    return filteredAndSorted.slice(0, 10)
  }, [filteredAndSorted])

  return (
    <div className="rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Hash className="h-5 w-5 text-slate-400" />
              Hashtag Performance
            </h3>
            <p className="text-slate-400 text-sm">
              Track performance of your hashtags across platforms
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
              />
            </div>
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
              <SelectTrigger className="w-[120px] bg-slate-800/50 border-slate-700/50 text-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 border-slate-700 backdrop-blur-xl">
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="rate">Rate</SelectItem>
                <SelectItem value="usage">Usage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {/* Top Hashtags */}
        <div className="space-y-2">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            Top Performing Hashtags
          </h3>
          <div className="space-y-2">
            {topHashtags.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No hashtag data available
              </p>
            ) : (
              topHashtags.map((hashtag, idx) => (
                <div
                  key={`${hashtag.hashtag}-${hashtag.platform}`}
                  className="flex items-center justify-between p-3 border border-slate-700/50 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Badge variant="outline" className="min-w-[2rem] justify-center border-slate-600 text-slate-300">
                      #{idx + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{hashtag.hashtag}</span>
                        <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300">
                          {hashtag.platform}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Used {hashtag.usageCount} times</span>
                        <span>•</span>
                        <span>
                          {hashtag.totalEngagement.toLocaleString()} total engagement
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-green-400">
                      {hashtag.avgEngagementRate.toFixed(2)}%
                    </div>
                    <div className="text-xs text-slate-500">Avg Rate</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {filteredAndSorted.length > 0 && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Hashtags</p>
              <p className="text-2xl font-bold text-white">{filteredAndSorted.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Usage</p>
              <p className="text-2xl font-bold text-white">
                {filteredAndSorted.reduce((sum, h) => sum + h.usageCount, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Avg Engagement Rate</p>
              <p className="text-2xl font-bold text-white">
                {(
                  filteredAndSorted.reduce((sum, h) => sum + h.avgEngagementRate, 0) /
                  filteredAndSorted.length
                ).toFixed(2)}
                %
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


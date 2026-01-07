"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Hashtag Performance
            </CardTitle>
            <CardDescription>
              Track performance of your hashtags across platforms
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
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
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="rate">Rate</SelectItem>
                <SelectItem value="usage">Usage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top Hashtags */}
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Top Performing Hashtags
          </h3>
          <div className="space-y-2">
            {topHashtags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hashtag data available
              </p>
            ) : (
              topHashtags.map((hashtag, idx) => (
                <div
                  key={`${hashtag.hashtag}-${hashtag.platform}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Badge variant="outline" className="min-w-[2rem] justify-center">
                      #{idx + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{hashtag.hashtag}</span>
                        <Badge variant="secondary" className="text-xs">
                          {hashtag.platform}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Used {hashtag.usageCount} times</span>
                        <span>•</span>
                        <span>
                          {hashtag.totalEngagement.toLocaleString()} total engagement
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-green-600">
                      {hashtag.avgEngagementRate.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Rate</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {filteredAndSorted.length > 0 && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Hashtags</p>
              <p className="text-2xl font-bold">{filteredAndSorted.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Usage</p>
              <p className="text-2xl font-bold">
                {filteredAndSorted.reduce((sum, h) => sum + h.usageCount, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg Engagement Rate</p>
              <p className="text-2xl font-bold">
                {(
                  filteredAndSorted.reduce((sum, h) => sum + h.avgEngagementRate, 0) /
                  filteredAndSorted.length
                ).toFixed(2)}
                %
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


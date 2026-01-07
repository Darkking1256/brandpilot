"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp } from "lucide-react"
import { cn } from "@/utils/cn"

interface TimeSlot {
  day: number
  hour: number
  postCount: number
  avgEngagementRate: number
  totalEngagement: number
}

interface BestTimeToPostProps {
  data: TimeSlot[]
  platform?: string
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function BestTimeToPost({ data, platform }: BestTimeToPostProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>(platform || "all")

  const filteredData = useMemo(() => {
    return data.filter((slot) => selectedPlatform === "all" || true) // Platform filtering would be done at API level
  }, [data, selectedPlatform])

  const heatmapData = useMemo(() => {
    const heatmap: Record<string, TimeSlot> = {}
    filteredData.forEach((slot) => {
      const key = `${slot.day}-${slot.hour}`
      heatmap[key] = slot
    })
    return heatmap
  }, [filteredData])

  const bestTimes = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
      .slice(0, 5)
  }, [filteredData])

  const getIntensity = (engagementRate: number) => {
    if (engagementRate >= 5) return "bg-green-600"
    if (engagementRate >= 3) return "bg-green-400"
    if (engagementRate >= 2) return "bg-yellow-400"
    if (engagementRate >= 1) return "bg-orange-400"
    return "bg-gray-200 dark:bg-gray-800"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Best Time to Post
            </CardTitle>
            <CardDescription>
              Optimal posting times based on engagement data
            </CardDescription>
          </div>
          {platform && (
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Recommendations */}
        {bestTimes.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Recommended Times
            </h3>
            <div className="grid gap-2">
              {bestTimes.map((time, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{idx + 1}</Badge>
                    <div>
                      <p className="font-medium">
                        {daysOfWeek[time.day]} at {time.hour}:00
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {time.postCount} posts • {time.totalEngagement.toLocaleString()} total engagement
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {time.avgEngagementRate.toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Heatmap */}
        <div className="space-y-2">
          <h3 className="font-semibold">Engagement Heatmap</h3>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid gap-1" style={{ gridTemplateColumns: "60px repeat(24, 1fr)" }}>
                {/* Header */}
                <div className="col-span-1"></div>
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div
                    key={hour}
                    className="text-xs text-center text-muted-foreground py-1"
                  >
                    {hour}
                  </div>
                ))}
                {/* Rows */}
                {daysOfWeek.map((day, dayIdx) => (
                  <div key={dayIdx} className="contents">
                    <div className="text-xs font-medium py-2 pr-2 text-right">
                      {day}
                    </div>
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const key = `${dayIdx}-${hour}`
                      const slot = heatmapData[key]
                      const engagementRate = slot?.avgEngagementRate || 0
                      return (
                        <div
                          key={hour}
                          className={cn(
                            "h-8 rounded border cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all",
                            getIntensity(engagementRate),
                            engagementRate === 0 && "opacity-30"
                          )}
                          title={`${day} ${hour}:00 - ${engagementRate.toFixed(2)}% engagement`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
              <span>No data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 rounded" />
              <span>Low (1-2%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded" />
              <span>Medium (2-3%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded" />
              <span>High (3-5%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded" />
              <span>Very High (5%+)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


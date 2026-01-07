"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Users, Plus, ExternalLink, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Competitor {
  id: string
  name: string
  platform: string
  handle: string
  profileUrl?: string
  followerCount?: number
  lastAnalyzedAt?: string
}

interface CompetitorPost {
  id: string
  competitorId: string
  content: string
  postedAt: string
  impressions: number
  engagement: number
  engagementRate: number
}

interface CompetitorAnalysisProps {
  competitors: Competitor[]
  posts: CompetitorPost[]
}

export function CompetitorAnalysis({ competitors, posts }: CompetitorAnalysisProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>("all")
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false)
  const [newCompetitor, setNewCompetitor] = useState({
    name: "",
    platform: "",
    handle: "",
    profileUrl: "",
  })
  const { toast } = useToast()

  const filteredPosts = useMemo(() => {
    if (selectedCompetitor === "all") return posts
    return posts.filter((p) => p.competitorId === selectedCompetitor)
  }, [posts, selectedCompetitor])

  const competitorStats = useMemo(() => {
    const stats: Record<string, {
      postCount: number
      avgEngagementRate: number
      totalEngagement: number
      avgImpressions: number
    }> = {}

    filteredPosts.forEach((post) => {
      if (!stats[post.competitorId]) {
        stats[post.competitorId] = {
          postCount: 0,
          avgEngagementRate: 0,
          totalEngagement: 0,
          avgImpressions: 0,
        }
      }
      stats[post.competitorId].postCount++
      stats[post.competitorId].totalEngagement += post.engagement
      stats[post.competitorId].avgImpressions += post.impressions
    })

    Object.keys(stats).forEach((id) => {
      const stat = stats[id]
      stat.avgEngagementRate = stat.totalEngagement / stat.postCount / (stat.avgImpressions / stat.postCount) * 100
      stat.avgImpressions = stat.avgImpressions / stat.postCount
    })

    return stats
  }, [filteredPosts])

  const handleAddCompetitor = async () => {
    try {
      const response = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCompetitor),
      })

      if (!response.ok) throw new Error("Failed to add competitor")

      toast({
        title: "Competitor added",
        description: `${newCompetitor.name} has been added to your competitor list.`,
      })
      setIsAddingCompetitor(false)
      setNewCompetitor({ name: "", platform: "", handle: "", profileUrl: "" })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add competitor",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  const topPosts = useMemo(() => {
    return [...filteredPosts]
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, 5)
  }, [filteredPosts])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Competitor Analysis
            </CardTitle>
            <CardDescription>
              Track and analyze your competitors&apos; content performance
            </CardDescription>
          </div>
          <Dialog open={isAddingCompetitor} onOpenChange={setIsAddingCompetitor}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Competitor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Competitor</DialogTitle>
                <DialogDescription>
                  Add a competitor to track their content performance
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="Competitor name"
                    value={newCompetitor.name}
                    onChange={(e) =>
                      setNewCompetitor({ ...newCompetitor, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform</label>
                  <Select
                    value={newCompetitor.platform}
                    onValueChange={(value) =>
                      setNewCompetitor({ ...newCompetitor, platform: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Handle/Username</label>
                  <Input
                    placeholder="@username"
                    value={newCompetitor.handle}
                    onChange={(e) =>
                      setNewCompetitor({ ...newCompetitor, handle: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profile URL (Optional)</label>
                  <Input
                    placeholder="https://..."
                    value={newCompetitor.profileUrl}
                    onChange={(e) =>
                      setNewCompetitor({ ...newCompetitor, profileUrl: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingCompetitor(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCompetitor} disabled={!newCompetitor.name || !newCompetitor.platform || !newCompetitor.handle}>
                  Add Competitor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Competitor Selector */}
        {competitors.length > 0 && (
          <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Competitors</SelectItem>
              {competitors.map((competitor) => (
                <SelectItem key={competitor.id} value={competitor.id}>
                  {competitor.name} ({competitor.platform})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Competitor Stats */}
        {competitors.length > 0 && Object.keys(competitorStats).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {competitors
              .filter((c) => selectedCompetitor === "all" || c.id === selectedCompetitor)
              .map((competitor) => {
                const stats = competitorStats[competitor.id]
                if (!stats) return null
                return (
                  <Card key={competitor.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{competitor.name}</span>
                      <Badge variant="outline">{competitor.platform}</Badge>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posts:</span>
                        <span className="font-medium">{stats.postCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Engagement:</span>
                        <span className="font-medium">{stats.avgEngagementRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Engagement:</span>
                        <span className="font-medium">{stats.totalEngagement.toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>
                )
              })}
          </div>
        )}

        {/* Top Performing Competitor Posts */}
        {topPosts.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Performing Competitor Posts
            </h3>
            <div className="space-y-2">
              {topPosts.map((post) => {
                const competitor = competitors.find((c) => c.id === post.competitorId)
                return (
                  <div
                    key={post.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{competitor?.name || "Unknown"}</span>
                          <Badge variant="secondary" className="text-xs">
                            {competitor?.platform}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.postedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{post.content}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-green-600">
                          {post.engagementRate.toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Engagement</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
                      <span>{post.impressions.toLocaleString()} impressions</span>
                      <span>•</span>
                      <span>{post.engagement.toLocaleString()} engagement</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {competitors.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No competitors added yet</p>
            <p className="text-sm mt-2">Add competitors to start tracking their performance</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


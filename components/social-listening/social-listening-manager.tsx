"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Ear, Plus, Edit, Trash2, TrendingUp, Hash, AtSign, Link as LinkIcon, Search, LayoutGrid, List, MessageCircle, Twitter, Linkedin, Facebook, Instagram, Youtube, Music2, ThumbsUp, ThumbsDown, Minus, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TrackingKeywordForm } from "./tracking-keyword-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { StatsCardSkeleton } from "@/components/skeletons/card-skeleton"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { EmptyState } from "@/components/empty-states/empty-state"

const PLATFORM_ICONS: Record<string, any> = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
}

interface TrackingKeyword {
  id: string
  keyword: string
  keyword_type: string
  platforms: string[]
  is_active: boolean
  min_engagement_threshold: number
  created_at: string
}

interface BrandMention {
  id: string
  keyword: string
  platform: string
  platform_username: string
  content: string
  engagement_count: number
  sentiment?: string
  detected_at: string
}

export function SocialListeningManager() {
  const [keywords, setKeywords] = useState<TrackingKeyword[]>([])
  const [mentions, setMentions] = useState<BrandMention[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingKeyword, setEditingKeyword] = useState<TrackingKeyword | null>(null)
  const [selectedKeyword, setSelectedKeyword] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "cards">("list")
  const [sentimentFilter, setSentimentFilter] = useState<string>("all")
  const { toast } = useToast()

  // Calculate stats
  const stats = useMemo(() => ({
    totalKeywords: keywords.length,
    activeKeywords: keywords.filter(k => k.is_active).length,
    totalMentions: mentions.length,
    positiveMentions: mentions.filter(m => m.sentiment === "positive").length,
    negativeMentions: mentions.filter(m => m.sentiment === "negative").length,
  }), [keywords, mentions])

  // Filter keywords by search
  const filteredKeywords = useMemo(() => {
    if (!searchQuery) return keywords
    return keywords.filter(k => 
      k.keyword.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [keywords, searchQuery])

  // Filter mentions
  const filteredMentions = useMemo(() => {
    return mentions.filter(m => {
      const matchesSentiment = sentimentFilter === "all" || m.sentiment === sentimentFilter
      return matchesSentiment
    })
  }, [mentions, sentimentFilter])

  useEffect(() => {
    fetchKeywords()
    fetchMentions()
  }, [selectedKeyword])

  const fetchKeywords = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/social-listening/keywords")
      if (response.ok) {
        const data = await response.json()
        setKeywords(data.keywords || [])
      }
    } catch (error) {
      console.error("Failed to fetch keywords", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMentions = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedKeyword !== "all") {
        params.set("keyword", selectedKeyword)
      }

      const response = await fetch(`/api/social-listening/mentions?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setMentions(data.mentions || [])
      }
    } catch (error) {
      console.error("Failed to fetch mentions", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tracking keyword?")) {
      return
    }

    try {
      const response = await fetch(`/api/social-listening/keywords/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "Keyword deleted",
        })
        fetchKeywords()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete",
      })
    }
  }

  const getKeywordIcon = (type: string) => {
    switch (type) {
      case "hashtag":
        return <Hash className="h-4 w-4" />
      case "username":
        return <AtSign className="h-4 w-4" />
      case "url":
        return <LinkIcon className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const PlatformIcon = ({ platform }: { platform: string }) => {
    const Icon = PLATFORM_ICONS[platform] || Ear
    return <Icon className="h-3 w-3" />
  }

  const SentimentIcon = ({ sentiment }: { sentiment?: string }) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-3 w-3 text-green-600" />
      case "negative":
        return <ThumbsDown className="h-3 w-3 text-red-600" />
      default:
        return <Minus className="h-3 w-3 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-5">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-5">
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Keywords</CardTitle>
              <Hash className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalKeywords}</div>
              <p className="text-xs text-muted-foreground mt-1">Tracking</p>
            </CardContent>
          </Card>
          <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Zap className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeKeywords}</div>
              <p className="text-xs text-muted-foreground mt-1">Running now</p>
            </CardContent>
          </Card>
          <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mentions</CardTitle>
              <MessageCircle className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalMentions}</div>
              <p className="text-xs text-muted-foreground mt-1">Detected</p>
            </CardContent>
          </Card>
          <Card 
            className={`border-2 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 cursor-pointer hover:shadow-lg transition-shadow ${sentimentFilter === "positive" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSentimentFilter(sentimentFilter === "positive" ? "all" : "positive")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Positive</CardTitle>
              <ThumbsUp className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.positiveMentions}</div>
              <p className="text-xs text-muted-foreground mt-1">Good sentiment</p>
            </CardContent>
          </Card>
          <Card 
            className={`border-2 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 cursor-pointer hover:shadow-lg transition-shadow ${sentimentFilter === "negative" ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSentimentFilter(sentimentFilter === "negative" ? "all" : "negative")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Negative</CardTitle>
              <ThumbsDown className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.negativeMentions}</div>
              <p className="text-xs text-muted-foreground mt-1">Need attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tracking Keywords Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Tracking Keywords</CardTitle>
              <CardDescription>Keywords and hashtags you&apos;re monitoring</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "cards" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode("cards")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingKeyword(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Keyword
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingKeyword ? "Edit Keyword" : "Add Tracking Keyword"}
                    </DialogTitle>
                  </DialogHeader>
                  <TrackingKeywordForm
                    keyword={editingKeyword}
                    onSuccess={() => {
                      setIsFormOpen(false)
                      fetchKeywords()
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <TableSkeleton />
          ) : keywords.length === 0 ? (
            <EmptyState
              icon={Ear}
              title="No tracking keywords yet"
              description="Add keywords, hashtags, or usernames to start monitoring brand mentions across social platforms."
              action={{
                label: "Add Your First Keyword",
                onClick: () => {
                  setEditingKeyword(null)
                  setIsFormOpen(true)
                },
              }}
            />
          ) : filteredKeywords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No keywords match your search</p>
              <Button variant="link" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </div>
          ) : viewMode === "list" ? (
            <div className="space-y-2">
              {filteredKeywords.map((keyword) => (
                <div
                  key={keyword.id}
                  className="p-4 border-2 rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getKeywordIcon(keyword.keyword_type)}
                        <span className="font-semibold text-lg">{keyword.keyword}</span>
                        <Badge variant={keyword.is_active ? "default" : "secondary"} className={keyword.is_active ? "bg-green-500" : ""}>
                          {keyword.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {keyword.keyword_type}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {keyword.platforms.map((platform) => (
                          <Badge key={platform} variant="secondary" className="capitalize text-xs flex items-center gap-1">
                            <PlatformIcon platform={platform} />
                            {platform}
                          </Badge>
                        ))}
                      </div>
                      {keyword.min_engagement_threshold > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Min engagement threshold: {keyword.min_engagement_threshold}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingKeyword(keyword)
                          setIsFormOpen(true)
                        }}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(keyword.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredKeywords.map((keyword) => (
                <Card key={keyword.id} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getKeywordIcon(keyword.keyword_type)}
                        <CardTitle className="text-lg">{keyword.keyword}</CardTitle>
                      </div>
                      <Badge variant={keyword.is_active ? "default" : "secondary"} className={keyword.is_active ? "bg-green-500" : ""}>
                        {keyword.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="capitalize w-fit">
                      {keyword.keyword_type}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {keyword.platforms.map((platform) => (
                        <Badge key={platform} variant="secondary" className="capitalize text-xs flex items-center gap-1">
                          <PlatformIcon platform={platform} />
                          {platform}
                        </Badge>
                      ))}
                    </div>
                    {keyword.min_engagement_threshold > 0 && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Min engagement: {keyword.min_engagement_threshold}
                      </p>
                    )}
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setEditingKeyword(keyword)
                          setIsFormOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(keyword.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brand Mentions Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Brand Mentions</CardTitle>
              <CardDescription>Recent mentions detected across platforms</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedKeyword} onValueChange={setSelectedKeyword}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by keyword" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Keywords</SelectItem>
                  {keywords.map((kw) => (
                    <SelectItem key={kw.id} value={kw.keyword}>
                      {kw.keyword}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiment</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {mentions.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="No mentions yet"
              description="Brand mentions will appear here when detected. Add tracking keywords to start monitoring."
            />
          ) : filteredMentions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No mentions match your filters</p>
              <Button variant="link" onClick={() => { setSelectedKeyword("all"); setSentimentFilter("all"); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredMentions.map((mention) => (
                <div key={mention.id} className="p-4 border-2 rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{mention.platform_username}</span>
                      <Badge variant="secondary" className="capitalize flex items-center gap-1">
                        <PlatformIcon platform={mention.platform} />
                        {mention.platform}
                      </Badge>
                      {mention.sentiment && (
                        <Badge
                          variant={
                            mention.sentiment === "positive"
                              ? "default"
                              : mention.sentiment === "negative"
                              ? "destructive"
                              : "secondary"
                          }
                          className={mention.sentiment === "positive" ? "bg-green-500" : ""}
                        >
                          <SentimentIcon sentiment={mention.sentiment} />
                          <span className="ml-1">{mention.sentiment}</span>
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(mention.detected_at), "MMM d, h:mm a")}
                    </div>
                  </div>
                  <p className="text-sm mb-3 bg-muted p-3 rounded">{mention.content}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {mention.keyword}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {mention.engagement_count} engagements
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


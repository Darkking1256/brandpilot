"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RefreshCw, TrendingUp, Calendar, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingButton } from "@/components/loading-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TopPost {
  id: string
  content: string
  platform: string
  engagement: number
  publishedAt: string
}

export function PostRecycling() {
  const [topPosts, setTopPosts] = useState<TopPost[]>([])
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRecycling, setIsRecycling] = useState(false)
  const [scheduleDays, setScheduleDays] = useState(30)
  const { toast } = useToast()

  useEffect(() => {
    fetchTopPosts()
  }, [])

  const fetchTopPosts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/posts/top-performing?limit=10")
      if (response.ok) {
        const data = await response.json()
        setTopPosts(data.posts || [])
      } else {
        throw new Error("Failed to fetch top posts")
      }
    } catch (error) {
      console.error("Failed to fetch top posts", error)
      toast({
        variant: "destructive",
        title: "Failed to load posts",
        description: "Could not fetch top-performing posts.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecycle = async () => {
    if (selectedPosts.length === 0) {
      toast({
        variant: "destructive",
        title: "No posts selected",
        description: "Please select at least one post to recycle.",
      })
      return
    }

    setIsRecycling(true)
    try {
      const response = await fetch("/api/posts/recycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postIds: selectedPosts,
          scheduleDays,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to recycle posts")
      }

      const data = await response.json()
      toast({
        title: "Posts recycled successfully",
        description: `${data.count} post(s) scheduled for reposting in ${scheduleDays} days.`,
      })
      setSelectedPosts([])
      fetchTopPosts() // Refresh the list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Recycling failed",
        description: error.message || "Failed to recycle posts.",
      })
    } finally {
      setIsRecycling(false)
    }
  }

  const togglePostSelection = (postId: string) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter((id) => id !== postId))
    } else {
      setSelectedPosts([...selectedPosts, postId])
    }
  }

  const selectAll = () => {
    if (selectedPosts.length === topPosts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(topPosts.map((post) => post.id))
    }
  }

  return (
    <div className="rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500">
      <div className="p-8 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white mb-0 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
              <RefreshCw className="h-5 w-5 text-white" />
            </div>
            Recycle Top Content
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTopPosts}
            disabled={isLoading}
            className="border border-slate-700/50 bg-slate-900/50 backdrop-blur-xl text-slate-400 hover:text-white hover:border-purple-500/50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>
      <div className="p-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="scheduleDays">Schedule posts in (days)</Label>
              <Input
                id="scheduleDays"
                type="number"
                min="1"
                value={scheduleDays}
                onChange={(e) => setScheduleDays(parseInt(e.target.value) || 30)}
                className="mt-1"
              />
            </div>
            <div className="pt-6">
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedPosts.length === topPosts.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Loading top posts...</p>
            </div>
          ) : topPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No top-performing posts found.</p>
              <p className="text-sm mt-1">Create and publish posts to see them here.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {topPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={() => togglePostSelection(post.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="capitalize">
                          {post.platform}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {post.engagement} engagements
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <LoadingButton
                onClick={handleRecycle}
                disabled={selectedPosts.length === 0}
                loading={isRecycling}
                loadingText="Recycling..."
                className="w-full"
              >
                Recycle {selectedPosts.length > 0 ? `${selectedPosts.length} ` : ""}Selected Posts
              </LoadingButton>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


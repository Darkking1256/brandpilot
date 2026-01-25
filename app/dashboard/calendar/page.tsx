"use client"

import { useState, useEffect, useMemo } from "react"
import { ContentCalendar } from "@/components/calendar/content-calendar"
import { getPosts } from "@/lib/api"
import type { Post } from "@/components/posts-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon, Grid, List, Plus, Clock, CheckCircle2, FileEdit, AlertCircle, Sparkles, Loader2, Wand2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CalendarExport } from "@/components/calendar/calendar-export"
import { useRealtimePosts } from "@/hooks/use-realtime-posts"
import { CreatePostForm } from "@/components/forms/create-post-form"
import { StatsCardSkeleton } from "@/components/skeletons/card-skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [colorBy, setColorBy] = useState<"platform" | "status">("platform")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isAutoFillOpen, setIsAutoFillOpen] = useState(false)
  const [isAutoFillLoading, setIsAutoFillLoading] = useState(false)
  const [autoFillIndustry, setAutoFillIndustry] = useState("")
  const [autoFillNiche, setAutoFillNiche] = useState("")
  const [autoFillPlatforms, setAutoFillPlatforms] = useState<string[]>(["twitter", "linkedin", "instagram"])
  const [autoFillPostsPerWeek, setAutoFillPostsPerWeek] = useState(3)
  const [autoFillTone, setAutoFillTone] = useState<"professional" | "casual" | "humorous" | "inspirational" | "educational">("professional")
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchPosts()
  }, [])

  // Real-time updates
  const realtimePosts = useRealtimePosts(posts)
  
  useEffect(() => {
    if (realtimePosts.length > 0 || posts.length === 0) {
      setPosts(realtimePosts)
    }
  }, [realtimePosts])

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesPlatform = platformFilter === "all" || post.platform === platformFilter
      const matchesStatus = statusFilter === "all" || post.status === statusFilter
      return matchesPlatform && matchesStatus
    })
  }, [posts, platformFilter, statusFilter])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const fetchedPosts = await getPosts()
      setPosts(fetchedPosts || [])
    } catch (error) {
      // Silently fail - set empty posts (demo mode)
      console.error("Error fetching posts:", error)
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostClick = (post: Post) => {
    setSelectedPost(post)
    setIsPostDialogOpen(true)
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setIsPostDialogOpen(false)
    setIsCreatePostOpen(true)
  }

  const handleDateChange = (date: Date) => {
    // Could open create post form with pre-filled date
    toast({
      title: "Date Selected",
      description: `Selected date: ${date.toLocaleDateString()}. Click "New Post" to schedule a post for this date.`,
    })
  }

  const handlePostCreated = () => {
    fetchPosts()
  }

  const handleCloseForm = (open: boolean) => {
    setIsCreatePostOpen(open)
    if (!open) {
      setEditingPost(null)
    }
  }

  const handleAutoFill = async () => {
    if (!autoFillIndustry.trim()) {
      toast({
        variant: "destructive",
        title: "Industry required",
        description: "Please enter your industry or business type.",
      })
      return
    }

    if (autoFillPlatforms.length === 0) {
      toast({
        variant: "destructive",
        title: "Platforms required",
        description: "Please select at least one platform.",
      })
      return
    }

    setIsAutoFillLoading(true)
    try {
      const response = await fetch("/api/ai/calendar-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: autoFillIndustry,
          niche: autoFillNiche,
          platforms: autoFillPlatforms,
          postsPerWeek: autoFillPostsPerWeek,
          tone: autoFillTone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          toast({
            variant: "destructive",
            title: "Pro Feature",
            description: data.message || "AI Calendar Auto-Fill requires a Pro subscription.",
          })
        } else {
          throw new Error(data.error || "Failed to generate content")
        }
        return
      }

      setGeneratedIdeas(data.ideas || [])
      toast({
        title: "Content Generated!",
        description: `Generated ${data.ideas?.length || 0} content ideas for your calendar.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate content ideas.",
      })
    } finally {
      setIsAutoFillLoading(false)
    }
  }

  const handleCreateFromIdea = async (idea: any) => {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: idea.content,
          platform: idea.platform,
          scheduledDate: idea.suggestedDate,
          scheduledTime: idea.suggestedTime,
          status: "draft",
        }),
      })

      if (!response.ok) throw new Error("Failed to create post")

      toast({
        title: "Post created",
        description: `"${idea.title}" has been added to your calendar as a draft.`,
      })

      // Remove from generated ideas
      setGeneratedIdeas(prev => prev.filter(i => i !== idea))
      fetchPosts()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create post",
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const handleAddAllIdeas = async () => {
    setIsAutoFillLoading(true)
    let added = 0
    
    for (const idea of generatedIdeas) {
      try {
        const response = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: idea.content,
            platform: idea.platform,
            scheduledDate: idea.suggestedDate,
            scheduledTime: idea.suggestedTime,
            status: "draft",
          }),
        })

        if (response.ok) added++
      } catch (error) {
        console.error("Failed to add idea:", error)
      }
    }

    setIsAutoFillLoading(false)
    setGeneratedIdeas([])
    setIsAutoFillOpen(false)
    
    toast({
      title: "Calendar filled!",
      description: `Added ${added} posts to your calendar as drafts.`,
    })
    
    fetchPosts()
  }

  const togglePlatform = (platform: string) => {
    setAutoFillPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  // Calculate stats
  const scheduledCount = posts.filter(p => p.status === "scheduled").length
  const publishedCount = posts.filter(p => p.status === "published").length
  const draftCount = posts.filter(p => p.status === "draft").length
  const failedCount = posts.filter(p => p.status === "failed").length

  const handleDragDrop = async (postId: string, newDate: Date, newTime: string) => {
    try {
      // Update post schedule
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDate: newDate.toISOString().split("T")[0],
          scheduledTime: newTime,
        }),
      })

      if (!response.ok) throw new Error("Failed to update schedule")

      toast({
        title: "Post rescheduled",
        description: "The post has been moved to the new date and time.",
      })
      fetchPosts()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to reschedule",
        description: error instanceof Error ? error.message : "Failed to update post schedule",
      })
    }
  }

  // Platform and status colors for legend
  const platformColors = [
    { name: "Twitter", color: "bg-blue-500" },
    { name: "LinkedIn", color: "bg-blue-600" },
    { name: "Facebook", color: "bg-blue-700" },
    { name: "Instagram", color: "bg-pink-500" },
    { name: "TikTok", color: "bg-black" },
    { name: "YouTube", color: "bg-red-600" },
  ]

  const statusColors = [
    { name: "Draft", color: "bg-gray-400" },
    { name: "Scheduled", color: "bg-blue-400" },
    { name: "Published", color: "bg-green-400" },
    { name: "Failed", color: "bg-red-400" },
  ]

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
        {/* Animated background blobs */}
        <div className="fixed inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  Content <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Calendar</span>
                </h1>
                <p className="text-slate-400">
                  Visualize and manage your scheduled posts
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="border-purple-500/50 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
                  onClick={() => setIsAutoFillOpen(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Auto-Fill
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
                  onClick={() => setIsCreatePostOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {isLoading ? (
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            ) : (
              <>
                <div 
                  className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => setStatusFilter("scheduled")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">Scheduled</span>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                      <CalendarIcon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">{scheduledCount}</div>
                </div>
                <div 
                  className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => setStatusFilter("published")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">Published</span>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">{publishedCount}</div>
                </div>
                <div 
                  className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => setStatusFilter("draft")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">Drafts</span>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                      <FileEdit className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">{draftCount}</div>
                </div>
                <div 
                  className={`p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer group ${failedCount > 0 ? "border-red-500/50 hover:border-red-400/70" : "border-slate-700/50 hover:border-orange-500/50"}`}
                  onClick={() => setStatusFilter("failed")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">Failed</span>
                    <div className={`p-2 rounded-lg shadow-md ${failedCount > 0 ? "bg-gradient-to-br from-red-500 to-pink-500" : "bg-gradient-to-br from-orange-500 to-red-500"}`}>
                      <AlertCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className={`text-3xl font-bold ${failedCount > 0 ? "text-red-400" : "text-white"}`}>{failedCount}</div>
                </div>
              </>
            )}
          </div>

          {/* Filters and Legend */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[160px] bg-slate-900/50 border-slate-700/50 text-slate-300">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900/95 border-slate-700 backdrop-blur-xl">
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-slate-900/50 border-slate-700/50 text-slate-300">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900/95 border-slate-700 backdrop-blur-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={colorBy} onValueChange={(v) => setColorBy(v as typeof colorBy)}>
                <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-700/50 text-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900/95 border-slate-700 backdrop-blur-xl">
                  <SelectItem value="platform">Color by Platform</SelectItem>
                  <SelectItem value="status">Color by Status</SelectItem>
                </SelectContent>
              </Select>
              <CalendarExport />
            </div>

            {/* Color Legend */}
            <div className="p-4 rounded-xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50">
              <div className="flex flex-wrap gap-3">
                {(colorBy === "platform" ? platformColors : statusColors).map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded ${item.color}`} />
                    <span className="text-xs text-slate-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar */}
          {isLoading ? (
            <div className="p-12 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400">Loading calendar...</p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
              <ContentCalendar
                posts={filteredPosts}
                onPostClick={handlePostClick}
                onDateChange={handleDateChange}
                onDragDrop={handleDragDrop}
                colorBy={colorBy}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Post Dialog */}
      <CreatePostForm 
        open={isCreatePostOpen} 
        onOpenChange={handleCloseForm}
        onSubmit={handlePostCreated}
        post={editingPost}
        mode={editingPost ? "edit" : "create"}
      />

      {/* Post Details Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-900/95 border-slate-700 backdrop-blur-xl">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  Post Details
                  <Badge variant="outline" className="capitalize border-slate-600 text-slate-300">{selectedPost.platform}</Badge>
                  <Badge 
                    variant={
                      selectedPost.status === "published" ? "default" :
                      selectedPost.status === "scheduled" ? "secondary" :
                      selectedPost.status === "failed" ? "destructive" : "outline"
                    }
                  >
                    {selectedPost.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Scheduled for {format(new Date(`${selectedPost.scheduledDate}T${selectedPost.scheduledTime}`), "PPP 'at' p")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-slate-300">Content</h4>
                  <p className="text-sm text-slate-400 whitespace-pre-wrap p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">{selectedPost.content}</p>
                </div>
                {selectedPost.imageUrl && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-slate-300">Image</h4>
                    <img 
                      src={selectedPost.imageUrl} 
                      alt="Post image" 
                      className="rounded-lg max-h-48 object-cover w-full border border-slate-700/50"
                    />
                  </div>
                )}
                {selectedPost.linkUrl && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-slate-300">Link</h4>
                    <a 
                      href={selectedPost.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline"
                    >
                      {selectedPost.linkUrl}
                    </a>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" 
                    onClick={() => handleEditPost(selectedPost)}
                  >
                    Edit Post
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-700/50 bg-slate-800/50 text-slate-300 hover:text-white hover:border-blue-500/50"
                    onClick={() => setIsPostDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Auto-Fill Dialog */}
      <Dialog open={isAutoFillOpen} onOpenChange={(open) => { setIsAutoFillOpen(open); if (!open) setGeneratedIdeas([]); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900/95 border-slate-700 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              AI Calendar Auto-Fill
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Pro Feature</Badge>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Generate a month&apos;s worth of content ideas tailored to your industry and brand.
            </DialogDescription>
          </DialogHeader>

          {generatedIdeas.length === 0 ? (
            <div className="space-y-6 py-4">
              {/* Industry Input */}
              <div className="space-y-2">
                <Label className="text-slate-300">Industry / Business Type *</Label>
                <Input
                  placeholder="e.g., SaaS, E-commerce, Fitness, Real Estate..."
                  value={autoFillIndustry}
                  onChange={(e) => setAutoFillIndustry(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Niche Input */}
              <div className="space-y-2">
                <Label className="text-slate-300">Niche (optional)</Label>
                <Input
                  placeholder="e.g., B2B Marketing Tools, Women's Activewear, Luxury Homes..."
                  value={autoFillNiche}
                  onChange={(e) => setAutoFillNiche(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Platform Selection */}
              <div className="space-y-3">
                <Label className="text-slate-300">Platforms *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {["twitter", "linkedin", "facebook", "instagram", "tiktok", "youtube"].map((platform) => (
                    <div
                      key={platform}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        autoFillPlatforms.includes(platform)
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                      }`}
                      onClick={() => togglePlatform(platform)}
                    >
                      <Checkbox
                        checked={autoFillPlatforms.includes(platform)}
                        className="border-slate-500 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                      />
                      <span className="text-sm capitalize text-slate-300">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Posts Per Week */}
              <div className="space-y-2">
                <Label className="text-slate-300">Posts per week (per platform)</Label>
                <Select value={String(autoFillPostsPerWeek)} onValueChange={(v) => setAutoFillPostsPerWeek(Number(v))}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="2">2 posts/week</SelectItem>
                    <SelectItem value="3">3 posts/week</SelectItem>
                    <SelectItem value="5">5 posts/week</SelectItem>
                    <SelectItem value="7">7 posts/week (daily)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <Label className="text-slate-300">Content Tone</Label>
                <Select value={autoFillTone} onValueChange={(v: any) => setAutoFillTone(v)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Generated {generatedIdeas.length} content ideas</p>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={handleAddAllIdeas}
                  disabled={isAutoFillLoading}
                >
                  {isAutoFillLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add All to Calendar
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {generatedIdeas.map((idea, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="capitalize border-slate-600 text-slate-300">
                            {idea.platform}
                          </Badge>
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            {idea.contentType}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {idea.suggestedDate} at {idea.suggestedTime}
                          </span>
                        </div>
                        <h4 className="font-medium text-white mb-1">{idea.title}</h4>
                        <p className="text-sm text-slate-400 line-clamp-2">{idea.content}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                        onClick={() => handleCreateFromIdea(idea)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-slate-700/50 pt-4">
            {generatedIdeas.length === 0 ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsAutoFillOpen(false)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={handleAutoFill}
                  disabled={isAutoFillLoading}
                >
                  {isAutoFillLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setGeneratedIdeas([])}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Generate New
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAutoFillOpen(false)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Done
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


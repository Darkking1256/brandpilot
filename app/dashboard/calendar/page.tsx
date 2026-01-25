"use client"

import { useState, useEffect, useMemo } from "react"
import { ContentCalendar } from "@/components/calendar/content-calendar"
import { getPosts } from "@/lib/api"
import type { Post } from "@/components/posts-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon, Grid, List, Plus, Clock, CheckCircle2, FileEdit, AlertCircle } from "lucide-react"
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
} from "@/components/ui/dialog"
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
      setPosts(fetchedPosts)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        variant: "destructive",
        title: "Failed to load posts",
        description: "There was an error loading your scheduled posts.",
      })
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
              <Button 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
                onClick={() => setIsCreatePostOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
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
    </>
  )
}


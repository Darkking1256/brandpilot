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
      <div className="space-y-8">
        {/* Header */}
        <div className="section-header border-0 pb-0 mb-0">
          <div>
            <h1 className="section-title text-3xl flex items-center gap-2">
              <CalendarIcon className="h-7 w-7 text-primary" />
              Content Calendar
            </h1>
            <p className="section-subtitle">
              Visualize and manage your scheduled posts
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setIsCreatePostOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
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
              <Card className="card-professional stat-card-blue cursor-pointer hover:shadow-md transition-all" onClick={() => setStatusFilter("scheduled")}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Scheduled</CardTitle>
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{scheduledCount}</div>
                </CardContent>
              </Card>
              <Card className="card-professional stat-card-teal cursor-pointer hover:shadow-md transition-all" onClick={() => setStatusFilter("published")}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Published</CardTitle>
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{publishedCount}</div>
                </CardContent>
              </Card>
              <Card className="card-professional stat-card-purple cursor-pointer hover:shadow-md transition-all" onClick={() => setStatusFilter("draft")}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Drafts</CardTitle>
                  <FileEdit className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{draftCount}</div>
                </CardContent>
              </Card>
              <Card className={`card-professional stat-card-orange cursor-pointer hover:shadow-md transition-all ${failedCount > 0 ? "border-red-300" : ""}`} onClick={() => setStatusFilter("failed")}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Failed</CardTitle>
                  <AlertCircle className={`h-5 w-5 ${failedCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${failedCount > 0 ? "text-red-600" : ""}`}>{failedCount}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filters and Legend */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
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
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={colorBy} onValueChange={(v) => setColorBy(v as typeof colorBy)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="platform">Color by Platform</SelectItem>
                <SelectItem value="status">Color by Status</SelectItem>
              </SelectContent>
            </Select>
            <CalendarExport />
          </div>

          {/* Color Legend */}
          <Card className="p-3">
            <div className="flex flex-wrap gap-3">
              {(colorBy === "platform" ? platformColors : statusColors).map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${item.color}`} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Calendar */}
        {isLoading ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">Loading calendar...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ContentCalendar
            posts={filteredPosts}
            onPostClick={handlePostClick}
            onDateChange={handleDateChange}
            onDragDrop={handleDragDrop}
            colorBy={colorBy}
          />
        )}
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
        <DialogContent className="max-w-lg">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Post Details
                  <Badge variant="outline" className="capitalize">{selectedPost.platform}</Badge>
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
                <DialogDescription>
                  Scheduled for {format(new Date(`${selectedPost.scheduledDate}T${selectedPost.scheduledTime}`), "PPP 'at' p")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Content</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedPost.content}</p>
                </div>
                {selectedPost.imageUrl && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Image</h4>
                    <img 
                      src={selectedPost.imageUrl} 
                      alt="Post image" 
                      className="rounded-lg max-h-48 object-cover w-full"
                    />
                  </div>
                )}
                {selectedPost.linkUrl && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Link</h4>
                    <a 
                      href={selectedPost.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {selectedPost.linkUrl}
                    </a>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleEditPost(selectedPost)}
                  >
                    Edit Post
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
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


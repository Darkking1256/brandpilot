"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Calendar, Clock, CheckCircle2, Filter, Search, ArrowUpDown, FileEdit, LayoutGrid, List } from "lucide-react"
import { CreatePostForm } from "@/components/forms/create-post-form"
import { PostsTable, type Post } from "@/components/posts-table"
import { Pagination } from "@/components/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { StatsCardSkeleton } from "@/components/skeletons/card-skeleton"
import { getPosts, deletePost, createPost } from "@/lib/api"
import { BulkActions } from "@/components/bulk-actions"
import { exportData, bulkDelete, bulkUpdateStatus } from "@/lib/export-import"
import { FileDown, FileUp } from "lucide-react"
import { useRealtimePosts } from "@/hooks/use-realtime-posts"
import { EmptyState } from "@/components/empty-states/empty-state"
import { AdvancedFilters, type FilterValues, type FilterPreset } from "@/components/filters/advanced-filters"
import { ExportDialog } from "@/components/export/export-dialog"
import { DuplicatePostDialog } from "@/components/duplicate/duplicate-post-dialog"
import { PostHistory } from "@/components/history/post-history"
import { PostRecycling } from "@/components/recycling/post-recycling"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Trash2, Copy, History, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SchedulerContent() {
  const searchParams = useSearchParams()
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "platform" | "status">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([])
  const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({})
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([])
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [postToDuplicate, setPostToDuplicate] = useState<Post | null>(null)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [postIdForHistory, setPostIdForHistory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  // Load saved presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("post_filter_presets")
    if (saved) {
      try {
        setSavedPresets(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load filter presets", e)
      }
    }
  }, [])

  const handleSavePreset = (name: string, filters: FilterValues) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters,
    }
    const updated = [...savedPresets, newPreset]
    setSavedPresets(updated)
    localStorage.setItem("post_filter_presets", JSON.stringify(updated))
    toast({
      title: "Preset saved",
      description: `Filter preset "${name}" has been saved.`,
    })
  }

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter((post) => {
      // Basic filters (for backward compatibility)
      const matchesSearch = searchQuery === "" || post.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || post.status === statusFilter
      const matchesPlatform = platformFilter === "all" || post.platform === platformFilter

      // Advanced filters
      const matchesAdvancedSearch = !advancedFilters.search || 
        post.content.toLowerCase().includes(advancedFilters.search.toLowerCase())
      const matchesAdvancedStatus = !advancedFilters.status?.length || 
        advancedFilters.status.includes(post.status)
      const matchesAdvancedPlatform = !advancedFilters.platform?.length || 
        advancedFilters.platform.includes(post.platform)
      
      // Date range filter
      let matchesDateRange = true
      if (advancedFilters.dateRange?.start || advancedFilters.dateRange?.end) {
        const postDate = new Date(`${post.scheduledDate}T${post.scheduledTime}`)
        if (advancedFilters.dateRange?.start && postDate < advancedFilters.dateRange.start) {
          matchesDateRange = false
        }
        if (advancedFilters.dateRange?.end && postDate > advancedFilters.dateRange.end) {
          matchesDateRange = false
        }
      }

      return matchesSearch && matchesStatus && matchesPlatform && 
             matchesAdvancedSearch && matchesAdvancedStatus && matchesAdvancedPlatform && matchesDateRange
    })

    // Sort posts
    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === "date") {
        const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`).getTime()
        const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`).getTime()
        comparison = dateA - dateB
      } else if (sortBy === "platform") {
        comparison = a.platform.localeCompare(b.platform)
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status)
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [posts, searchQuery, statusFilter, platformFilter, sortBy, sortOrder])

  // Paginate posts
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredAndSortedPosts.slice(startIndex, startIndex + pageSize)
  }, [filteredAndSortedPosts, currentPage])

  const totalPages = Math.ceil(filteredAndSortedPosts.length / pageSize)

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts()
    
    // Check if we should open create post form from URL params
    const create = searchParams.get("create")
    const content = searchParams.get("content")
    const platform = searchParams.get("platform")
    
    if (create === "true") {
      setIsCreatePostOpen(true)
      // Pre-fill form if content/platform provided
      if (content && platform) {
        // This will be handled by CreatePostForm reading URL params
      }
    }
  }, [searchParams])

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

  // Use real-time updates - this will automatically update posts when database changes
  const realtimePosts = useRealtimePosts(posts)
  
  // Update posts when real-time data changes
  useEffect(() => {
    if (realtimePosts.length > 0 || posts.length === 0) {
      setPosts(realtimePosts)
    }
  }, [realtimePosts])

  const handleCreatePost = async (postData: any) => {
    // The form handles the API call, we just need to refresh the list
    await fetchPosts()
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setIsCreatePostOpen(true)
  }

  const handleCloseForm = (open: boolean) => {
    setIsCreatePostOpen(open)
    if (!open) {
      setEditingPost(null)
    }
  }

  const handleDelete = async (postId: string) => {
    const post = posts.find((p) => p.id === postId)
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postId)
        await fetchPosts()
        toast({
          variant: "success",
          title: "Post deleted",
          description: "The post has been successfully deleted.",
        })
      } catch (error) {
        console.error("Error deleting post:", error)
        toast({
          variant: "destructive",
          title: "Failed to delete post",
          description: error instanceof Error ? error.message : "There was an error deleting the post.",
        })
      }
    }
  }

  const handleDuplicate = async (post: Post) => {
    setPostToDuplicate(post)
    setDuplicateDialogOpen(true)
  }

  const handleViewHistory = (postId: string) => {
    setPostIdForHistory(postId)
    setHistoryDialogOpen(true)
  }

  const handleDuplicateConfirm = async (options: {
    adjustDate: boolean
    daysOffset: number
    createAsTemplate: boolean
    duplicateCount: number
  }) => {
    if (!postToDuplicate) return

    try {
      const baseDate = options.adjustDate
        ? new Date(postToDuplicate.scheduledDate)
        : new Date(postToDuplicate.scheduledDate)
      
      if (options.adjustDate) {
        baseDate.setDate(baseDate.getDate() + options.daysOffset)
      }

      const promises = Array.from({ length: options.duplicateCount }).map(() =>
        createPost({
          content: postToDuplicate.content,
          platform: postToDuplicate.platform,
          scheduledDate: baseDate.toISOString().split("T")[0],
          scheduledTime: postToDuplicate.scheduledTime,
          imageUrl: postToDuplicate.imageUrl,
          linkUrl: postToDuplicate.linkUrl,
        })
      )

      await Promise.all(promises)
      await fetchPosts()
      
      toast({
        variant: "success",
        title: "Posts duplicated",
        description: `${options.duplicateCount} post(s) have been created successfully.`,
      })
      setDuplicateDialogOpen(false)
      setPostToDuplicate(null)
    } catch (error) {
      console.error("Error duplicating posts:", error)
      toast({
        variant: "destructive",
        title: "Failed to duplicate posts",
        description: error instanceof Error ? error.message : "There was an error duplicating the posts.",
      })
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await bulkDelete("posts", ids)
      setSelectedPostIds([])
      await fetchPosts()
      toast({
        variant: "success",
        title: "Posts deleted",
        description: `${ids.length} post(s) have been deleted successfully.`,
      })
    } catch (error) {
      console.error("Error deleting posts:", error)
      toast({
        variant: "destructive",
        title: "Failed to delete posts",
        description: error instanceof Error ? error.message : "There was an error deleting the posts.",
      })
    }
  }

  const handleBulkStatusUpdate = async (ids: string[], status: string) => {
    try {
      await bulkUpdateStatus("posts", ids, status)
      setSelectedPostIds([])
      await fetchPosts()
      toast({
        variant: "success",
        title: "Status updated",
        description: `${ids.length} post(s) have been updated to ${status}.`,
      })
    } catch (error) {
      console.error("Error updating posts:", error)
      toast({
        variant: "destructive",
        title: "Failed to update posts",
        description: error instanceof Error ? error.message : "There was an error updating the posts.",
      })
    }
  }

  const handleBulkExport = async (ids: string[], format: "csv" | "json") => {
    try {
      await exportData("posts", format, ids)
      toast({
        variant: "success",
        title: "Export successful",
        description: `Posts exported as ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("Error exporting posts:", error)
      toast({
        variant: "destructive",
        title: "Failed to export",
        description: error instanceof Error ? error.message : "There was an error exporting the posts.",
      })
    }
  }

  const handleExportAll = async (format: "csv" | "json") => {
    try {
      await exportData("posts", format)
      toast({
        variant: "success",
        title: "Export successful",
        description: `All posts exported as ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("Error exporting posts:", error)
      toast({
        variant: "destructive",
        title: "Failed to export",
        description: error instanceof Error ? error.message : "There was an error exporting the posts.",
      })
    }
  }

  const handleSort = (field: "date" | "platform" | "status") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

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
                <h1 className="text-4xl font-bold text-white mb-2">
                  Content <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Scheduler</span>
                </h1>
                <p className="text-slate-400">
                  Schedule and manage your social media posts
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
                  className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => setStatusFilter("draft")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">Drafts</span>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 shadow-md">
                      <FileEdit className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {posts.filter((p) => p.status === "draft").length}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Work in progress</p>
                </div>
                <div 
                  className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => setStatusFilter("scheduled")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">Scheduled</span>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {posts.filter((p) => p.status === "scheduled").length}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Ready to publish</p>
                </div>
                <div 
                  className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => setStatusFilter("all")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400 uppercase tracking-wide">Upcoming</span>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {posts.filter((p) => {
                      const scheduledTime = new Date(`${p.scheduledDate}T${p.scheduledTime}`)
                      return scheduledTime > new Date() && p.status === "scheduled"
                    }).length}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Posts in queue</p>
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
                  <div className="text-3xl font-bold text-white">
                    {posts.filter((p) => {
                      if (p.status !== "published") return false
                      const postDate = new Date(p.scheduledDate || p.createdAt)
                      const now = new Date()
                      return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear()
                    }).length}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">This month</p>
                </div>
              </>
            )}
          </div>

          {/* Quick Status Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-400 mr-2">Filter:</span>
            {[
              { key: "all", label: "All", icon: null, count: posts.length, color: "slate" },
              { key: "draft", label: "Drafts", icon: FileEdit, count: posts.filter(p => p.status === "draft").length, color: "orange" },
              { key: "scheduled", label: "Scheduled", icon: Calendar, count: posts.filter(p => p.status === "scheduled").length, color: "blue" },
              { key: "published", label: "Published", icon: CheckCircle2, count: posts.filter(p => p.status === "published").length, color: "green" },
              { key: "failed", label: "Failed", icon: null, count: posts.filter(p => p.status === "failed").length, color: "red" },
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={statusFilter === filter.key ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(filter.key)}
                className={`transition-all duration-300 ${
                  statusFilter === filter.key
                    ? filter.color === "red"
                      ? "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-red-500"
                      : filter.color === "blue"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-blue-500"
                      : filter.color === "green"
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-green-500"
                      : filter.color === "orange"
                      ? "bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white border-orange-500"
                      : "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-slate-500"
                    : `border-slate-700/50 bg-slate-900/50 backdrop-blur-xl text-slate-300 hover:text-white hover:border-${filter.color}-500/50 hover:bg-gradient-to-r hover:from-${filter.color}-600/20 hover:to-${filter.color}-700/20`
                } ${filter.key === "failed" && filter.count > 0 ? "animate-pulse" : ""}`}
              >
                {filter.icon && <filter.icon className="h-3.5 w-3.5 mr-1.5" />}
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>

          {/* Post Recycling Section */}
          <PostRecycling />

          {/* Filters and Search */}
          <div className="rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500">
            <div className="p-8 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 shadow-md">
                      <FileEdit className="h-5 w-5 text-white" />
                    </div>
                    Posts
                  </h3>
                  <p className="text-slate-400">
                    Manage and filter your scheduled posts
                  </p>
                </div>
                <div className="flex gap-3">
                  {/* View Toggle */}
                  <div className="flex border border-slate-700/50 rounded-md bg-slate-900/50">
                    <Button
                      variant={viewMode === "table" ? "secondary" : "ghost"}
                      size="sm"
                      className="rounded-r-none"
                      onClick={() => setViewMode("table")}
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
                  <ExportDialog type="posts" selectedIds={selectedPostIds.length > 0 ? selectedPostIds : undefined} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportAll("csv")}
                    className="border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-600"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Quick CSV
                  </Button>
                </div>
              </div>
            </div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Advanced Filters */}
              <AdvancedFilters
                onFiltersChange={setAdvancedFilters}
                presets={savedPresets}
                onSavePreset={handleSavePreset}
                availableStatuses={["draft", "scheduled", "published", "failed"]}
                availablePlatforms={["twitter", "linkedin", "facebook", "instagram", "tiktok", "youtube"]}
              />

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700/50 text-slate-300">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900/95 border-slate-700 backdrop-blur-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Platform Filter */}
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700/50 text-slate-300">
                  <SelectValue placeholder="Filter by platform" />
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

              {/* Sort */}
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-[150px] bg-slate-800/50 border-slate-700/50 text-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 border-slate-700 backdrop-blur-xl">
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="platform">Sort by Platform</SelectItem>
                    <SelectItem value="status">Sort by Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="border-slate-700/50 bg-slate-800/50 text-slate-300 hover:text-white hover:border-slate-600"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Posts Table */}
            {isLoading ? (
              <TableSkeleton rows={5} columns={5} />
            ) : posts.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No scheduled posts yet"
                description="Create your first post to get started with scheduling content across your social media platforms. Use AI to generate engaging content or repurpose existing content."
                action={{
                  label: "Create Your First Post",
                  onClick: () => setIsCreatePostOpen(true),
                }}
                secondaryAction={{
                  label: "Learn More",
                  onClick: () => {
                    // Could link to help docs or show a tooltip
                    toast({
                      title: "Getting Started",
                      description: "Use the Quick Actions on the dashboard or click 'Create Post' to schedule your content.",
                    })
                  },
                }}
              />
            ) : (
              <>
                {selectedPostIds.length > 0 && (
                  <BulkActions
                    selectedIds={selectedPostIds}
                    onBulkDelete={handleBulkDelete}
                    onBulkStatusUpdate={handleBulkStatusUpdate}
                    onBulkExport={handleBulkExport}
                    type="posts"
                    availableStatuses={["draft", "scheduled", "published", "failed"]}
                  />
                )}
                
                {viewMode === "table" ? (
                  <PostsTable
                    posts={paginatedPosts}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onViewHistory={handleViewHistory}
                    onSelectionChange={setSelectedPostIds}
                    selectedIds={selectedPostIds}
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedPosts.map((post) => (
                      <Card key={post.id} className="border-2 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {post.platform}
                              </Badge>
                              <Badge 
                                variant={
                                  post.status === "published" ? "default" :
                                  post.status === "scheduled" ? "secondary" :
                                  post.status === "failed" ? "destructive" : "outline"
                                }
                              >
                                {post.status}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(post)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(post)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewHistory(post.id)}>
                                  <History className="h-4 w-4 mr-2" />
                                  History
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(post.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm line-clamp-3 mb-3">{post.content}</p>
                          {post.imageUrl && (
                            <div className="mb-3 rounded-lg overflow-hidden">
                              <img 
                                src={post.imageUrl} 
                                alt="Post preview" 
                                className="w-full h-32 object-cover"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{post.scheduledDate}</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{post.scheduledTime}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
                <div className="mt-4 text-sm text-slate-500">
                  Showing {paginatedPosts.length} of {filteredAndSortedPosts.length} posts
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      </div>

      <CreatePostForm open={isCreatePostOpen} onOpenChange={handleCloseForm} onSubmit={handleCreatePost} post={editingPost} mode={editingPost ? "edit" : "create"} />
      <DuplicatePostDialog
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
        post={postToDuplicate}
        onDuplicate={handleDuplicateConfirm}
      />
      <PostHistory
        postId={postIdForHistory || ""}
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
      />
      </>
  )
}

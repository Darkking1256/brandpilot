"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Megaphone, TrendingUp, Target, Filter, Search, ArrowUpDown, LayoutGrid, List, Pause, CheckCircle2, FileEdit, DollarSign } from "lucide-react"
import { CreateCampaignForm } from "@/components/forms/create-campaign-form"
import { CampaignsTable, type Campaign } from "@/components/campaigns-table"
import { Pagination } from "@/components/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { PerformanceChart } from "@/components/charts/performance-chart"
import { TrendChart } from "@/components/charts/trend-chart"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"
import { StatsCardSkeleton, ChartSkeleton } from "@/components/skeletons/card-skeleton"
import { getCampaigns, deleteCampaign, createCampaign } from "@/lib/api"
import { BulkActions } from "@/components/bulk-actions"
import { exportData, bulkDelete, bulkUpdateStatus } from "@/lib/export-import"
import { FileDown, MoreHorizontal, Edit, Copy, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRealtimeCampaigns } from "@/hooks/use-realtime-campaigns"
import { EmptyState } from "@/components/empty-states/empty-state"

export default function CampaignPage() {
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"name" | "date" | "status">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter((campaign) => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (campaign.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
      const matchesPlatform = platformFilter === "all" || campaign.platform === platformFilter
      return matchesSearch && matchesStatus && matchesPlatform
    })

    // Sort campaigns
    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === "date") {
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status)
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [campaigns, searchQuery, statusFilter, platformFilter, sortBy, sortOrder])

  // Paginate campaigns
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredAndSortedCampaigns.slice(startIndex, startIndex + pageSize)
  }, [filteredAndSortedCampaigns, currentPage])

  const totalPages = Math.ceil(filteredAndSortedCampaigns.length / pageSize)

  // Fetch campaigns on mount
  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    setIsLoading(true)
    try {
      const fetchedCampaigns = await getCampaigns()
      setCampaigns(fetchedCampaigns || [])
    } catch (error) {
      // Silently fail - set empty campaigns (demo mode)
      console.error("Error fetching campaigns:", error)
      setCampaigns([])
    } finally {
      setIsLoading(false)
    }
  }

  // Use real-time updates - this will automatically update campaigns when database changes
  const realtimeCampaigns = useRealtimeCampaigns(campaigns)
  
  // Update campaigns when real-time data changes
  useEffect(() => {
    if (realtimeCampaigns.length > 0 || campaigns.length === 0) {
      setCampaigns(realtimeCampaigns)
    }
  }, [realtimeCampaigns])

  const handleCreateCampaign = async (campaignData: any) => {
    // The form handles the API call, we just need to refresh the list
    await fetchCampaigns()
  }

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setIsCreateCampaignOpen(true)
  }

  const handleCloseForm = (open: boolean) => {
    setIsCreateCampaignOpen(open)
    if (!open) {
      setEditingCampaign(null)
    }
  }

  const handleDelete = async (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (confirm("Are you sure you want to delete this campaign?")) {
      try {
        await deleteCampaign(campaignId)
        await fetchCampaigns()
        toast({
          variant: "success",
          title: "Campaign deleted",
          description: `"${campaign?.name}" has been successfully deleted.`,
        })
      } catch (error) {
        console.error("Error deleting campaign:", error)
        toast({
          variant: "destructive",
          title: "Failed to delete campaign",
          description: error instanceof Error ? error.message : "There was an error deleting the campaign.",
        })
      }
    }
  }

  const handleDuplicate = async (campaign: Campaign) => {
    try {
      await createCampaign({
        name: `${campaign.name} (Copy)`,
        description: campaign.description,
        platform: campaign.platform,
        objective: campaign.objective,
        budget: campaign.budget,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
      })
      await fetchCampaigns()
      toast({
        variant: "success",
        title: "Campaign duplicated",
        description: `A copy of "${campaign.name}" has been created as a draft.`,
      })
    } catch (error) {
      console.error("Error duplicating campaign:", error)
      toast({
        variant: "destructive",
        title: "Failed to duplicate campaign",
        description: error instanceof Error ? error.message : "There was an error duplicating the campaign.",
      })
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await bulkDelete("campaigns", ids)
      setSelectedCampaignIds([])
      await fetchCampaigns()
      toast({
        variant: "success",
        title: "Campaigns deleted",
        description: `${ids.length} campaign(s) have been deleted successfully.`,
      })
    } catch (error) {
      console.error("Error deleting campaigns:", error)
      toast({
        variant: "destructive",
        title: "Failed to delete campaigns",
        description: error instanceof Error ? error.message : "There was an error deleting the campaigns.",
      })
    }
  }

  const handleBulkStatusUpdate = async (ids: string[], status: string) => {
    try {
      await bulkUpdateStatus("campaigns", ids, status)
      setSelectedCampaignIds([])
      await fetchCampaigns()
      toast({
        variant: "success",
        title: "Status updated",
        description: `${ids.length} campaign(s) have been updated to ${status}.`,
      })
    } catch (error) {
      console.error("Error updating campaigns:", error)
      toast({
        variant: "destructive",
        title: "Failed to update campaigns",
        description: error instanceof Error ? error.message : "There was an error updating the campaigns.",
      })
    }
  }

  const handleBulkExport = async (ids: string[], format: "csv" | "json") => {
    try {
      await exportData("campaigns", format, ids)
      toast({
        variant: "success",
        title: "Export successful",
        description: `Campaigns exported as ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("Error exporting campaigns:", error)
      toast({
        variant: "destructive",
        title: "Failed to export",
        description: error instanceof Error ? error.message : "There was an error exporting the campaigns.",
      })
    }
  }

  const handleExportAll = async (format: "csv" | "json") => {
    try {
      await exportData("campaigns", format)
      toast({
        variant: "success",
        title: "Export successful",
        description: `All campaigns exported as ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("Error exporting campaigns:", error)
      toast({
        variant: "destructive",
        title: "Failed to export",
        description: error instanceof Error ? error.message : "There was an error exporting the campaigns.",
      })
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Marketing <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Campaigns</span>
                </h1>
                <p className="text-slate-400 text-lg">
                  Create and manage your marketing campaigns with AI-powered insights
                </p>
              </div>
              <Button 
                size="lg" 
                className="shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                onClick={() => setIsCreateCampaignOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4">
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
                  className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-slate-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => setStatusFilter("draft")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">Drafts</span>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500 shadow-md">
                      <FileEdit className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {campaigns.filter((c) => c.status === "draft").length}
                  </div>
                  <p className="text-xs text-slate-500">In preparation</p>
                </div>
                <div 
                  className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => setStatusFilter("active")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">Active</span>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                      <Megaphone className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {campaigns.filter((c) => c.status === "active").length}
                  </div>
                  <p className="text-xs text-slate-500">Running campaigns</p>
                </div>
                <div 
                  className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => setStatusFilter("paused")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">Paused</span>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 shadow-md">
                      <Pause className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {campaigns.filter((c) => c.status === "paused").length}
                  </div>
                  <p className="text-xs text-slate-500">On hold</p>
                </div>
                <div 
                  className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  onClick={() => setStatusFilter("completed")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">Completed</span>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {campaigns.filter((c) => c.status === "completed").length}
                  </div>
                  <p className="text-xs text-slate-500">Finished campaigns</p>
                </div>
              </>
            )}
          </div>

          {/* Quick Status Filters */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={statusFilter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("all")}
              className={statusFilter === "all" ? "bg-gradient-to-r from-slate-600 to-slate-700" : "border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-600"}
            >
              All Campaigns ({campaigns.length})
            </Button>
            <Button 
              variant={statusFilter === "draft" ? "default" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("draft")}
              className={statusFilter === "draft" ? "bg-gradient-to-r from-gray-600 to-slate-600" : "border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-600"}
            >
              <FileEdit className="h-4 w-4 mr-1" />
              Drafts ({campaigns.filter(c => c.status === "draft").length})
            </Button>
            <Button 
              variant={statusFilter === "active" ? "default" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("active")}
              className={statusFilter === "active" ? "bg-gradient-to-r from-purple-600 to-pink-600" : "border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-purple-500/50"}
            >
              <Megaphone className="h-4 w-4 mr-1" />
              Active ({campaigns.filter(c => c.status === "active").length})
            </Button>
            <Button 
              variant={statusFilter === "paused" ? "default" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("paused")}
              className={statusFilter === "paused" ? "bg-gradient-to-r from-yellow-600 to-orange-600" : "border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-yellow-500/50"}
            >
              <Pause className="h-4 w-4 mr-1" />
              Paused ({campaigns.filter(c => c.status === "paused").length})
            </Button>
            <Button 
              variant={statusFilter === "completed" ? "default" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("completed")}
              className={statusFilter === "completed" ? "bg-gradient-to-r from-green-600 to-emerald-600" : "border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-green-500/50"}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Completed ({campaigns.filter(c => c.status === "completed").length})
            </Button>
          </div>

          {/* Campaign Metrics */}
          <div className="grid gap-6 md:grid-cols-4">
            {isLoading ? (
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            ) : (
              <>
                <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-3">
                    <DollarSign className="h-4 w-4" />
                    Total Budget
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${campaigns.reduce((sum, c) => sum + (c.budget || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Across all campaigns</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-3">
                    <Target className="h-4 w-4" />
                    Active Budget
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${campaigns.filter(c => c.status === "active").reduce((sum, c) => sum + (c.budget || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Currently running</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-green-500/50 transition-all duration-300">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-3">
                    <TrendingUp className="h-4 w-4" />
                    Avg Budget
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${campaigns.length > 0 ? Math.round(campaigns.reduce((sum, c) => sum + (c.budget || 0), 0) / campaigns.length).toLocaleString() : 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Per campaign</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-3">
                    <Megaphone className="h-4 w-4" />
                    Platforms
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {new Set(campaigns.map(c => c.platform)).size}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Active platforms</p>
                </div>
              </>
            )}
          </div>

          {/* Analytics Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">Campaign by Platform</h3>
                <p className="text-slate-400 text-sm">Distribution of campaigns across platforms</p>
              </div>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <PerformanceChart posts={campaigns.map(c => ({ platform: c.platform, status: c.status }))} />
              )}
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">Campaign Timeline</h3>
                <p className="text-slate-400 text-sm">Campaigns created over time</p>
              </div>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <TrendChart posts={campaigns.map(c => ({ createdAt: c.createdAt, scheduledDate: c.startDate }))} />
              )}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500">
            <div className="p-8 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 shadow-md">
                      <Megaphone className="h-5 w-5 text-white" />
                    </div>
                    Your Campaigns
                  </h3>
                  <p className="text-slate-400">
                    All your marketing campaigns will appear here
                  </p>
                </div>
                <div className="flex gap-2">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportAll("csv")}
                    className="border-slate-700/50 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-600"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export CSV
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
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700/50 text-slate-300">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/95 border-slate-700 backdrop-blur-xl">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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
                      <SelectItem value="name">Sort by Name</SelectItem>
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

            {/* Campaigns Table */}
            {campaigns.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="No campaigns yet"
                description="Create your first campaign to start reaching your audience and achieving your marketing goals. Set objectives, budgets, and track performance all in one place."
                action={{
                  label: "Create Your First Campaign",
                  onClick: () => setIsCreateCampaignOpen(true),
                }}
                secondaryAction={{
                  label: "View Examples",
                  onClick: () => {
                    toast({
                      title: "Campaign Examples",
                      description: "Campaigns help you organize posts around specific goals like awareness, engagement, conversions, or traffic.",
                    })
                  },
                }}
              />
            ) : (
              <>
                {selectedCampaignIds.length > 0 && (
                  <BulkActions
                    selectedIds={selectedCampaignIds}
                    onBulkDelete={handleBulkDelete}
                    onBulkStatusUpdate={handleBulkStatusUpdate}
                    onBulkExport={handleBulkExport}
                    type="campaigns"
                    availableStatuses={["draft", "active", "paused", "completed"]}
                  />
                )}
                
                {viewMode === "table" ? (
                  <CampaignsTable
                    campaigns={paginatedCampaigns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onSelectionChange={setSelectedCampaignIds}
                    selectedIds={selectedCampaignIds}
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedCampaigns.map((campaign) => (
                      <Card key={campaign.id} className="border-2 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">{campaign.name}</CardTitle>
                              <CardDescription className="line-clamp-2 mt-1">
                                {campaign.description || "No description"}
                              </CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(campaign)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(campaign)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(campaign.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="capitalize">{campaign.platform}</Badge>
                            <Badge 
                              variant={
                                campaign.status === "active" ? "default" :
                                campaign.status === "completed" ? "secondary" :
                                campaign.status === "paused" ? "outline" : "outline"
                              }
                              className={
                                campaign.status === "active" ? "bg-green-500" :
                                campaign.status === "paused" ? "bg-yellow-500 text-white" : ""
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Budget</p>
                              <p className="font-semibold">${(campaign.budget || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Objective</p>
                              <p className="font-semibold capitalize">{campaign.objective || "—"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Start Date</p>
                              <p className="font-semibold">{campaign.startDate || "—"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">End Date</p>
                              <p className="font-semibold">{campaign.endDate || "Ongoing"}</p>
                            </div>
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
                  Showing {paginatedCampaigns.length} of {filteredAndSortedCampaigns.length} campaigns
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>

      <CreateCampaignForm 
        open={isCreateCampaignOpen} 
        onOpenChange={handleCloseForm}
        onSubmit={handleCreateCampaign}
        campaign={editingCampaign}
        mode={editingCampaign ? "edit" : "create"}
      />
    </>
  )
}

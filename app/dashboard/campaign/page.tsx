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
      setCampaigns(fetchedCampaigns)
    } catch (error) {
      console.error("Error fetching campaigns:", error)
      toast({
        variant: "destructive",
        title: "Failed to load campaigns",
        description: "There was an error loading your campaigns. Please refresh the page.",
      })
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground text-lg">
              Create and manage your marketing campaigns with AI-powered insights
            </p>
          </div>
          <Button 
            size="lg" 
            className="shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600"
            onClick={() => setIsCreateCampaignOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            New Campaign
          </Button>
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
              <Card 
                className="border-2 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setStatusFilter("draft")}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500">
                    <FileEdit className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">
                    {campaigns.filter((c) => c.status === "draft").length}
                  </div>
                  <p className="text-xs text-muted-foreground">In preparation</p>
                </CardContent>
              </Card>
              <Card 
                className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setStatusFilter("active")}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                    <Megaphone className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">
                    {campaigns.filter((c) => c.status === "active").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Running campaigns</p>
                </CardContent>
              </Card>
              <Card 
                className="border-2 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setStatusFilter("paused")}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Paused</CardTitle>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
                    <Pause className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">
                    {campaigns.filter((c) => c.status === "paused").length}
                  </div>
                  <p className="text-xs text-muted-foreground">On hold</p>
                </CardContent>
              </Card>
              <Card 
                className="border-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setStatusFilter("completed")}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">
                    {campaigns.filter((c) => c.status === "completed").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Finished campaigns</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Status Filters */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={statusFilter === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All Campaigns ({campaigns.length})
          </Button>
          <Button 
            variant={statusFilter === "draft" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("draft")}
          >
            <FileEdit className="h-4 w-4 mr-1" />
            Drafts ({campaigns.filter(c => c.status === "draft").length})
          </Button>
          <Button 
            variant={statusFilter === "active" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("active")}
          >
            <Megaphone className="h-4 w-4 mr-1" />
            Active ({campaigns.filter(c => c.status === "active").length})
          </Button>
          <Button 
            variant={statusFilter === "paused" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("paused")}
          >
            <Pause className="h-4 w-4 mr-1" />
            Paused ({campaigns.filter(c => c.status === "paused").length})
          </Button>
          <Button 
            variant={statusFilter === "completed" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("completed")}
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
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Budget
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${campaigns.reduce((sum, c) => sum + (c.budget || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Across all campaigns</p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Active Budget
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${campaigns.filter(c => c.status === "active").reduce((sum, c) => sum + (c.budget || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Currently running</p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Avg Budget
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${campaigns.length > 0 ? Math.round(campaigns.reduce((sum, c) => sum + (c.budget || 0), 0) / campaigns.length).toLocaleString() : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Per campaign</p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    Platforms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(campaigns.map(c => c.platform)).size}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Active platforms</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Analytics Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Campaign by Platform</CardTitle>
              <CardDescription>Distribution of campaigns across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <PerformanceChart posts={campaigns.map(c => ({ platform: c.platform, status: c.status }))} />
              )}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Campaign Timeline</CardTitle>
              <CardDescription>Campaigns created over time</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <TrendChart posts={campaigns.map(c => ({ createdAt: c.createdAt, scheduledDate: c.startDate }))} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Your Campaigns</CardTitle>
                <CardDescription className="text-base">
                  All your marketing campaigns will appear here
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {/* View Toggle */}
                <div className="flex border rounded-md">
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
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* Platform Filter */}
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by platform" />
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

              {/* Sort */}
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="status">Sort by Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
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
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {paginatedCampaigns.length} of {filteredAndSortedCampaigns.length} campaigns
                </div>
              </>
            )}
          </CardContent>
        </Card>
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

"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Copy, Calendar, DollarSign, Target } from "lucide-react"
import { format } from "date-fns"

export interface Campaign {
  id: string
  name: string
  description?: string
  platform: string
  objective: string
  budget?: number
  startDate: string
  endDate?: string
  status: "draft" | "active" | "paused" | "completed"
  createdAt: string
}

interface CampaignsTableProps {
  campaigns: Campaign[]
  onEdit?: (campaign: Campaign) => void
  onDelete?: (campaignId: string) => void
  onDuplicate?: (campaign: Campaign) => void
  onSelectionChange?: (selectedIds: string[]) => void
  selectedIds?: string[]
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
}

const objectiveLabels: Record<string, string> = {
  awareness: "Brand Awareness",
  engagement: "Engagement",
  conversions: "Conversions",
  traffic: "Traffic",
}

export function CampaignsTable({ 
  campaigns, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onSelectionChange,
  selectedIds = []
}: CampaignsTableProps) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(selectedIds)

  useEffect(() => {
    setInternalSelectedIds(selectedIds)
  }, [selectedIds])

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? campaigns.map(c => c.id) : []
    setInternalSelectedIds(newSelection)
    onSelectionChange?.(newSelection)
  }

  const handleSelectOne = (campaignId: string, checked: boolean) => {
    const newSelection = checked
      ? [...internalSelectedIds, campaignId]
      : internalSelectedIds.filter(id => id !== campaignId)
    setInternalSelectedIds(newSelection)
    onSelectionChange?.(newSelection)
  }

  const allSelected = campaigns.length > 0 && internalSelectedIds.length === campaigns.length

  const getStatusBadge = (status: Campaign["status"]) => {
    return (
      <Badge className={statusColors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "MMM dd, yyyy")
    } catch {
      return date
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return "—"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Campaign Name</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Objective</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No campaigns found.
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <Checkbox
                    checked={internalSelectedIds.includes(campaign.id)}
                    onCheckedChange={(checked) => handleSelectOne(campaign.id, checked as boolean)}
                    aria-label={`Select campaign ${campaign.id}`}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {campaign.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{campaign.platform === "all" ? "All Platforms" : campaign.platform}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    {objectiveLabels[campaign.objective] || campaign.objective}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {formatCurrency(campaign.budget)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(campaign.startDate)}
                    {campaign.endDate && ` - ${formatDate(campaign.endDate)}`}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(campaign)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDuplicate && (
                        <DropdownMenuItem onClick={() => onDuplicate(campaign)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(campaign.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}


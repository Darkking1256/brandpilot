"use client"

import { useState } from "react"
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
import { MoreVertical, Edit, Trash2, Copy, DollarSign, TrendingUp, Eye, MousePointerClick } from "lucide-react"
import { format } from "date-fns"
import type { Ad } from "@/lib/api"

interface AdsTableProps {
  ads: Ad[]
  onEdit?: (ad: Ad) => void
  onDelete?: (adId: string) => void
  onDuplicate?: (ad: Ad) => void
  onSelectionChange?: (selectedIds: string[]) => void
  selectedIds?: string[]
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  archived: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
}

const platformColors = {
  twitter: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  linkedin: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  facebook: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  instagram: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  tiktok: "bg-black text-white dark:bg-gray-900 dark:text-white",
  google: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  all: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
}

export function AdsTable({
  ads,
  onEdit,
  onDelete,
  onDuplicate,
  onSelectionChange,
  selectedIds = [],
}: AdsTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>(selectedIds)

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? ads.map((ad) => ad.id) : []
    setSelectedRows(newSelection)
    onSelectionChange?.(newSelection)
  }

  const handleSelectRow = (adId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedRows, adId]
      : selectedRows.filter((id) => id !== adId)
    setSelectedRows(newSelection)
    onSelectionChange?.(newSelection)
  }

  const handleDuplicate = (ad: Ad) => {
    onDuplicate?.(ad)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={ads.length > 0 && selectedRows.length === ads.length}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Ad Name</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Objective</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Spend</TableHead>
            <TableHead>Performance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                No ads found
              </TableCell>
            </TableRow>
          ) : (
            ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(ad.id)}
                    onCheckedChange={(checked) => handleSelectRow(ad.id, checked === true)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    <div>{ad.name}</div>
                    {ad.description && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {ad.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={platformColors[ad.platform as keyof typeof platformColors] || ""}>
                    {ad.platform}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{ad.ad_type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{ad.objective}</Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{formatCurrency(ad.budget)}</div>
                  {ad.daily_budget && (
                    <div className="text-xs text-muted-foreground">
                      ${ad.daily_budget.toFixed(2)}/day
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(ad.spend || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {ad.budget > 0
                      ? `${((ad.spend || 0) / ad.budget * 100).toFixed(1)}% used`
                      : "0%"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{formatNumber(ad.impressions || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointerClick className="h-3 w-3" />
                      <span>{formatNumber(ad.clicks || 0)}</span>
                      {ad.ctr !== undefined && (
                        <span className="text-muted-foreground">({ad.ctr.toFixed(2)}%)</span>
                      )}
                    </div>
                    {ad.cpc !== undefined && ad.cpc > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>CPC: ${ad.cpc.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[ad.status] || ""}>
                    {ad.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{format(new Date(ad.start_date), "MMM d, yyyy")}</div>
                    {ad.end_date && (
                      <div className="text-xs text-muted-foreground">
                        to {format(new Date(ad.end_date), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(ad)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(ad)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(ad.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
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


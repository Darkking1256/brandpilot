"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Calendar, FileDown, MoreHorizontal, CheckCircle2, XCircle, Pause } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BulkActionsProps {
  selectedIds: string[]
  onBulkDelete?: (ids: string[]) => void
  onBulkStatusUpdate?: (ids: string[], status: string) => void
  onBulkExport?: (ids: string[], format: "csv" | "json") => void
  type: "posts" | "campaigns"
  availableStatuses?: string[]
}

export function BulkActions({
  selectedIds,
  onBulkDelete,
  onBulkStatusUpdate,
  onBulkExport,
  type,
  availableStatuses = [],
}: BulkActionsProps) {
  const [selectedStatus, setSelectedStatus] = useState("")
  const { toast } = useToast()

  if (selectedIds.length === 0) return null

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} ${type}?`)) {
      onBulkDelete?.(selectedIds)
    }
  }

  const handleBulkStatusUpdate = () => {
    if (!selectedStatus) {
      toast({
        variant: "destructive",
        title: "Status required",
        description: "Please select a status to update.",
      })
      return
    }
    onBulkStatusUpdate?.(selectedIds, selectedStatus)
    setSelectedStatus("")
  }

  const handleExport = (format: "csv" | "json") => {
    onBulkExport?.(selectedIds, format)
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
      <span className="text-sm font-medium">
        {selectedIds.length} {selectedIds.length === 1 ? "item" : "items"} selected
      </span>
      <div className="flex gap-2 ml-auto">
        {availableStatuses.length > 0 && (
          <div className="flex gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkStatusUpdate}
              disabled={!selectedStatus}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Update
            </Button>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <MoreHorizontal className="h-4 w-4 mr-1" />
              More Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              <FileDown className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("json")}>
              <FileDown className="h-4 w-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleBulkDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}


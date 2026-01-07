"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Save, Calendar } from "lucide-react"
import { cn } from "@/utils/cn"
import { format } from "date-fns"

export interface FilterPreset {
  id: string
  name: string
  filters: FilterValues
}

export interface FilterValues {
  search?: string
  status?: string[]
  platform?: string[]
  dateRange?: {
    start: Date | null
    end: Date | null
  }
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterValues) => void
  presets?: FilterPreset[]
  onSavePreset?: (name: string, filters: FilterValues) => void
  availableStatuses?: string[]
  availablePlatforms?: string[]
}

export function AdvancedFilters({
  onFiltersChange,
  presets = [],
  onSavePreset,
  availableStatuses = ["draft", "scheduled", "published", "failed"],
  availablePlatforms = ["twitter", "linkedin", "facebook", "instagram", "tiktok", "youtube"],
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState("")

  const updateFilters = (newFilters: Partial<FilterValues>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const clearFilters = () => {
    const cleared: FilterValues = {}
    setFilters(cleared)
    onFiltersChange(cleared)
  }

  const applyPreset = (preset: FilterPreset) => {
    setFilters(preset.filters)
    onFiltersChange(preset.filters)
    setOpen(false)
  }

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters)
      setPresetName("")
      setShowSaveDialog(false)
    }
  }

  const activeFilterCount = [
    filters.search,
    filters.status?.length,
    filters.platform?.length,
    filters.dateRange?.start || filters.dateRange?.end,
  ].filter(Boolean).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Advanced Filters</h3>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>

          {/* Saved Presets */}
          {presets.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Saved Presets</Label>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="text-xs"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              placeholder="Search content..."
              value={filters.search || ""}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status?.[0] || "all"}
              onValueChange={(value) =>
                updateFilters({ status: value === "all" ? undefined : [value] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Platform Filter */}
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select
              value={filters.platform?.[0] || "all"}
              onValueChange={(value) =>
                updateFilters({ platform: value === "all" ? undefined : [value] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {availablePlatforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={
                  filters.dateRange?.start
                    ? format(filters.dateRange.start, "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) =>
                  updateFilters({
                    dateRange: {
                      start: e.target.value ? new Date(e.target.value) : null,
                      end: filters.dateRange?.end || null,
                    },
                  })
                }
                className="flex-1"
              />
              <Input
                type="date"
                value={
                  filters.dateRange?.end
                    ? format(filters.dateRange.end, "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) =>
                  updateFilters({
                    dateRange: {
                      start: filters.dateRange?.start || null,
                      end: e.target.value ? new Date(e.target.value) : null,
                    },
                  })
                }
                className="flex-1"
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs text-muted-foreground">Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {filters.search}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => updateFilters({ search: undefined })}
                    />
                  </Badge>
                )}
                {filters.status?.map((status) => (
                  <Badge key={status} variant="secondary" className="gap-1">
                    {status}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        updateFilters({
                          status: filters.status?.filter((s) => s !== status),
                        })
                      }
                    />
                  </Badge>
                ))}
                {filters.platform?.map((platform) => (
                  <Badge key={platform} variant="secondary" className="gap-1">
                    {platform}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        updateFilters({
                          platform: filters.platform?.filter((p) => p !== platform),
                        })
                      }
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Save Preset */}
          {onSavePreset && (
            <div className="pt-2 border-t">
              {showSaveDialog ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Preset name"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSavePreset} className="flex-1">
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowSaveDialog(false)
                        setPresetName("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Preset
                </Button>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}



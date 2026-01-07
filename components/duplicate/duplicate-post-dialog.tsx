"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Clock } from "lucide-react"
import type { Post } from "@/components/posts-table"
import { useToast } from "@/hooks/use-toast"
import { addDays, format } from "date-fns"

interface DuplicatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: Post | null
  onDuplicate: (options: DuplicateOptions) => Promise<void>
}

interface DuplicateOptions {
  adjustDate: boolean
  daysOffset: number
  createAsTemplate: boolean
  duplicateCount: number
}

export function DuplicatePostDialog({
  open,
  onOpenChange,
  post,
  onDuplicate,
}: DuplicatePostDialogProps) {
  const [adjustDate, setAdjustDate] = useState(true)
  const [daysOffset, setDaysOffset] = useState(7)
  const [createAsTemplate, setCreateAsTemplate] = useState(false)
  const [duplicateCount, setDuplicateCount] = useState(1)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const { toast } = useToast()

  if (!post) return null

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      await onDuplicate({
        adjustDate,
        daysOffset,
        createAsTemplate,
        duplicateCount,
      })
      onOpenChange(false)
      toast({
        title: "Posts duplicated",
        description: `${duplicateCount} post(s) have been created successfully.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Duplication failed",
        description: error instanceof Error ? error.message : "Failed to duplicate posts",
      })
    } finally {
      setIsDuplicating(false)
    }
  }

  const newDate = adjustDate
    ? format(addDays(new Date(post.scheduledDate), daysOffset), "yyyy-MM-dd")
    : post.scheduledDate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate Post</DialogTitle>
          <DialogDescription>
            Create copies of this post with optional date adjustments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Number of duplicates */}
          <div className="space-y-2">
            <Label>Number of Copies</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={duplicateCount}
              onChange={(e) => setDuplicateCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            />
          </div>

          {/* Adjust date */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="adjustDate"
              checked={adjustDate}
              onCheckedChange={(checked) => setAdjustDate(checked as boolean)}
            />
            <Label htmlFor="adjustDate" className="cursor-pointer">
              Adjust scheduled date
            </Label>
          </div>

          {adjustDate && (
            <div className="space-y-2 pl-6">
              <Label>Days to add</Label>
              <Input
                type="number"
                value={daysOffset}
                onChange={(e) => setDaysOffset(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                New date: {newDate}
              </p>
            </div>
          )}

          {/* Create as template */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="createAsTemplate"
              checked={createAsTemplate}
              onCheckedChange={(checked) => setCreateAsTemplate(checked as boolean)}
            />
            <Label htmlFor="createAsTemplate" className="cursor-pointer">
              Save as template for reuse
            </Label>
          </div>

          {/* Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <p className="text-sm text-muted-foreground mb-1">
              {duplicateCount} copy/copies will be created
            </p>
            {adjustDate && (
              <p className="text-sm text-muted-foreground">
                Scheduled for: {newDate} at {post.scheduledTime}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDuplicate} disabled={isDuplicating}>
            {isDuplicating ? "Duplicating..." : `Create ${duplicateCount} Copy${duplicateCount > 1 ? "ies" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


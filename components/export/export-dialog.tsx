"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Download, Calendar, Image } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingButton } from "@/components/loading-button"

interface ExportDialogProps {
  type: "posts" | "campaigns"
  selectedIds?: string[]
  trigger?: React.ReactNode
}

export function ExportDialog({ type, selectedIds, trigger }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<"csv" | "json" | "pdf" | "excel">("csv")
  const [includeImages, setIncludeImages] = useState(false)
  const [customFields, setCustomFields] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const availableFields =
    type === "posts"
      ? ["id", "content", "platform", "status", "scheduled_date", "scheduled_time", "image_url", "link_url", "created_at"]
      : ["id", "name", "description", "platform", "status", "start_date", "end_date", "budget", "created_at"]

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/export/enhanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          format,
          ids: selectedIds,
          includeImages,
          customFields: customFields.length > 0 ? customFields : undefined,
          dateRange: dateRange.start || dateRange.end ? dateRange : undefined,
        }),
      })

      if (!response.ok) throw new Error("Export failed")

      // Download file
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-export-${Date.now()}.${format === "excel" ? "xlsx" : format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: `Your ${type} have been exported as ${format.toUpperCase()}.`,
      })
      setOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export data",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const toggleField = (field: string) => {
    setCustomFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
          <DialogDescription>
            Choose export format and options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include Images */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeImages"
              checked={includeImages}
              onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
            />
            <Label htmlFor="includeImages" className="cursor-pointer flex items-center gap-2">
              <Image className="h-4 w-4" />
              Include images in export
            </Label>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range (Optional)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Custom Fields */}
          <div className="space-y-2">
            <Label>Select Fields (Leave empty for all fields)</Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-48 overflow-y-auto">
              {availableFields.map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={customFields.includes(field)}
                    onCheckedChange={() => toggleField(field)}
                  />
                  <Label htmlFor={field} className="cursor-pointer text-sm">
                    {field.replace(/_/g, " ")}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Selection Info */}
          {selectedIds && selectedIds.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                Exporting <strong>{selectedIds.length}</strong> selected {type}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <LoadingButton onClick={handleExport} loading={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


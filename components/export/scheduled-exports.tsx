"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Clock, Play, Pause, Trash2, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface ScheduledExport {
  id: string
  name: string
  entityType: "posts" | "campaigns" | "analytics"
  format: "csv" | "json" | "pdf" | "excel"
  includeImages: boolean
  scheduleType: "daily" | "weekly" | "monthly" | "custom"
  scheduleConfig: Record<string, any>
  emailRecipients: string[]
  enabled: boolean
  lastRunAt?: string
  nextRunAt?: string
}

export function ScheduledExports() {
  const [exports, setExports] = useState<ScheduledExport[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newExport, setNewExport] = useState<Partial<ScheduledExport>>({
    name: "",
    entityType: "posts",
    format: "csv",
    includeImages: false,
    scheduleType: "daily",
    emailRecipients: [],
  })
  const [emailInput, setEmailInput] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchExports()
  }, [])

  const fetchExports = async () => {
    try {
      const response = await fetch("/api/exports/scheduled")
      if (response.ok) {
        const data = await response.json()
        setExports(data.exports || [])
      }
    } catch (error) {
      console.error("Failed to fetch scheduled exports", error)
    }
  }

  const handleCreate = async () => {
    if (!newExport.name || !newExport.entityType || !newExport.format) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields",
      })
      return
    }

    try {
      const response = await fetch("/api/exports/scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExport),
      })

      if (!response.ok) throw new Error("Failed to create scheduled export")

      toast({
        title: "Scheduled export created",
        description: `${newExport.name} has been scheduled successfully.`,
      })
      setIsCreating(false)
      setNewExport({
        name: "",
        entityType: "posts",
        format: "csv",
        includeImages: false,
        scheduleType: "daily",
        emailRecipients: [],
      })
      fetchExports()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/exports/scheduled/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      })

      if (!response.ok) throw new Error("Failed to update")

      toast({
        title: enabled ? "Export paused" : "Export enabled",
        description: `Scheduled export has been ${enabled ? "paused" : "enabled"}.`,
      })
      fetchExports()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/exports/scheduled/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: "Export deleted",
        description: "Scheduled export has been removed.",
      })
      fetchExports()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  const addEmail = () => {
    if (emailInput.trim() && !newExport.emailRecipients?.includes(emailInput.trim())) {
      setNewExport({
        ...newExport,
        emailRecipients: [...(newExport.emailRecipients || []), emailInput.trim()],
      })
      setEmailInput("")
    }
  }

  const removeEmail = (email: string) => {
    setNewExport({
      ...newExport,
      emailRecipients: newExport.emailRecipients?.filter((e) => e !== email) || [],
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduled Exports
            </CardTitle>
            <CardDescription>
              Automatically export your data on a schedule
            </CardDescription>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Export
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Scheduled Export</DialogTitle>
                <DialogDescription>
                  Set up automatic exports that run on a schedule
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Export Name</Label>
                  <Input
                    placeholder="My Weekly Report"
                    value={newExport.name}
                    onChange={(e) => setNewExport({ ...newExport, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entity Type</Label>
                    <Select
                      value={newExport.entityType}
                      onValueChange={(v) => setNewExport({ ...newExport, entityType: v as typeof newExport.entityType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="posts">Posts</SelectItem>
                        <SelectItem value="campaigns">Campaigns</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select
                      value={newExport.format}
                      onValueChange={(v) => setNewExport({ ...newExport, format: v as typeof newExport.format })}
                    >
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
                </div>

                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <Select
                    value={newExport.scheduleType}
                    onValueChange={(v) => setNewExport({ ...newExport, scheduleType: v as typeof newExport.scheduleType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeImages"
                    checked={newExport.includeImages}
                    onCheckedChange={(checked) => setNewExport({ ...newExport, includeImages: checked as boolean })}
                  />
                  <Label htmlFor="includeImages" className="cursor-pointer">
                    Include images
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Email Recipients</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addEmail()}
                    />
                    <Button type="button" onClick={addEmail}>
                      Add
                    </Button>
                  </div>
                  {newExport.emailRecipients && newExport.emailRecipients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newExport.emailRecipients.map((email) => (
                        <Badge key={email} variant="secondary" className="gap-1">
                          <Mail className="h-3 w-3" />
                          {email}
                          <button
                            onClick={() => removeEmail(email)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {exports.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scheduled exports</p>
            <p className="text-sm mt-2">Create your first scheduled export</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exports.map((exportItem) => (
              <div
                key={exportItem.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{exportItem.name}</span>
                    <Badge variant="outline">{exportItem.entityType}</Badge>
                    <Badge variant="secondary">{exportItem.format.toUpperCase()}</Badge>
                    <Badge variant={exportItem.enabled ? "default" : "secondary"}>
                      {exportItem.enabled ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>Schedule: {exportItem.scheduleType}</span>
                    {exportItem.nextRunAt && (
                      <>
                        <span> • </span>
                        <span>Next run: {format(new Date(exportItem.nextRunAt), "MMM d, yyyy h:mm a")}</span>
                      </>
                    )}
                    {exportItem.emailRecipients.length > 0 && (
                      <>
                        <span> • </span>
                        <span>{exportItem.emailRecipients.length} recipient(s)</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggle(exportItem.id, exportItem.enabled)}
                  >
                    {exportItem.enabled ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(exportItem.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


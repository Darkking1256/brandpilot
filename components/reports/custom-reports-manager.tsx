"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Edit, Trash2, Download, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CustomReportForm } from "./custom-report-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns"

interface CustomReport {
  id: string
  name: string
  description?: string
  is_scheduled: boolean
  last_generated_at?: string
  created_at: string
}

export function CustomReportsManager() {
  const [reports, setReports] = useState<CustomReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<CustomReport | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/custom-reports")
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error("Failed to fetch reports", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async (reportId: string) => {
    try {
      const response = await fetch(`/api/custom-reports/${reportId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "pdf" }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Report generated",
          description: "Your report has been generated successfully.",
        })
        if (data.file_url) {
          window.open(data.file_url, "_blank")
        }
        fetchReports()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to generate report",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) {
      return
    }

    try {
      const response = await fetch(`/api/custom-reports/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "Report deleted",
        })
        fetchReports()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            Custom Reports
          </CardTitle>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingReport(null)}>
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingReport ? "Edit Report" : "Create Custom Report"}
                </DialogTitle>
              </DialogHeader>
              <CustomReportForm
                report={editingReport}
                onSuccess={() => {
                  setIsFormOpen(false)
                  fetchReports()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No custom reports yet.</p>
            <p className="text-sm mt-1">Create a custom report to track your metrics.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{report.name}</h4>
                      {report.is_scheduled && (
                        <Badge variant="default">
                          <Calendar className="h-3 w-3 mr-1" />
                          Scheduled
                        </Badge>
                      )}
                    </div>
                    {report.description && (
                      <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                    )}
                    {report.last_generated_at && (
                      <p className="text-xs text-muted-foreground">
                        Last generated: {format(new Date(report.last_generated_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerate(report.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingReport(report)
                        setIsFormOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(report.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


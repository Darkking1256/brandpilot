"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Download, ExternalLink, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export function CalendarExport() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleExportICal = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/calendar/export/ical")
      if (!response.ok) {
        throw new Error("Failed to export calendar")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "content-calendar.ics"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Calendar exported",
        description: "iCal file downloaded successfully. You can import it into any calendar app.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export calendar. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportGoogle = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/calendar/export/google")
      if (!response.ok) {
        throw new Error("Failed to generate Google Calendar link")
      }

      const data = await response.json()

      toast({
        title: "Opening Google Calendar",
        description: data.message || "Add this calendar to your Google Calendar.",
      })

      // Open Google Calendar in new tab
      window.open(data.url, "_blank")

      // Also provide option to download iCal for import
      setTimeout(() => {
        if (confirm("Would you like to download the iCal file to import into Google Calendar?")) {
          handleExportICal()
        }
      }, 1000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to open Google Calendar. Please try downloading the iCal file instead.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={handleExportICal}
        disabled={isExporting}
        className="border-slate-700/50 bg-slate-800/50 text-slate-300 hover:text-white hover:border-blue-500/50"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Export iCal
      </Button>
      <Button
        variant="outline"
        onClick={handleExportGoogle}
        disabled={isExporting}
        className="border-slate-700/50 bg-slate-800/50 text-slate-300 hover:text-white hover:border-blue-500/50"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <ExternalLink className="h-4 w-4 mr-2" />
        )}
        Add to Google Calendar
      </Button>
    </div>
  )
}


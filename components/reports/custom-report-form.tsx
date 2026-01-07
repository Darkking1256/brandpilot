"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/loading-button"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

const reportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  is_scheduled: z.boolean().default(false),
})

type ReportFormData = z.infer<typeof reportSchema>

interface CustomReportFormProps {
  report?: any
  onSuccess: () => void
}

export function CustomReportForm({ report, onSuccess }: CustomReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: report
      ? {
          name: report.name,
          description: report.description || "",
          is_scheduled: report.is_scheduled || false,
        }
      : {
          is_scheduled: false,
        },
  })

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true)
    try {
      // Default report config - in production, this would be a more complex builder
      const reportConfig = {
        metrics: ["engagement", "reach", "clicks"],
        dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
        filters: {},
        chartTypes: ["line", "bar"],
        layout: "standard",
      }

      const url = report ? `/api/custom-reports/${report.id}` : "/api/custom-reports"
      const method = report ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          report_config: reportConfig,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save report")
      }

      toast({
        title: report ? "Report updated" : "Report created",
        description: "Your custom report has been saved successfully.",
      })

      onSuccess()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: "There was an error saving the report.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Report Name *</Label>
        <Input id="name" {...form.register("name")} placeholder="e.g., Weekly Performance Report" />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          rows={3}
          placeholder="Describe what this report tracks..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_scheduled"
          checked={form.watch("is_scheduled")}
          onCheckedChange={(checked) => form.setValue("is_scheduled", checked as boolean)}
        />
        <Label htmlFor="is_scheduled" className="text-sm font-normal cursor-pointer">
          Schedule automatic generation
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <LoadingButton type="submit" loading={isSubmitting} loadingText="Saving...">
          {report ? "Update" : "Create"} Report
        </LoadingButton>
      </div>
    </form>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DollarSign, Target, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Campaign } from "@/components/campaigns-table"
import { LoadingButton } from "@/components/loading-button"
import { createCampaign, updateCampaign } from "@/lib/api"

const campaignSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  platform: z.enum(["twitter", "linkedin", "facebook", "instagram", "tiktok", "youtube", "all"], {
    required_error: "Please select a platform",
  }),
  budget: z.string().optional(),
  startDate: z.string().min(1, "Please select a start date"),
  endDate: z.string().optional(),
  objective: z.enum(["awareness", "engagement", "conversions", "traffic"], {
    required_error: "Please select an objective",
  }),
})

type CampaignFormValues = z.infer<typeof campaignSchema>

interface CreateCampaignFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: CampaignFormValues) => void
  campaign?: Campaign | null
  mode?: "create" | "edit"
}

export function CreateCampaignForm({ 
  open, 
  onOpenChange, 
  onSubmit: onSubmitCallback,
  campaign,
  mode = "create"
}: CreateCampaignFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      description: "",
      platform: undefined,
      budget: "",
      startDate: "",
      endDate: "",
      objective: undefined,
    },
  })

  // Pre-fill form when editing
  useEffect(() => {
    if (open && campaign && mode === "edit") {
      form.reset({
        name: campaign.name,
        description: campaign.description || "",
        platform: campaign.platform as "twitter" | "linkedin" | "facebook" | "instagram" | "tiktok" | "all",
        budget: campaign.budget?.toString() || "",
        startDate: campaign.startDate,
        endDate: campaign.endDate || "",
        objective: campaign.objective as "awareness" | "engagement" | "conversions" | "traffic",
      })
    } else if (open && mode === "create") {
      form.reset({
        name: "",
        description: "",
        platform: undefined,
        budget: "",
        startDate: "",
        endDate: "",
        objective: undefined,
      })
    }
  }, [open, campaign, mode, form])

  const onSubmit = async (data: CampaignFormValues) => {
    setIsSubmitting(true)
    try {
      if (mode === "edit" && campaign) {
        // Update existing campaign
        await updateCampaign(campaign.id, {
          name: data.name,
          description: data.description || undefined,
          platform: data.platform,
          objective: data.objective,
          budget: data.budget ? parseFloat(data.budget) : undefined,
          startDate: data.startDate,
          endDate: data.endDate || undefined,
        })
        
        toast({
          variant: "success",
          title: "Campaign updated successfully!",
          description: `"${data.name}" has been updated successfully.`,
        })
      } else {
        // Create new campaign
        await createCampaign({
          name: data.name,
          description: data.description || undefined,
          platform: data.platform,
          objective: data.objective,
          budget: data.budget ? parseFloat(data.budget) : undefined,
          startDate: data.startDate,
          endDate: data.endDate || undefined,
        })
        
        toast({
          variant: "success",
          title: "Campaign created successfully!",
          description: `"${data.name}" has been created and is ready to launch.`,
        })
      }
      
      // Call the onSubmit callback if provided
      if (onSubmitCallback) {
        onSubmitCallback(data)
      }
      
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving campaign:", error)
      toast({
        variant: "destructive",
        title: mode === "edit" ? "Failed to update campaign" : "Failed to create campaign",
        description: error instanceof Error ? error.message : "There was an error saving your campaign. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{mode === "edit" ? "Edit Campaign" : "Create New Campaign"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update your campaign details and settings"
              : "Set up a new marketing campaign to reach your audience"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Summer Sale 2025"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your campaign goals and strategy..."
              rows={4}
              {...form.register("description")}
              className="resize-none"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Platform & Objective */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select
                value={form.watch("platform")}
                onValueChange={(value) => form.setValue("platform", value as any)}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.platform && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.platform.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Objective *
              </Label>
              <Select
                value={form.watch("objective")}
                onValueChange={(value) => form.setValue("objective", value as any)}
              >
                <SelectTrigger id="objective">
                  <SelectValue placeholder="Select objective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="conversions">Conversions</SelectItem>
                  <SelectItem value="traffic">Traffic</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.objective && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.objective.message}
                </p>
              )}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget (Optional)
            </Label>
            <Input
              id="budget"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              {...form.register("budget")}
            />
            {form.formState.errors.budget && (
              <p className="text-sm text-destructive">
                {form.formState.errors.budget.message}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                {...form.register("startDate")}
              />
              {form.formState.errors.startDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                min={form.watch("startDate") || new Date().toISOString().split("T")[0]}
                {...form.register("endDate")}
              />
              {form.formState.errors.endDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              loadingText={mode === "edit" ? "Updating..." : "Creating..."}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              {mode === "edit" ? "Update Campaign" : "Create Campaign"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


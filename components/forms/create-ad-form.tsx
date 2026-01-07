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
import { DollarSign, Target, Calendar, Image, Link2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingButton } from "@/components/loading-button"
import { createAd, updateAd } from "@/lib/api"
import type { Ad } from "@/lib/api"

const adSchema = z.object({
  name: z.string().min(3, "Ad name must be at least 3 characters"),
  description: z.string().optional(),
  platform: z.enum(["twitter", "linkedin", "facebook", "instagram", "tiktok", "google", "youtube", "all"], {
    required_error: "Please select a platform",
  }),
  ad_type: z.enum(["image", "video", "carousel", "story", "sponsored"], {
    required_error: "Please select an ad type",
  }),
  objective: z.enum(["awareness", "traffic", "engagement", "conversions", "leads", "sales"], {
    required_error: "Please select an objective",
  }),
  budget: z.string().min(1, "Budget is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Budget must be a positive number",
  }),
  daily_budget: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Daily budget must be a positive number",
  }),
  bid_strategy: z.enum(["lowest_cost", "cost_cap", "bid_cap", "target_cost"]).optional(),
  creative_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  creative_type: z.enum(["image", "video", "carousel"]).optional(),
  landing_page_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  start_date: z.string().min(1, "Please select a start date"),
  end_date: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "completed", "archived"]).optional(),
})

type AdFormValues = z.infer<typeof adSchema>

interface CreateAdFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: AdFormValues) => void
  ad?: Ad | null
  mode?: "create" | "edit"
}

export function CreateAdForm({
  open,
  onOpenChange,
  onSubmit: onSubmitCallback,
  ad,
  mode = "create",
}: CreateAdFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<AdFormValues>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      name: "",
      description: "",
      platform: undefined,
      ad_type: undefined,
      objective: undefined,
      budget: "",
      daily_budget: "",
      bid_strategy: undefined,
      creative_url: "",
      creative_type: undefined,
      landing_page_url: "",
      start_date: "",
      end_date: "",
      status: "draft",
    },
  })

  // Pre-fill form when editing
  useEffect(() => {
    if (open && ad && mode === "edit") {
      form.reset({
        name: ad.name,
        description: ad.description || "",
        platform: ad.platform as any,
        ad_type: ad.ad_type,
        objective: ad.objective,
        budget: ad.budget.toString(),
        daily_budget: ad.daily_budget?.toString() || "",
        bid_strategy: ad.bid_strategy as any,
        creative_url: ad.creative_url || "",
        creative_type: ad.creative_type as any,
        landing_page_url: ad.landing_page_url || "",
        start_date: ad.start_date,
        end_date: ad.end_date || "",
        status: ad.status,
      })
    } else if (open && mode === "create") {
      form.reset({
        name: "",
        description: "",
        platform: undefined,
        ad_type: undefined,
        objective: undefined,
        budget: "",
        daily_budget: "",
        bid_strategy: undefined,
        creative_url: "",
        creative_type: undefined,
        landing_page_url: "",
        start_date: "",
        end_date: "",
        status: "draft",
      })
    }
  }, [open, ad, mode, form])

  const onSubmit = async (data: AdFormValues) => {
    setIsSubmitting(true)
    try {
      const adData = {
        name: data.name,
        description: data.description || undefined,
        platform: data.platform,
        ad_type: data.ad_type,
        objective: data.objective,
        budget: Number(data.budget),
        daily_budget: data.daily_budget ? Number(data.daily_budget) : undefined,
        bid_strategy: data.bid_strategy,
        creative_url: data.creative_url || undefined,
        creative_type: data.creative_type,
        landing_page_url: data.landing_page_url || undefined,
        start_date: data.start_date,
        end_date: data.end_date || undefined,
        status: data.status || "draft",
      }

      if (mode === "edit" && ad) {
        await updateAd(ad.id, adData)
        toast({
          title: "Ad updated successfully!",
          description: `Your ad "${data.name}" has been updated.`,
        })
      } else {
        await createAd(adData)
        toast({
          title: "Ad created successfully!",
          description: `Your ad "${data.name}" has been created.`,
        })
      }

      onSubmitCallback?.(data)
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${mode === "edit" ? "update" : "create"} ad`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Ad" : "Create New Ad"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Update your ad campaign details" : "Set up a new advertising campaign"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Summer Sale Campaign"
                className={form.formState.errors.name ? "border-red-500" : ""}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select
                value={form.watch("platform")}
                onValueChange={(value) => form.setValue("platform", value as any)}
              >
                <SelectTrigger className={form.formState.errors.platform ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                  <SelectItem value="all">All Platforms</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.platform && (
                <p className="text-sm text-red-500">{form.formState.errors.platform.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe your ad campaign..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ad_type">Ad Type *</Label>
              <Select
                value={form.watch("ad_type")}
                onValueChange={(value) => form.setValue("ad_type", value as any)}
              >
                <SelectTrigger className={form.formState.errors.ad_type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select ad type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="sponsored">Sponsored</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.ad_type && (
                <p className="text-sm text-red-500">{form.formState.errors.ad_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Objective *</Label>
              <Select
                value={form.watch("objective")}
                onValueChange={(value) => form.setValue("objective", value as any)}
              >
                <SelectTrigger className={form.formState.errors.objective ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select objective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="traffic">Traffic</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="conversions">Conversions</SelectItem>
                  <SelectItem value="leads">Lead Generation</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.objective && (
                <p className="text-sm text-red-500">{form.formState.errors.objective.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Total Budget ($) *</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                {...form.register("budget")}
                placeholder="1000.00"
                className={form.formState.errors.budget ? "border-red-500" : ""}
              />
              {form.formState.errors.budget && (
                <p className="text-sm text-red-500">{form.formState.errors.budget.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily_budget">Daily Budget ($)</Label>
              <Input
                id="daily_budget"
                type="number"
                step="0.01"
                min="0"
                {...form.register("daily_budget")}
                placeholder="50.00"
              />
              {form.formState.errors.daily_budget && (
                <p className="text-sm text-red-500">{form.formState.errors.daily_budget.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bid_strategy">Bid Strategy</Label>
            <Select
              value={form.watch("bid_strategy")}
              onValueChange={(value) => form.setValue("bid_strategy", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bid strategy (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lowest_cost">Lowest Cost</SelectItem>
                <SelectItem value="cost_cap">Cost Cap</SelectItem>
                <SelectItem value="bid_cap">Bid Cap</SelectItem>
                <SelectItem value="target_cost">Target Cost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                {...form.register("start_date")}
                className={form.formState.errors.start_date ? "border-red-500" : ""}
              />
              {form.formState.errors.start_date && (
                <p className="text-sm text-red-500">{form.formState.errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                {...form.register("end_date")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creative_url">Creative URL</Label>
            <Input
              id="creative_url"
              type="url"
              {...form.register("creative_url")}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creative_type">Creative Type</Label>
              <Select
                value={form.watch("creative_type")}
                onValueChange={(value) => form.setValue("creative_type", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="landing_page_url">Landing Page URL</Label>
              <Input
                id="landing_page_url"
                type="url"
                {...form.register("landing_page_url")}
                placeholder="https://example.com/landing"
              />
            </div>
          </div>

          {mode === "edit" && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton type="submit" isLoading={isSubmitting}>
              <DollarSign className="h-4 w-4 mr-2" />
              {mode === "edit" ? "Update Ad" : "Create Ad"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


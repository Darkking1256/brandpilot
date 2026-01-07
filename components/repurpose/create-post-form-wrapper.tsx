"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { LoadingButton } from "@/components/loading-button"
import { createPost } from "@/lib/api"
import { Calendar } from "lucide-react"

const postSchema = z.object({
  content: z.string().min(10, "Content must be at least 10 characters"),
  platform: z.enum(["twitter", "linkedin", "facebook", "instagram", "tiktok"], {
    required_error: "Please select a platform",
  }),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  linkUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

type PostFormValues = z.infer<typeof postSchema>

interface CreatePostFormWrapperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialContent?: string
  initialPlatform?: string
  onSuccess?: () => void
}

export function CreatePostFormWithInitialData({
  open,
  onOpenChange,
  initialContent,
  initialPlatform,
  onSuccess,
}: CreatePostFormWrapperProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: initialContent || "",
      platform: (initialPlatform as any) || undefined,
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: new Date().toTimeString().slice(0, 5),
      imageUrl: "",
      linkUrl: "",
    },
  })

  // Reset form when initial data changes
  useEffect(() => {
    if (open && initialContent) {
      form.reset({
        content: initialContent,
        platform: (initialPlatform as any) || undefined,
        scheduledDate: new Date().toISOString().split("T")[0],
        scheduledTime: new Date().toTimeString().slice(0, 5),
        imageUrl: "",
        linkUrl: "",
      })
    }
  }, [open, initialContent, initialPlatform, form])

  const onSubmit = async (data: PostFormValues) => {
    setIsSubmitting(true)
    try {
      await createPost({
        content: data.content,
        platform: data.platform,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        imageUrl: data.imageUrl || undefined,
        linkUrl: data.linkUrl || undefined,
      })

      toast({
        title: "Post created successfully!",
        description: `Your repurposed content has been saved as a post for ${data.platform}.`,
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Save as Post</DialogTitle>
          <DialogDescription>
            Schedule this repurposed content as a post
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              {...form.register("content")}
              rows={6}
              className={form.formState.errors.content ? "border-red-500" : ""}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-500">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={form.watch("platform")}
                onValueChange={(value) => form.setValue("platform", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.platform && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.platform.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                {...form.register("scheduledDate")}
                className={form.formState.errors.scheduledDate ? "border-red-500" : ""}
              />
              {form.formState.errors.scheduledDate && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.scheduledDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledTime">Scheduled Time</Label>
            <Input
              id="scheduledTime"
              type="time"
              {...form.register("scheduledTime")}
              className={form.formState.errors.scheduledTime ? "border-red-500" : ""}
            />
            {form.formState.errors.scheduledTime && (
              <p className="text-sm text-red-500">
                {form.formState.errors.scheduledTime.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...form.register("imageUrl")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkUrl">Link URL (Optional)</Label>
              <Input
                id="linkUrl"
                type="url"
                placeholder="https://example.com"
                {...form.register("linkUrl")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton type="submit" isLoading={isSubmitting}>
              <Calendar className="h-4 w-4 mr-2" />
              Create Post
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


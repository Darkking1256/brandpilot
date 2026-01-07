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
import { Calendar, Image, Link2, Sparkles, Wand2, FileText, Video, Upload, X, FileImage, FileVideo } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Post } from "@/components/posts-table"
import { LoadingButton } from "@/components/loading-button"
import { createPost, updatePost } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIContentGenerator } from "@/components/ai/ai-content-generator"
import { AIPostOptimizer } from "@/components/ai/ai-post-optimizer"
import { TemplateLibrary } from "@/components/templates/template-library"
import { useAutosave } from "@/hooks/use-autosave"
import { PostPreview } from "@/components/post-preview/post-preview"
import { MediaLibrary } from "@/components/media/media-library"
import { Eye } from "lucide-react"
import { useRef, useCallback } from "react"

const postSchema = z.object({
  content: z.string().min(10, "Content must be at least 10 characters"),
  platform: z.enum(["twitter", "linkedin", "facebook", "instagram", "tiktok", "youtube"], {
    required_error: "Please select a platform",
  }),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledTime: z.string().min(1, "Please select a time"),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  linkUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

type PostFormValues = z.infer<typeof postSchema>

interface CreatePostFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: PostFormValues) => void
  post?: Post | null
  mode?: "create" | "edit"
}

export function CreatePostForm({ 
  open, 
  onOpenChange, 
  onSubmit: onSubmitCallback,
  post,
  mode = "create"
}: CreatePostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftPostId, setDraftPostId] = useState<string | null>(null)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string>("")
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileSelect = (file: File) => {
    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")
    
    if (!isImage && !isVideo) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image (JPG, PNG, GIF) or video (MP4, WebM)",
      })
      return
    }

    // Check file size (10MB for images, 100MB for videos)
    const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Maximum file size is ${isImage ? "10MB" : "100MB"}`,
      })
      return
    }

    setMediaFile(file)
    setMediaType(isImage ? "image" : "video")
    setMediaPreview(URL.createObjectURL(file))
    
    // Clear URL field when file is uploaded
    form.setValue("imageUrl", "")
  }

  const clearMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview)
    }
    setMediaFile(null)
    setMediaPreview("")
    setMediaType(null)
  }

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      platform: undefined,
      scheduledDate: "",
      scheduledTime: "",
      imageUrl: "",
      linkUrl: "",
    },
  })

  // Autosave draft
  const watchedData = form.watch()
  const { isSaving } = useAutosave({
    data: watchedData,
    onSave: async (data) => {
      if (mode === "create" && form.formState.isDirty) {
        const response = await fetch("/api/posts/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draftData: data, postId: draftPostId }),
        })
        if (response.ok) {
          const result = await response.json()
          if (result.postId && !draftPostId) {
            setDraftPostId(result.postId)
          }
        }
      }
    },
    enabled: mode === "create" && open && form.formState.isDirty,
    interval: 3000,
  })

  // Pre-fill form when editing
  useEffect(() => {
    if (open && post && mode === "edit") {
      form.reset({
        content: post.content,
        platform: post.platform as "twitter" | "linkedin" | "facebook" | "instagram" | "tiktok" | "youtube",
        scheduledDate: post.scheduledDate,
        scheduledTime: post.scheduledTime,
        imageUrl: post.imageUrl || "",
        linkUrl: post.linkUrl || "",
      })
      setDraftPostId(post.id)
      clearMedia() // Clear any uploaded media when loading existing post
    } else if (open && mode === "create") {
      form.reset({
        content: "",
        platform: undefined,
        scheduledDate: "",
        scheduledTime: "",
        imageUrl: "",
        linkUrl: "",
      })
      setDraftPostId(null)
      clearMedia() // Clear any uploaded media
    }
  }, [open, post, mode, form])

  const uploadMedia = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append("files", file)
      
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload media")
      }
      
      const result = await response.json()
      // API returns { assets: [...] }, get the first asset's file_url
      if (result.assets && result.assets.length > 0) {
        return result.assets[0].file_url
      }
      return null
    } catch (error) {
      console.error("Error uploading media:", error)
      return null
    }
  }

  const onSubmit = async (data: PostFormValues) => {
    setIsSubmitting(true)
    try {
      let imageUrl = data.imageUrl || undefined
      
      // Upload media file if present
      if (mediaFile) {
        const uploadedUrl = await uploadMedia(mediaFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          toast({
            variant: "destructive",
            title: "Failed to upload media",
            description: "Your post will be created without the media attachment.",
          })
        }
      }
      
      if (mode === "edit" && post) {
        // Update existing post
        await updatePost(post.id, {
          content: data.content,
          platform: data.platform,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          imageUrl: imageUrl,
          linkUrl: data.linkUrl || undefined,
        })
        
        toast({
          variant: "success",
          title: "Post updated successfully!",
          description: `Your post has been updated and will be published on ${data.platform} on ${data.scheduledDate} at ${data.scheduledTime}.`,
        })
      } else {
        // Create new post
        await createPost({
          content: data.content,
          platform: data.platform,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          imageUrl: imageUrl,
          linkUrl: data.linkUrl || undefined,
        })
        
        toast({
          variant: "success",
          title: "Post scheduled successfully!",
          description: `Your post has been scheduled for ${data.platform} on ${data.scheduledDate} at ${data.scheduledTime}.`,
        })
      }
      
      // Call the onSubmit callback if provided
      if (onSubmitCallback) {
        onSubmitCallback(data)
      }
      
      form.reset()
      clearMedia()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving post:", error)
      toast({
        variant: "destructive",
        title: mode === "edit" ? "Failed to update post" : "Failed to schedule post",
        description: error instanceof Error ? error.message : "There was an error saving your post. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{mode === "edit" ? "Edit Post" : "Create New Post"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" 
              ? "Update your scheduled post details"
              : "Schedule a new post for your social media platforms"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select
              value={form.watch("platform")}
              onValueChange={(value) => form.setValue("platform", value as any)}
            >
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
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

          {/* Content with AI Features */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentContent = form.getValues("content")
                    if (currentContent) {
                      // Open optimizer with current content
                      const optimizerDialog = document.createElement("div")
                      // We'll handle this differently - show optimizer inline
                    }
                  }}
                  className="text-xs"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Optimize
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="manual">Write</TabsTrigger>
                <TabsTrigger value="ai-generate">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generate
                </TabsTrigger>
                <TabsTrigger value="ai-optimize">
                  <Wand2 className="h-3 w-3 mr-1" />
                  AI Optimize
                </TabsTrigger>
                <TabsTrigger value="templates">
                  <FileText className="h-3 w-3 mr-1" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-2">
                <Textarea
                  id="content"
                  placeholder="What's on your mind?"
                  rows={6}
                  {...form.register("content")}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  {form.formState.errors.content && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.content.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground ml-auto">
                    {form.watch("content")?.length || 0} characters
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="ai-generate" className="space-y-2">
                <AIContentGenerator
                  platform={form.watch("platform")}
                  onContentGenerated={(content) => {
                    form.setValue("content", content)
                  }}
                />
              </TabsContent>
              
              <TabsContent value="ai-optimize" className="space-y-2">
                <AIPostOptimizer
                  initialContent={form.watch("content")}
                  platform={form.watch("platform")}
                  onOptimized={(content) => {
                    form.setValue("content", content)
                  }}
                />
              </TabsContent>
              
              <TabsContent value="templates" className="space-y-2">
                <TemplateLibrary
                  type="post"
                  onSelectTemplate={(template) => {
                    const content = template.content
                    if (content.content) form.setValue("content", content.content)
                    if (content.platform) form.setValue("platform", content.platform)
                    if (content.imageUrl) form.setValue("imageUrl", content.imageUrl)
                    if (content.linkUrl) form.setValue("linkUrl", content.linkUrl)
                    toast({
                      variant: "success",
                      title: "Template loaded",
                      description: `"${template.name}" template has been loaded.`,
                    })
                  }}
                  onSaveAsTemplate={(saveFn) => {
                    // Store save function for later use
                    ;(window as any).savePostTemplate = () => {
                      const formData = form.getValues()
                      saveFn({
                        content: formData.content,
                        platform: formData.platform,
                        imageUrl: formData.imageUrl,
                        linkUrl: formData.linkUrl,
                      })
                    }
                  }}
                />
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-2">
                {form.watch("content") || mediaPreview || form.watch("imageUrl") ? (
                  <PostPreview
                    content={form.watch("content") || ""}
                    platform={form.watch("platform") || "twitter"}
                    imageUrl={mediaPreview || form.watch("imageUrl") || undefined}
                    linkUrl={form.watch("linkUrl") || undefined}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Add content to see preview</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Media (Optional)
            </Label>
            
            {/* Drag & Drop Zone */}
            {!mediaPreview && !form.watch("imageUrl") && (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  isDragging 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2">
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                    <FileVideo className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">
                    Drag & drop image or video here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse (JPG, PNG, GIF, MP4, WebM)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max: 10MB for images, 100MB for videos
                  </p>
                </div>
              </div>
            )}

            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative">
                {mediaType === "image" ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    className="w-full h-48 object-contain rounded-lg border bg-black"
                    controls
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={clearMedia}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    {mediaType === "image" ? <FileImage className="h-3 w-3" /> : <FileVideo className="h-3 w-3" />}
                    {mediaFile?.name}
                  </span>
                </div>
              </div>
            )}

            {/* URL Input Alternative */}
            {!mediaPreview && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or paste URL</span>
                  </div>
                </div>
                
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  {...form.register("imageUrl")}
                />
                {form.formState.errors.imageUrl && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.imageUrl.message}
                  </p>
                )}
                {form.watch("imageUrl") && (
                  <div className="relative">
                    <img
                      src={form.watch("imageUrl")}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => form.setValue("imageUrl", "")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Link URL */}
          <div className="space-y-2">
            <Label htmlFor="linkUrl" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Link URL (Optional)
            </Label>
            <Input
              id="linkUrl"
              type="url"
              placeholder="https://example.com"
              {...form.register("linkUrl")}
            />
            {form.formState.errors.linkUrl && (
              <p className="text-sm text-destructive">
                {form.formState.errors.linkUrl.message}
              </p>
            )}
          </div>

          {/* Schedule Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date *
              </Label>
              <Input
                id="scheduledDate"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                {...form.register("scheduledDate")}
              />
              {form.formState.errors.scheduledDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.scheduledDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Time *</Label>
              <Input
                id="scheduledTime"
                type="time"
                {...form.register("scheduledTime")}
              />
              {form.formState.errors.scheduledTime && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.scheduledTime.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex-1 text-xs text-muted-foreground">
              {isSaving && mode === "create" && (
                <span className="flex items-center gap-1">
                  <span className="animate-pulse">●</span>
                  Saving draft...
                </span>
              )}
            </div>
            <div className="flex gap-2">
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
                loadingText={mode === "edit" ? "Updating..." : "Scheduling..."}
                className="bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                {mode === "edit" ? "Update Post" : "Schedule Post"}
              </LoadingButton>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


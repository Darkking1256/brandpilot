"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingButton } from "@/components/loading-button"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

const keywordSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  keyword_type: z.enum(["hashtag", "keyword", "username", "url"]),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  is_active: z.boolean().default(true),
  alert_on_mention: z.boolean().default(true),
  min_engagement_threshold: z.number().default(0),
})

type KeywordFormData = z.infer<typeof keywordSchema>

interface TrackingKeywordFormProps {
  keyword?: any
  onSuccess: () => void
}

export function TrackingKeywordForm({ keyword, onSuccess }: TrackingKeywordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(keyword?.platforms || [])
  const { toast } = useToast()

  const form = useForm<KeywordFormData>({
    resolver: zodResolver(keywordSchema),
    defaultValues: keyword
      ? {
          keyword: keyword.keyword,
          keyword_type: keyword.keyword_type,
          platforms: keyword.platforms || [],
          is_active: keyword.is_active ?? true,
          alert_on_mention: keyword.alert_on_mention ?? true,
          min_engagement_threshold: keyword.min_engagement_threshold || 0,
        }
      : {
          keyword_type: "keyword",
          is_active: true,
          alert_on_mention: true,
          min_engagement_threshold: 0,
        },
  })

  const platforms = ["twitter", "linkedin", "facebook", "instagram", "tiktok", "youtube"]

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform))
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform])
    }
  }

  const onSubmit = async (data: KeywordFormData) => {
    setIsSubmitting(true)
    try {
      const url = keyword ? `/api/social-listening/keywords/${keyword.id}` : "/api/social-listening/keywords"
      const method = keyword ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          platforms: selectedPlatforms,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save keyword")
      }

      toast({
        title: keyword ? "Keyword updated" : "Keyword created",
        description: "Your tracking keyword has been saved successfully.",
      })

      onSuccess()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: "There was an error saving the keyword.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="keyword">Keyword *</Label>
        <Input
          id="keyword"
          {...form.register("keyword")}
          placeholder={form.watch("keyword_type") === "hashtag" ? "#hashtag" : "keyword"}
        />
        {form.formState.errors.keyword && (
          <p className="text-sm text-destructive">{form.formState.errors.keyword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="keyword_type">Type *</Label>
        <Select
          value={form.watch("keyword_type")}
          onValueChange={(value) => form.setValue("keyword_type", value as any)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hashtag">Hashtag</SelectItem>
            <SelectItem value="keyword">Keyword</SelectItem>
            <SelectItem value="username">Username</SelectItem>
            <SelectItem value="url">URL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Platforms *</Label>
        <div className="grid grid-cols-3 gap-2">
          {platforms.map((platform) => (
            <div key={platform} className="flex items-center space-x-2">
              <Checkbox
                id={`platform-${platform}`}
                checked={selectedPlatforms.includes(platform)}
                onCheckedChange={() => togglePlatform(platform)}
              />
              <Label
                htmlFor={`platform-${platform}`}
                className="text-sm font-normal cursor-pointer capitalize"
              >
                {platform}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="min_engagement_threshold">Min Engagement Threshold</Label>
        <Input
          id="min_engagement_threshold"
          type="number"
          {...form.register("min_engagement_threshold", { valueAsNumber: true })}
          placeholder="0"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="alert_on_mention"
          checked={form.watch("alert_on_mention")}
          onCheckedChange={(checked) => form.setValue("alert_on_mention", checked as boolean)}
        />
        <Label htmlFor="alert_on_mention" className="text-sm font-normal cursor-pointer">
          Alert on mention
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <LoadingButton type="submit" loading={isSubmitting} loadingText="Saving...">
          {keyword ? "Update" : "Create"} Keyword
        </LoadingButton>
      </div>
    </form>
  )
}


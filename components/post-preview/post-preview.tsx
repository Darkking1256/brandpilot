"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import type { Post } from "@/components/posts-table"

interface ValidationResult {
  type: string
  passed: boolean
  message: string
}

const platformLimits: Record<string, { maxLength: number; hashtags: boolean; mentions: boolean; imageMinWidth?: number; imageMinHeight?: number }> = {
  twitter: { maxLength: 280, hashtags: true, mentions: true, imageMinWidth: 1200, imageMinHeight: 675 },
  linkedin: { maxLength: 3000, hashtags: true, mentions: true, imageMinWidth: 1200, imageMinHeight: 627 },
  facebook: { maxLength: 63206, hashtags: true, mentions: true, imageMinWidth: 1200, imageMinHeight: 630 },
  instagram: { maxLength: 2200, hashtags: true, mentions: true, imageMinWidth: 1080, imageMinHeight: 1080 },
  tiktok: { maxLength: 2200, hashtags: true, mentions: true, imageMinWidth: 1080, imageMinHeight: 1920 },
  youtube: { maxLength: 5000, hashtags: true, mentions: true },
}

export function PostPreview({ post }: { post: Post }) {
  const [validations, setValidations] = useState<ValidationResult[]>([])
  const [linkPreview, setLinkPreview] = useState<any>(null)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    validatePost(post)
    if (post.linkUrl) {
      fetchLinkPreview(post.linkUrl)
    }
    if (post.imageUrl) {
      checkImageDimensions(post.imageUrl)
    }
  }, [post])

  const validatePost = (post: Post) => {
    const results: ValidationResult[] = []
    const limits = platformLimits[post.platform] || platformLimits.twitter

    // Character limit
    if (post.content.length > limits.maxLength) {
      results.push({
        type: "character_limit",
        passed: false,
        message: `Content exceeds ${limits.maxLength} characters (${post.content.length}/${limits.maxLength})`,
      })
    } else {
      const remaining = limits.maxLength - post.content.length
      results.push({
        type: "character_limit",
        passed: true,
        message: `Character count: ${post.content.length}/${limits.maxLength} (${remaining} remaining)`,
      })
    }

    // Hashtag validation
    const hashtags = post.content.match(/#\w+/g) || []
    if (hashtags.length > 30) {
      results.push({
        type: "hashtags",
        passed: false,
        message: `Too many hashtags (${hashtags.length}). Maximum recommended: 30`,
      })
    } else if (hashtags.length > 0) {
      results.push({
        type: "hashtags",
        passed: true,
        message: `${hashtags.length} hashtag(s) found: ${hashtags.slice(0, 5).join(", ")}${hashtags.length > 5 ? "..." : ""}`,
      })
    }

    // Mentions validation
    const mentions = post.content.match(/@\w+/g) || []
    if (mentions.length > 0) {
      results.push({
        type: "mentions",
        passed: true,
        message: `${mentions.length} mention(s) found`,
      })
    }

    // Link validation
    if (post.linkUrl) {
      try {
        new URL(post.linkUrl)
        results.push({
          type: "link",
          passed: true,
          message: "Valid URL",
        })
      } catch {
        results.push({
          type: "link",
          passed: false,
          message: "Invalid URL format",
        })
      }
    }

    setValidations(results)
  }

  const checkImageDimensions = (url: string) => {
    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height })
      const limits = platformLimits[post.platform] || platformLimits.twitter
      
      if (limits.imageMinWidth && limits.imageMinHeight) {
        const imageChecks = checkImageRequirements(post.platform, img.width, img.height, limits)
        setValidations((prev) => [...prev.filter((v) => v.type !== "image"), ...imageChecks])
      }
    }
    img.onerror = () => {
      setValidations((prev) => [
        ...prev.filter((v) => v.type !== "image"),
        {
          type: "image",
          passed: false,
          message: "Failed to load image",
        },
      ])
    }
    img.src = url
  }

  const checkImageRequirements = (
    platform: string,
    width: number,
    height: number,
    limits: { imageMinWidth?: number; imageMinHeight?: number }
  ): ValidationResult[] => {
    const results: ValidationResult[] = []
    
    if (limits.imageMinWidth && limits.imageMinHeight) {
      if (width < limits.imageMinWidth || height < limits.imageMinHeight) {
        results.push({
          type: "image",
          passed: false,
          message: `Image too small. Minimum: ${limits.imageMinWidth}x${limits.imageMinHeight}px (Current: ${width}x${height}px)`,
        })
      } else {
        results.push({
          type: "image",
          passed: true,
          message: `Image size: ${width}x${height}px (meets requirements)`,
        })
      }
    }

    return results
  }

  const fetchLinkPreview = async (url: string) => {
    try {
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      if (response.ok) {
        const data = await response.json()
        setLinkPreview(data)
      }
    } catch (e) {
      console.error("Failed to fetch link preview", e)
    }
  }

  const allPassed = validations.length > 0 && validations.every((v) => v.passed)
  const hasErrors = validations.some((v) => !v.passed)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Post Preview
            <Badge variant="outline">{post.platform}</Badge>
          </CardTitle>
          {allPassed && (
            <Badge className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Valid
            </Badge>
          )}
          {hasErrors && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Issues Found
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="border rounded-lg p-4 bg-muted/50">
          {post.imageUrl && (
            <div className="mb-3">
              <img
                src={post.imageUrl}
                alt="Post preview"
                className="w-full rounded-lg max-h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
          )}
          <p className="whitespace-pre-wrap break-words">{post.content}</p>
          {linkPreview && (
            <div className="mt-3 p-3 border rounded-lg bg-background">
              {linkPreview.image && (
                <img src={linkPreview.image} alt="" className="w-full h-32 object-cover rounded mb-2" />
              )}
              <h4 className="font-semibold">{linkPreview.title}</h4>
              <p className="text-sm text-muted-foreground">{linkPreview.description}</p>
            </div>
          )}
          {post.linkUrl && !linkPreview && (
            <div className="mt-2 text-sm text-muted-foreground">
              Link: {post.linkUrl}
            </div>
          )}
        </div>

        {/* Validations */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {allPassed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : hasErrors ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ) : null}
            <span className="font-semibold">Validation Results</span>
          </div>
          {validations.map((validation, idx) => (
            <Alert
              key={idx}
              variant={validation.passed ? "default" : "destructive"}
              className="py-2"
            >
              <div className="flex items-center gap-2">
                {validation.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                )}
                <AlertDescription className="text-sm">{validation.message}</AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


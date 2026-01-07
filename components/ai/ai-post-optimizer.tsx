"use client"

import { useState } from "react"
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
import { Wand2, Loader2, Copy, Check, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingButton } from "@/components/loading-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AIPostOptimizerProps {
  initialContent?: string
  platform?: string
  onOptimized: (content: string) => void
}

export function AIPostOptimizer({ initialContent = "", platform = "", onOptimized }: AIPostOptimizerProps) {
  const [content, setContent] = useState(initialContent)
  const [selectedPlatform, setSelectedPlatform] = useState(platform)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimized, setOptimized] = useState("")
  const [improvements, setImprovements] = useState<string[]>([])
  const [tips, setTips] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleOptimize = async () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Content required",
        description: "Please enter content to optimize.",
      })
      return
    }

    if (!selectedPlatform) {
      toast({
        variant: "destructive",
        title: "Platform required",
        description: "Please select a platform.",
      })
      return
    }

    setIsOptimizing(true)
    try {
      const response = await fetch("/api/ai/optimize-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          platform: selectedPlatform,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to optimize content")
      }

      const data = await response.json()
      setOptimized(data.optimized)
      setImprovements(data.improvements || [])
      setTips(data.tips || [])
    } catch (error: any) {
      console.error("Error optimizing content:", error)
      toast({
        variant: "destructive",
        title: "Optimization failed",
        description: error.message || "Failed to optimize content. Please check your API keys.",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleUseOptimized = () => {
    onOptimized(optimized)
    toast({
      variant: "success",
      title: "Content updated",
      description: "The optimized content has been applied.",
    })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(optimized)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      variant: "success",
      title: "Copied!",
      description: "Optimized content copied to clipboard.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Content to Optimize</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your post content..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Platform</Label>
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <LoadingButton
        onClick={handleOptimize}
        loading={isOptimizing}
        loadingText="Optimizing..."
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
      >
        <Wand2 className="h-4 w-4 mr-2" />
        Optimize Content
      </LoadingButton>

      {optimized && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Optimized Content</CardTitle>
                  <CardDescription>AI-enhanced version of your post</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUseOptimized}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    Use Optimized
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{optimized}</p>
            </CardContent>
          </Card>

          {improvements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Key Improvements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 mt-0.5 text-green-600" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {tips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Engagement Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}


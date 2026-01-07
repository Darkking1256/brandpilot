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
import { Sparkles, Loader2, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingButton } from "@/components/loading-button"

interface AIContentGeneratorProps {
  onContentGenerated: (content: string) => void
  platform?: string
}

export function AIContentGenerator({ onContentGenerated, platform }: AIContentGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState(platform || "")
  const [tone, setTone] = useState("friendly")
  const [length, setLength] = useState("medium")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt required",
        description: "Please enter a prompt to generate content.",
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

    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          platform: selectedPlatform,
          tone,
          length,
          type: "generate",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate content")
      }

      const data = await response.json()
      setGeneratedContent(data.content)
      if (data.suggestions) {
        setSuggestions(data.suggestions)
      }
    } catch (error: any) {
      console.error("Error generating content:", error)
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error.message || "Failed to generate content. Please check your API keys.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGetSuggestions = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt required",
        description: "Please enter a prompt to get suggestions.",
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

    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          platform: selectedPlatform,
          tone,
          length,
          type: "suggest",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to get suggestions")
      }

      const data = await response.json()
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions)
      } else {
        // Split content into suggestions if not already parsed
        const lines = data.content.split("\n").filter((l: string) => l.trim())
        setSuggestions(lines.slice(0, 3))
      }
    } catch (error: any) {
      console.error("Error getting suggestions:", error)
      toast({
        variant: "destructive",
        title: "Failed to get suggestions",
        description: error.message || "Failed to get suggestions. Please check your API keys.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUseContent = (content: string) => {
    onContentGenerated(content)
    toast({
      variant: "success",
      title: "Content added",
      description: "The generated content has been added to your post.",
    })
  }

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
    toast({
      variant: "success",
      title: "Copied!",
      description: "Content copied to clipboard.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>What would you like to post about?</Label>
        <Textarea
          placeholder="E.g., Announce our new product launch, share a tip about social media marketing..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
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
        </div>

        <div className="space-y-2">
          <Label>Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="humorous">Humorous</SelectItem>
              <SelectItem value="inspiring">Inspiring</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Length</Label>
          <Select value={length} onValueChange={setLength}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="long">Long</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <LoadingButton
          onClick={handleGenerate}
          loading={isGenerating}
          loadingText="Generating..."
          className="bg-gradient-to-r from-blue-600 to-cyan-600"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Content
        </LoadingButton>
        <Button
          type="button"
          variant="outline"
          onClick={handleGetSuggestions}
          disabled={isGenerating}
        >
          Get Suggestions
        </Button>
      </div>

      {generatedContent && (
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <Label>Generated Content</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(generatedContent, -1)}
              >
                {copiedIndex === -1 ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleUseContent(generatedContent)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                Use This
              </Button>
            </div>
          </div>
          <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <Label>Suggestions</Label>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 bg-muted rounded-lg flex items-start justify-between gap-2"
            >
              <p className="text-sm flex-1">{suggestion}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(suggestion, index)}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleUseContent(suggestion)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Use
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


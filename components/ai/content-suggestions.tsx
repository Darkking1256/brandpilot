"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Lightbulb, TrendingUp, Calendar, RefreshCw, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingButton } from "@/components/loading-button"
import { useRouter } from "next/navigation"

interface ContentSuggestion {
  id: string
  title: string
  content: string
  platform: string
  reason: string
  category: "trending" | "seasonal" | "evergreen" | "promotional"
}

const categoryIcons = {
  trending: TrendingUp,
  seasonal: Calendar,
  evergreen: Sparkles,
  promotional: Lightbulb,
}

const categoryColors = {
  trending: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  seasonal: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  evergreen: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  promotional: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
}

export function ContentSuggestions() {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/content-suggestions")
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } else {
        throw new Error("Failed to fetch suggestions")
      }
    } catch (error) {
      console.error("Failed to fetch suggestions", error)
      toast({
        variant: "destructive",
        title: "Failed to load suggestions",
        description: "Could not fetch content suggestions. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseSuggestion = (suggestion: ContentSuggestion) => {
    // Navigate to post creator with pre-filled content
    const params = new URLSearchParams({
      content: suggestion.content,
      platform: suggestion.platform,
    })
    router.push(`/dashboard/scheduler?${params.toString()}&create=true`)
  }

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    })
  }

  if (isLoading && suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Content Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading suggestions...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Content Suggestions
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSuggestions}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No suggestions available at the moment.</p>
            <Button onClick={fetchSuggestions} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => {
              const Icon = categoryIcons[suggestion.category]
              return (
                <div
                  key={suggestion.id}
                  className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                        <Badge
                          variant="outline"
                          className={categoryColors[suggestion.category]}
                        >
                          {suggestion.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{suggestion.reason}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2 capitalize">
                      {suggestion.platform}
                    </Badge>
                  </div>
                  <p className="text-sm mb-3 whitespace-pre-wrap">{suggestion.content}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(suggestion.content, suggestion.id)}
                    >
                      {copiedId === suggestion.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUseSuggestion(suggestion)}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600"
                    >
                      Use This Idea
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


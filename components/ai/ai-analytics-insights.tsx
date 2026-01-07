"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2, TrendingUp, Lightbulb } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingButton } from "@/components/loading-button"

interface AIAnalyticsInsightsProps {
  type: "posts" | "campaigns"
}

export function AIAnalyticsInsights({ type }: AIAnalyticsInsightsProps) {
  const [insights, setInsights] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerateInsights = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/analytics-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate insights")
      }

      const data = await response.json()
      setInsights(data.insights)
    } catch (error: any) {
      console.error("Error generating insights:", error)
      toast({
        variant: "destructive",
        title: "Failed to generate insights",
        description: error.message || "Failed to generate insights. Please check your API keys.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI Analytics Insights
            </CardTitle>
            <CardDescription>
              Get AI-powered insights and recommendations for your {type}
            </CardDescription>
          </div>
          <LoadingButton
            onClick={handleGenerateInsights}
            loading={isGenerating}
            loadingText="Analyzing..."
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Insights
          </LoadingButton>
        </div>
      </CardHeader>
      <CardContent>
        {insights ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold mb-2 text-sm">Key Insights</h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{insights}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              Click &quot;Generate Insights&quot; to get AI-powered analytics and recommendations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


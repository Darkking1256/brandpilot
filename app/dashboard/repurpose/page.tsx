"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Wand2, FileText, Share2 } from "lucide-react"
import { ContentRepurposer } from "@/components/repurpose/content-repurposer"

export default function RepurposePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">Content Repurposing</h1>
        <p className="text-muted-foreground text-lg">
          Use AI to repurpose your content for different platforms automatically
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg">AI-Powered</CardTitle>
            <CardDescription>
              Advanced AI transforms your content intelligently
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-2">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg">Multi-Format</CardTitle>
            <CardDescription>
              Adapt content for Twitter, LinkedIn, Instagram & more
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-2 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-2">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg">One-Click Share</CardTitle>
            <CardDescription>
              Repurpose and schedule in one seamless workflow
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Main Repurposing Tool */}
      <Card className="border-2 shadow-lg bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 dark:from-purple-950/10 dark:via-background dark:to-blue-950/10">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            AI-Powered Repurposing
          </CardTitle>
          <CardDescription className="text-base">
            Transform your content to fit different social media platforms with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContentRepurposer />
        </CardContent>
      </Card>
    </div>
  )
}


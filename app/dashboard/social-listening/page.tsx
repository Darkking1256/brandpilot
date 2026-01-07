"use client"

import { SocialListeningManager } from "@/components/social-listening/social-listening-manager"
import { Ear } from "lucide-react"

export default function SocialListeningPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <Ear className="h-6 w-6 text-white" />
            </div>
            Social Listening
          </h1>
          <p className="text-muted-foreground text-lg">
            Monitor brand mentions, track keywords, and analyze sentiment across social platforms
          </p>
        </div>
      </div>
      
      <SocialListeningManager />
    </div>
  )
}


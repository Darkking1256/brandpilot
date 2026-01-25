"use client"

import { SocialListeningManager } from "@/components/social-listening/social-listening-manager"
import { Ear } from "lucide-react"

export default function SocialListeningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
      {/* Animated background blobs */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-green-500/50 transition-all duration-500">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
              <Ear className="h-6 w-6 text-white" />
            </div>
            Social <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">Listening</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Monitor brand mentions, track keywords, and analyze sentiment across social platforms
          </p>
        </div>
        
        <SocialListeningManager />
      </div>
    </div>
  )
}


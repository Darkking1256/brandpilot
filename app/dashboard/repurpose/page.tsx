"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Wand2, FileText, Share2 } from "lucide-react"
import { ContentRepurposer } from "@/components/repurpose/content-repurposer"

export default function RepurposePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
      {/* Animated background blobs */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500">
          <h1 className="text-4xl font-bold text-white mb-2">
            Content <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Repurposing</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Use AI to repurpose your content for different platforms automatically
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
            <p className="text-slate-400 text-sm">
              Advanced AI transforms your content intelligently
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Format</h3>
            <p className="text-slate-400 text-sm">
              Adapt content for Twitter, LinkedIn, Instagram & more
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 shadow-lg">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">One-Click Share</h3>
            <p className="text-slate-400 text-sm">
              Repurpose and schedule in one seamless workflow
            </p>
          </div>
        </div>

        {/* Main Repurposing Tool */}
        <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 shadow-md">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              AI-Powered Repurposing
            </h3>
            <p className="text-slate-400">
              Transform your content to fit different social media platforms with AI assistance
            </p>
          </div>
          <ContentRepurposer />
        </div>
      </div>
    </div>
  )
}


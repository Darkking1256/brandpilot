"use client"

import { InboxManager } from "@/components/inbox/inbox-manager"
import { Inbox } from "lucide-react"

export default function InboxPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
      {/* Animated background blobs */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="p-8 rounded-3xl bg-slate-900/30 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
              <Inbox className="h-6 w-6 text-white" />
            </div>
            Unified <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Inbox</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Manage all your messages, comments, and mentions from one place
          </p>
        </div>
        
        <InboxManager />
      </div>
    </div>
  )
}


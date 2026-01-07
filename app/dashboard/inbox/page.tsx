"use client"

import { InboxManager } from "@/components/inbox/inbox-manager"
import { Inbox } from "lucide-react"

export default function InboxPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
              <Inbox className="h-6 w-6 text-white" />
            </div>
            Unified Inbox
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage all your messages, comments, and mentions from one place
          </p>
        </div>
      </div>
      
      <InboxManager />
    </div>
  )
}


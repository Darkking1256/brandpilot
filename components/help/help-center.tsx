"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HelpCircle, Search, BookOpen, Keyboard, Lightbulb, ExternalLink, X } from "lucide-react"
import { cn } from "@/utils/cn"

interface HelpArticle {
  id: string
  title: string
  category: "getting-started" | "features" | "troubleshooting" | "tips"
  content: string
  keywords: string[]
}

const helpArticles: HelpArticle[] = [
  {
    id: "create-post",
    title: "How to Create a Post",
    category: "getting-started",
    content: "Click 'Create New Post' from the dashboard or scheduler page. Fill in your content, select platforms, set schedule date/time, and optionally add images or links. Use AI to generate or optimize your content!",
    keywords: ["post", "create", "schedule", "content"],
  },
  {
    id: "ai-generation",
    title: "Using AI Content Generation",
    category: "features",
    content: "Click 'Generate with AI' when creating a post. Enter your topic or idea, and AI will create engaging content optimized for your selected platform. You can regenerate or edit the content as needed.",
    keywords: ["ai", "generate", "content", "automation"],
  },
  {
    id: "bulk-operations",
    title: "Bulk Operations",
    category: "features",
    content: "Select multiple posts or campaigns using checkboxes, then use bulk actions to delete, update status, or export them. This saves time when managing large numbers of items.",
    keywords: ["bulk", "delete", "export", "multiple"],
  },
  {
    id: "platform-connections",
    title: "Connecting Social Media Platforms",
    category: "getting-started",
    content: "Go to Settings → Platforms. Click 'Connect' for each platform you want to use. You'll be redirected to authorize the app, then redirected back automatically. Your access token is stored securely.",
    keywords: ["platform", "connect", "oauth", "social media"],
  },
  {
    id: "templates",
    title: "Using Templates",
    category: "features",
    content: "Save frequently used posts as templates. When creating a new post, click 'Use Template' to quickly insert saved content. Edit templates anytime from the template library.",
    keywords: ["template", "save", "reuse", "library"],
  },
  {
    id: "analytics",
    title: "Understanding Analytics",
    category: "features",
    content: "View detailed analytics on the Analytics page. Filter by date range, compare periods, and export reports as PDF. Track engagement, reach, and performance across platforms.",
    keywords: ["analytics", "metrics", "performance", "reports"],
  },
  {
    id: "failed-posts",
    title: "Posts Failed to Publish",
    category: "troubleshooting",
    content: "If a post fails to publish, check: 1) Platform connection is active, 2) Access token hasn't expired, 3) Content meets platform requirements. Use 'Retry Failed Posts' to attempt publishing again.",
    keywords: ["failed", "error", "publish", "retry"],
  },
  {
    id: "keyboard-shortcuts",
    title: "Keyboard Shortcuts",
    category: "tips",
    content: "Use keyboard shortcuts for faster navigation: Ctrl/Cmd+K for search, Ctrl/Cmd+N for new post, Esc to close dialogs, / to focus search.",
    keywords: ["shortcuts", "keyboard", "hotkeys", "navigation"],
  },
]

const keyboardShortcuts = [
  { key: "Ctrl/Cmd + K", description: "Open search" },
  { key: "Ctrl/Cmd + N", description: "Create new post" },
  { key: "Esc", description: "Close dialog/modal" },
  { key: "/", description: "Focus search bar" },
  { key: "Ctrl/Cmd + /", description: "Open help center" },
]

export function HelpCenter() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredArticles = helpArticles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.keywords.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Help Center">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help Center
          </DialogTitle>
          <DialogDescription>
            Find answers to common questions and learn how to use MarketPilot AI
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="articles" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="articles">
              <BookOpen className="h-4 w-4 mr-2" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="shortcuts">
              <Keyboard className="h-4 w-4 mr-2" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="tips">
              <Lightbulb className="h-4 w-4 mr-2" />
              Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="flex-1 flex flex-col overflow-hidden m-0 px-6 pb-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              <Button
                variant={selectedCategory === "getting-started" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("getting-started")}
              >
                Getting Started
              </Button>
              <Button
                variant={selectedCategory === "features" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("features")}
              >
                Features
              </Button>
              <Button
                variant={selectedCategory === "troubleshooting" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("troubleshooting")}
              >
                Troubleshooting
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-4">
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No articles found matching your search.</p>
                  </div>
                ) : (
                  filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className="p-4 rounded-lg border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <h3 className="font-semibold mb-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">{article.content}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="shortcuts" className="flex-1 overflow-auto m-0 px-6 pb-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Keyboard Shortcuts</h3>
              {keyboardShortcuts.map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                  <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="flex-1 overflow-auto m-0 px-6 pb-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Pro Tips</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                  <h4 className="font-semibold mb-1">Use Templates</h4>
                  <p className="text-sm text-muted-foreground">
                    Save time by creating templates for recurring content like weekly updates or product announcements.
                  </p>
                </div>
                <div className="p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
                  <h4 className="font-semibold mb-1">Bulk Operations</h4>
                  <p className="text-sm text-muted-foreground">
                    Select multiple items and use bulk actions to update status, export, or delete efficiently.
                  </p>
                </div>
                <div className="p-4 rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                  <h4 className="font-semibold mb-1">AI Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Always use AI to optimize your content for each platform - it adapts tone, length, and hashtags automatically.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}



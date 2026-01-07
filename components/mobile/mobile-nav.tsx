"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, X, Search } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/utils/cn"
import {
  Calendar,
  FileText,
  Settings,
  Sparkles,
  Megaphone,
  Home,
  TrendingUp,
  Bell,
  CreditCard,
  Headphones,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const navSections = [
  {
    title: "Main",
    items: [
      { href: "/dashboard", label: "Overview", icon: Home },
      { href: "/dashboard/scheduler", label: "Scheduler", icon: Calendar },
      { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    ]
  },
  {
    title: "Marketing",
    items: [
      { href: "/dashboard/campaign", label: "Campaigns", icon: Megaphone },
      { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp },
    ]
  },
  {
    title: "Content",
    items: [
      { href: "/dashboard/repurpose", label: "Repurpose", icon: FileText },
    ]
  },
  {
    title: "Engagement",
    items: [
      { href: "/dashboard/inbox", label: "Inbox", icon: Bell },
      { href: "/dashboard/social-listening", label: "Listening", icon: Headphones },
    ]
  },
  {
    title: "Account",
    items: [
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ]
  },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const router = useRouter()

  // Filter nav items based on search
  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setOpen(false)
      router.push(`/dashboard?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <Link 
                href="/dashboard" 
                onClick={() => setOpen(false)}
                className="flex items-center space-x-3"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  MarketPilot AI
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </form>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1">
            <nav className="p-4 space-y-6">
              {filteredSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href || 
                        (item.href !== "/dashboard" && pathname?.startsWith(item.href))
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                            isActive
                              ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold"
                              : "hover:bg-muted active:scale-[0.98]"
                          )}
                        >
                          <Icon className={cn(
                            "h-5 w-5 flex-shrink-0",
                            isActive && "text-blue-600 dark:text-blue-400"
                          )} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Upgrade CTA */}
          <div className="p-4 border-t">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold mb-1">Upgrade to Pro</p>
              <p className="text-xs text-muted-foreground mb-3">Unlock AI, analytics & more</p>
              <Link href="/dashboard/billing" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}


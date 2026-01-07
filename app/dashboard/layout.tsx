"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoutButton } from "@/components/logout-button"
import { 
  Calendar,
  BarChart3,
  FileText,
  Settings,
  Sparkles,
  Megaphone,
  Home,
  Bell,
  Search,
  TrendingUp,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/utils/cn"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { OnboardingProvider, useOnboarding } from "@/components/onboarding/onboarding-provider"
import { HelpCenter } from "@/components/help/help-center"
import { MobileNav } from "@/components/mobile/mobile-nav"
import { BottomNav } from "@/components/mobile/bottom-nav"
import { useGlobalKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { GlobalSearch } from "@/components/search/global-search"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/scheduler", label: "Scheduler", icon: Calendar },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/campaign", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/dashboard/repurpose", label: "Repurpose", icon: FileText },
  { href: "/dashboard/inbox", label: "Inbox", icon: Bell },
  { href: "/dashboard/social-listening", label: "Listening", icon: TrendingUp },
  { href: "/dashboard/billing", label: "Billing", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { startTour, hasCompletedOnboarding } = useOnboarding()
  const [searchOpen, setSearchOpen] = useState(false)
  
  // Enable global keyboard shortcuts
  useGlobalKeyboardShortcuts([
    {
      key: "k",
      ctrl: true,
      meta: true,
      action: () => setSearchOpen(true),
      description: "Open search",
    },
    {
      key: "n",
      ctrl: true,
      meta: true,
      action: () => {
        // Trigger new post - this would need to be implemented per page
        const newPostBtn = document.querySelector('[data-action="new-post"]') as HTMLButtonElement
        newPostBtn?.click()
      },
      description: "Create new post",
    },
    {
      key: "/",
      action: () => {
        if (document.activeElement?.tagName !== "INPUT") {
          setSearchOpen(true)
        }
      },
      description: "Focus search",
    },
    {
      key: "Escape",
      action: () => setSearchOpen(false),
      description: "Close dialog",
    },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center px-6 gap-4">
          <MobileNav />
          <Link href="/dashboard" className="flex items-center space-x-3 group flex-shrink-0" data-tour="dashboard">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 group-hover:scale-105 transition-transform shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hidden sm:inline">
              MarketPilot AI
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search campaigns, posts, analytics... (Cmd+K)" 
                className="pl-9 bg-background/50 border-muted cursor-pointer"
                onClick={() => setSearchOpen(true)}
                readOnly
              />
            </div>
          </div>

          <div className="ml-auto flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={startTour}
              title="Start Tour"
              className="hidden sm:flex"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
            <HelpCenter />
            <NotificationCenter />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-background/50 backdrop-blur sticky top-16 h-[calc(100vh-4rem)]">
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
              const tourId = item.href === "/dashboard/scheduler" ? "scheduler-link" : 
                            item.href === "/dashboard/analytics" ? "analytics-link" : undefined
              
              return (
                <Link key={item.href} href={item.href} data-tour={tourId}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-11 text-base",
                      isActive && "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800 shadow-sm"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive && "text-blue-600 dark:text-blue-400"
                    )} />
                    <span className={cn(
                      isActive && "font-semibold text-blue-700 dark:text-blue-300"
                    )}>
                      {item.label}
                    </span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold mb-1">Upgrade to Pro</p>
              <p className="text-xs text-muted-foreground mb-3">Unlock advanced features</p>
              <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600">
                Upgrade Now
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 min-h-[calc(100vh-4rem)] pb-20 md:pb-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
      
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OnboardingProvider>
      <DashboardContent>{children}</DashboardContent>
    </OnboardingProvider>
  )
}

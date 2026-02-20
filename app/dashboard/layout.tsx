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
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
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
  useKeyboardShortcuts([
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
  ]);

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 relative">
      {/* Animated background blobs */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/80">
        <div className="container flex h-14 md:h-20 items-center justify-between px-3 md:px-6 mx-auto">
          <div className="flex items-center gap-2">
            {/* Mobile Nav Trigger */}
            <div className="md:hidden">
              <MobileNav />
            </div>
            <Link href="/dashboard" className="flex items-center space-x-2 md:space-x-3 group">
              <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <span className="text-base md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent hidden sm:inline">
                MarketPilot AI
              </span>
            </Link>
          </div>

          <nav className="flex items-center space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={startTour}
              title="Start Tour"
              className="hover:bg-slate-800/50 backdrop-blur-xl text-slate-300 hover:text-white h-8 w-8 md:h-10 md:w-10"
            >
              <HelpCircle className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <div className="hidden sm:block">
              <HelpCenter />
            </div>
            <NotificationCenter />
            <LogoutButton />
          </nav>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className="hidden md:flex w-72 flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-20 h-[calc(100vh-5rem)]">
          <nav className="flex-1 p-6">
            {/* Navigation Section */}
            <div className="space-y-2 mb-8">
              <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">Navigation</h3>
              {navItems.slice(0, 5).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
                const tourId = item.href === "/dashboard/scheduler" ? "scheduler-link" :
                              item.href === "/dashboard/analytics" ? "analytics-link" : undefined

                return (
                  <Link key={item.href} href={item.href} data-tour={tourId}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 group",
                      isActive
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white shadow-lg"
                        : "text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 hover:border-blue-500/30"
                    )}>
                      <div className={cn(
                        "p-1.5 rounded-lg transition-all duration-300 group-hover:scale-110",
                        isActive ? "bg-gradient-to-br from-blue-500 to-purple-500" : "bg-gradient-to-br from-slate-700 to-slate-600 group-hover:from-blue-500 group-hover:to-purple-500"
                      )}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className={cn(
                        "font-medium transition-all group-hover:text-blue-400",
                        isActive && "font-semibold text-white"
                      )}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Tools Section */}
            <div className="space-y-2 mb-8">
              <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Tools</h3>
              {navItems.slice(5).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))

                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 group",
                      isActive
                        ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white shadow-lg"
                        : "text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20 hover:border-purple-500/30"
                    )}>
                      <div className={cn(
                        "p-1.5 rounded-lg transition-all duration-300 group-hover:scale-110",
                        isActive ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-gradient-to-br from-slate-700 to-slate-600 group-hover:from-purple-500 group-hover:to-pink-500"
                      )}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className={cn(
                        "font-medium transition-all group-hover:text-purple-400",
                        isActive && "font-semibold text-white"
                      )}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-slate-800">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Pro Features</p>
                  <p className="text-xs text-slate-400">Advanced analytics & more</p>
                </div>
              </div>
              <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 shadow-lg transition-all duration-300">
                Upgrade Now
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-4 md:p-8 lg:p-10 min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-5rem)] pb-20 md:pb-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
      
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
    </>
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

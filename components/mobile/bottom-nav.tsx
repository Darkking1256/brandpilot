"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/utils/cn"
import {
  Home,
  Calendar,
  PlusCircle,
  BarChart3,
  User,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/scheduler", label: "Schedule", icon: Calendar },
  { href: "/dashboard/new-post", label: "Create", icon: PlusCircle, highlight: true },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Account", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800">
      <div className="flex items-center justify-around h-14 px-1 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname?.startsWith(item.href))
          
          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/30 border-4 border-slate-950">
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[52px]",
                isActive 
                  ? "text-blue-400 bg-blue-500/10" 
                  : "text-slate-500 active:bg-slate-800"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-blue-400")} />
              <span className={cn("text-[9px] font-medium", isActive ? "text-blue-400" : "text-slate-500")}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}


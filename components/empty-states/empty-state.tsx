"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { cn } from "@/utils/cn"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  children?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/30 backdrop-blur-xl", className)}>
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-slate-700/50 flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-slate-400 mb-6 max-w-md">{description}</p>
        {children}
        {(action || secondaryAction) && (
          <div className="flex gap-3 flex-wrap justify-center">
            {action && (
              <Button onClick={action.onClick} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction.onClick} className="border-slate-700/50 bg-slate-800/50 text-slate-300 hover:text-white hover:border-blue-500/50">
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}



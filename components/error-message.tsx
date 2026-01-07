"use client"

import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils/cn"

interface ErrorMessageProps {
  title?: string
  message: string
  onDismiss?: () => void
  className?: string
  variant?: "default" | "destructive" | "warning"
}

export function ErrorMessage({
  title = "Error",
  message,
  onDismiss,
  className,
  variant = "destructive",
}: ErrorMessageProps) {
  return (
    <Alert
      variant={variant}
      className={cn(
        "border-2",
        variant === "destructive" && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
        variant === "warning" && "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20",
        className
      )}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>{title}</span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">{message}</AlertDescription>
    </Alert>
  )
}



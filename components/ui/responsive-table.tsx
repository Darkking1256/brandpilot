"use client"

import * as React from "react"
import { cn } from "@/utils/cn"

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  hideOnMobile?: boolean
  mobileLabel?: string
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  emptyMessage?: string
  className?: string
  mobileCardRender?: (item: T) => React.ReactNode
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = "No data available",
  className,
  mobileCardRender,
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  // Get value from nested path like "user.name"
  const getValue = (item: T, key: string): any => {
    return key.split('.').reduce((obj, k) => obj?.[k], item as any)
  }

  return (
    <>
      {/* Desktop Table */}
      <div className={cn("hidden md:block overflow-x-auto", className)}>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "border-b transition-colors hover:bg-muted/50",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key as string} className="p-4 align-middle">
                    {col.render 
                      ? col.render(item) 
                      : getValue(item, col.key as string)
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className={cn("md:hidden space-y-3", className)}>
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            className={cn(
              "p-4 rounded-lg border bg-card transition-colors",
              onRowClick && "cursor-pointer active:bg-muted"
            )}
          >
            {mobileCardRender ? (
              mobileCardRender(item)
            ) : (
              <div className="space-y-2">
                {columns
                  .filter((col) => !col.hideOnMobile)
                  .map((col) => (
                    <div key={col.key as string} className="flex justify-between items-start gap-2">
                      <span className="text-sm text-muted-foreground">
                        {col.mobileLabel || col.header}
                      </span>
                      <span className="text-sm text-right">
                        {col.render 
                          ? col.render(item) 
                          : getValue(item, col.key as string)
                        }
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

// Mobile-only card wrapper component
export function MobileCard({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "md:hidden p-4 rounded-lg border bg-card transition-colors",
        onClick && "cursor-pointer active:bg-muted",
        className
      )}
    >
      {children}
    </div>
  )
}

// Responsive grid that adjusts columns
export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
}: {
  children: React.ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}) {
  const gridCols = cn(
    "grid gap-4",
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  )

  return <div className={gridCols}>{children}</div>
}


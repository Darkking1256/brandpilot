"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid, List } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, startOfDay, addDays, isToday } from "date-fns"
import type { Post } from "@/components/posts-table"
import { cn } from "@/utils/cn"

interface ContentCalendarProps {
  posts: Post[]
  onPostClick?: (post: Post) => void
  onDateChange?: (date: Date) => void
  onDragDrop?: (postId: string, newDate: Date, newTime: string) => void
  viewMode?: "month" | "week" | "day"
  colorBy?: "platform" | "status"
}

const platformColors: Record<string, string> = {
  twitter: "bg-blue-500",
  linkedin: "bg-blue-600",
  facebook: "bg-blue-700",
  instagram: "bg-pink-500",
  tiktok: "bg-black",
  youtube: "bg-red-600",
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-400",
  scheduled: "bg-blue-400",
  published: "bg-green-400",
  failed: "bg-red-400",
}

export function ContentCalendar({
  posts,
  onPostClick,
  onDateChange,
  onDragDrop,
  viewMode = "month",
  colorBy = "platform",
}: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedView, setSelectedView] = useState<"month" | "week" | "day">(viewMode)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const postsByDate = useMemo(() => {
    const map = new Map<string, Post[]>()
    posts.forEach((post) => {
      const dateKey = post.scheduledDate
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(post)
    })
    return map
  }, [posts])

  const handlePrevious = () => {
    if (selectedView === "month") {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (selectedView === "week") {
      setCurrentDate(addDays(currentDate, -7))
    } else {
      setCurrentDate(addDays(currentDate, -1))
    }
  }

  const handleNext = () => {
    if (selectedView === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (selectedView === "week") {
      setCurrentDate(addDays(currentDate, 7))
    } else {
      setCurrentDate(addDays(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const getPostColor = (post: Post) => {
    if (colorBy === "platform") {
      return platformColors[post.platform] || "bg-gray-500"
    }
    return statusColors[post.status] || "bg-gray-500"
  }

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    e.currentTarget.classList.add("ring-2", "ring-blue-500")
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("ring-2", "ring-blue-500")
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    e.currentTarget.classList.remove("ring-2", "ring-blue-500")
    const postId = e.dataTransfer.getData("postId")
    if (postId && onDragDrop) {
      onDragDrop(postId, date, "09:00")
    }
  }

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground">
          {day}
        </div>
      ))}
      {calendarDays.map((day, idx) => {
        const dayPosts = postsByDate.get(format(day, "yyyy-MM-dd")) || []
        const isCurrentMonth = isSameMonth(day, currentDate)
        const isTodayDate = isToday(day)

        return (
          <div
            key={idx}
            className={cn(
              "min-h-[100px] p-2 border rounded-lg transition-colors",
              !isCurrentMonth && "opacity-30 bg-muted/30",
              isTodayDate && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20"
            )}
            onClick={() => onDateChange?.(day)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, day)}
          >
            <div className={cn("text-sm font-semibold mb-1", isTodayDate && "text-blue-600")}>
              {format(day, "d")}
            </div>
            <div className="space-y-1">
              {dayPosts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className={cn(
                    "text-xs p-1 rounded cursor-pointer hover:opacity-80 truncate text-white",
                    getPostColor(post)
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onPostClick?.(post)
                  }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("postId", post.id)
                    e.dataTransfer.effectAllowed = "move"
                  }}
                >
                  {post.content.substring(0, 30)}...
                </div>
              ))}
              {dayPosts.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{dayPosts.length - 3} more
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate)
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: addDays(weekStart, 6),
    })

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, idx) => {
          const dayPosts = postsByDate.get(format(day, "yyyy-MM-dd")) || []
          const isTodayDate = isToday(day)

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[400px] p-3 border rounded-lg",
                isTodayDate && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20"
              )}
            >
              <div className={cn("text-sm font-semibold mb-2", isTodayDate && "text-blue-600")}>
                {format(day, "EEE, MMM d")}
              </div>
              <div className="space-y-2">
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    className={cn(
                      "text-xs p-2 rounded cursor-pointer hover:opacity-80 text-white",
                      getPostColor(post)
                    )}
                    onClick={() => onPostClick?.(post)}
                  >
                    <div className="font-semibold">{format(new Date(`${post.scheduledDate}T${post.scheduledTime}`), "h:mm a")}</div>
                    <div className="mt-1">{post.content.substring(0, 50)}...</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderDayView = () => {
    const dayPosts = postsByDate.get(format(currentDate, "yyyy-MM-dd")) || []
    const isTodayDate = isToday(currentDate)

    return (
      <div className={cn("p-4", isTodayDate && "ring-2 ring-blue-500 rounded-lg bg-blue-50 dark:bg-blue-950/20")}>
        <div className={cn("text-lg font-semibold mb-4", isTodayDate && "text-blue-600")}>
          {format(currentDate, "EEEE, MMMM d, yyyy")}
        </div>
        <div className="space-y-3">
          {dayPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No posts scheduled for this day
            </div>
          ) : (
            dayPosts.map((post) => (
              <div
                key={post.id}
                className={cn(
                  "p-4 rounded-lg cursor-pointer hover:opacity-80 text-white",
                  getPostColor(post)
                )}
                onClick={() => onPostClick?.(post)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{format(new Date(`${post.scheduledDate}T${post.scheduledTime}`), "h:mm a")}</span>
                  <span className="text-xs opacity-80">{post.platform}</span>
                </div>
                <p>{post.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Content Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as typeof selectedView)}>
              <TabsList>
                <TabsTrigger value="month">
                  <Grid className="h-4 w-4 mr-2" />
                  Month
                </TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedView === "month" && renderMonthView()}
        {selectedView === "week" && renderWeekView()}
        {selectedView === "day" && renderDayView()}
      </CardContent>
    </Card>
  )
}


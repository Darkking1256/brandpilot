"use client"

import { useState, useMemo } from "react"
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
    <div className="grid grid-cols-7 gap-0.5 md:gap-1">
      {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
        <div key={idx} className="p-1 md:p-2 text-center text-[10px] md:text-sm font-semibold text-slate-400">
          <span className="md:hidden">{day}</span>
          <span className="hidden md:inline">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][idx]}</span>
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
              "min-h-[60px] md:min-h-[100px] p-1 md:p-2 border border-slate-700/50 rounded md:rounded-lg transition-colors bg-slate-900/30 hover:bg-slate-800/50",
              !isCurrentMonth && "opacity-30",
              isTodayDate && "ring-1 md:ring-2 ring-blue-500 bg-blue-950/30"
            )}
            onClick={() => onDateChange?.(day)}
            onDragOver={(e) => handleDragOver(e, day)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, day)}
          >
            <div className={cn("text-[10px] md:text-sm font-semibold mb-0.5 md:mb-1 text-slate-300", isTodayDate && "text-blue-400")}>
              {format(day, "d")}
            </div>
            <div className="space-y-0.5 md:space-y-1">
              {dayPosts.slice(0, window?.innerWidth < 768 ? 1 : 3).map((post) => (
                <div
                  key={post.id}
                  className={cn(
                    "text-[8px] md:text-xs p-0.5 md:p-1 rounded cursor-pointer hover:opacity-80 truncate text-white",
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
                  <span className="hidden md:inline">{post.content.substring(0, 30)}...</span>
                  <span className="md:hidden">{post.platform.charAt(0).toUpperCase()}</span>
                </div>
              ))}
              {dayPosts.length > (typeof window !== 'undefined' && window?.innerWidth < 768 ? 1 : 3) && (
                <div className="text-[8px] md:text-xs text-slate-500">
                  +{dayPosts.length - (typeof window !== 'undefined' && window?.innerWidth < 768 ? 1 : 3)}
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
      <>
        {/* Desktop Week View - 7 columns */}
        <div className="hidden md:grid grid-cols-7 gap-2">
          {weekDays.map((day, idx) => {
            const dayPosts = postsByDate.get(format(day, "yyyy-MM-dd")) || []
            const isTodayDate = isToday(day)

            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[400px] p-3 border border-slate-700/50 rounded-lg bg-slate-900/30",
                  isTodayDate && "ring-2 ring-blue-500 bg-blue-950/30"
                )}
              >
                <div className={cn("text-sm font-semibold mb-2 text-slate-300", isTodayDate && "text-blue-400")}>
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

        {/* Mobile Week View - Vertical stack */}
        <div className="md:hidden space-y-3">
          {weekDays.map((day, idx) => {
            const dayPosts = postsByDate.get(format(day, "yyyy-MM-dd")) || []
            const isTodayDate = isToday(day)

            return (
              <div
                key={idx}
                className={cn(
                  "p-3 border border-slate-700/50 rounded-lg bg-slate-900/30",
                  isTodayDate && "ring-2 ring-blue-500 bg-blue-950/30"
                )}
              >
                <div className={cn("text-sm font-semibold mb-2 text-slate-300 flex items-center justify-between", isTodayDate && "text-blue-400")}>
                  <span>{format(day, "EEE, MMM d")}</span>
                  {dayPosts.length > 0 && (
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
                      {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {dayPosts.length === 0 ? (
                    <div className="text-xs text-slate-500 py-2">No posts scheduled</div>
                  ) : (
                    dayPosts.map((post) => (
                      <div
                        key={post.id}
                        className={cn(
                          "text-xs p-2 rounded cursor-pointer hover:opacity-80 text-white",
                          getPostColor(post)
                        )}
                        onClick={() => onPostClick?.(post)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{format(new Date(`${post.scheduledDate}T${post.scheduledTime}`), "h:mm a")}</span>
                          <span className="text-[10px] opacity-80 capitalize">{post.platform}</span>
                        </div>
                        <div className="mt-1 truncate">{post.content.substring(0, 60)}...</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  const renderDayView = () => {
    const dayPosts = postsByDate.get(format(currentDate, "yyyy-MM-dd")) || []
    const isTodayDate = isToday(currentDate)

    return (
      <div className={cn("p-4 rounded-lg bg-slate-900/30 border border-slate-700/50", isTodayDate && "ring-2 ring-blue-500 bg-blue-950/30")}>
        <div className={cn("text-lg font-semibold mb-4 text-white", isTodayDate && "text-blue-400")}>
          {format(currentDate, "EEEE, MMMM d, yyyy")}
        </div>
        <div className="space-y-3">
          {dayPosts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
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
    <div className="rounded-2xl md:rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50">
      <div className="p-3 md:p-6 border-b border-slate-700/50">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-xl font-bold text-white flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
              <span className="hidden sm:inline">Content Calendar</span>
              <span className="sm:hidden">Calendar</span>
            </h3>
            {/* Navigation controls */}
            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevious} className="border-slate-700/50 bg-slate-800/50 text-slate-300 hover:text-white hover:border-blue-500/50 h-8 w-8 md:h-9 md:w-9 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday} className="border-slate-700/50 bg-slate-800/50 text-slate-300 hover:text-white hover:border-blue-500/50 h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm">
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext} className="border-slate-700/50 bg-slate-800/50 text-slate-300 hover:text-white hover:border-blue-500/50 h-8 w-8 md:h-9 md:w-9 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* View Tabs */}
          <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as typeof selectedView)} className="w-full">
            <TabsList className="bg-slate-800/50 border border-slate-700/50 w-full grid grid-cols-3">
              <TabsTrigger value="month" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-xs md:text-sm">
                <Grid className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Month
              </TabsTrigger>
              <TabsTrigger value="week" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-xs md:text-sm">Week</TabsTrigger>
              <TabsTrigger value="day" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-xs md:text-sm">Day</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="p-2 md:p-6">
        {selectedView === "month" && renderMonthView()}
        {selectedView === "week" && renderWeekView()}
        {selectedView === "day" && renderDayView()}
      </div>
    </div>
  )
}


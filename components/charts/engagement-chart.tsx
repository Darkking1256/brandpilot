"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format, startOfWeek, eachDayOfInterval, isWithinInterval } from "date-fns"

interface EngagementChartProps {
  posts?: Array<{
    createdAt?: string
    scheduledDate?: string
    status?: string
  }>
}

export function EngagementChart({ posts = [] }: EngagementChartProps) {
  // Group posts by day of week for the last 7 days
  const getWeeklyData = () => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
    const days = eachDayOfInterval({ start: weekStart, end: now })
    
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    
    return days.map((day, index) => {
      const dayPosts = posts.filter((post) => {
        const postDate = new Date(post.createdAt || post.scheduledDate || new Date())
        return isWithinInterval(postDate, { start: day, end: new Date(day.getTime() + 24 * 60 * 60 * 1000) })
      })
      
      // Calculate engagement (simplified - in real app, get from analytics)
      const publishedPosts = dayPosts.filter(p => p.status === "published").length
      const engagement = publishedPosts > 0 ? (publishedPosts / dayPosts.length) * 100 : 0
      const reach = publishedPosts * 150 // Simulated reach
      
      return {
        name: dayNames[index % 7],
        engagement: Math.round(engagement * 10) / 10,
        reach: Math.round(reach),
      }
    })
  }
  
  const data = posts.length > 0 ? getWeeklyData() : [
    { name: "Mon", engagement: 0, reach: 0 },
    { name: "Tue", engagement: 0, reach: 0 },
    { name: "Wed", engagement: 0, reach: 0 },
    { name: "Thu", engagement: 0, reach: 0 },
    { name: "Fri", engagement: 0, reach: 0 },
    { name: "Sat", engagement: 0, reach: 0 },
    { name: "Sun", engagement: 0, reach: 0 },
  ]
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="name" 
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="engagement" 
          stroke="hsl(199, 89%, 48%)" 
          strokeWidth={2}
          name="Engagement %"
          dot={{ fill: "hsl(199, 89%, 48%)", r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="reach" 
          stroke="hsl(188, 94%, 43%)" 
          strokeWidth={2}
          name="Reach"
          dot={{ fill: "hsl(188, 94%, 43%)", r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}


"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, subMonths, startOfMonth, eachMonthOfInterval, isWithinInterval } from "date-fns"

interface TrendChartProps {
  posts?: Array<{
    createdAt?: string
    scheduledDate?: string
  }>
}

export function TrendChart({ posts = [] }: TrendChartProps) {
  // Get last 6 months of data
  const getMonthlyData = () => {
    const now = new Date()
    const sixMonthsAgo = subMonths(now, 6)
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now })
    
    return months.map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
      
      const monthPosts = posts.filter((post) => {
        const postDate = new Date(post.createdAt || post.scheduledDate || new Date())
        return isWithinInterval(postDate, { start: monthStart, end: monthEnd })
      })
      
      return {
        month: format(month, "MMM"),
        value: monthPosts.length,
      }
    })
  }
  
  const data = posts.length > 0 ? getMonthlyData() : [
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "May", value: 0 },
    { month: "Jun", value: 0 },
  ]
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="month" 
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
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="hsl(199, 89%, 48%)" 
          strokeWidth={2}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}


"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface PerformanceChartProps {
  posts?: Array<{
    platform?: string
    status?: string
  }>
}

export function PerformanceChart({ posts = [] }: PerformanceChartProps) {
  // Group posts by platform
  const platformData: Record<string, { posts: number; published: number }> = {}
  
  posts.forEach((post) => {
    const platform = post.platform || "unknown"
    if (!platformData[platform]) {
      platformData[platform] = { posts: 0, published: 0 }
    }
    platformData[platform].posts++
    if (post.status === "published") {
      platformData[platform].published++
    }
  })
  
  const data = Object.entries(platformData).map(([name, stats]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    posts: stats.posts,
    engagement: stats.posts > 0 ? Math.round((stats.published / stats.posts) * 100 * 10) / 10 : 0,
    clicks: stats.published * 20, // Simulated clicks
  }))
  
  // If no data, show empty state
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <p>No data available</p>
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
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
        <Bar 
          dataKey="posts" 
          fill="hsl(199, 89%, 48%)" 
          name="Posts"
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="engagement" 
          fill="hsl(188, 94%, 43%)" 
          name="Engagement %"
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="clicks" 
          fill="hsl(142, 76%, 36%)" 
          name="Clicks"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}


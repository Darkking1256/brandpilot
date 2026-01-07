"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface PlatformDistributionChartProps {
  posts?: Array<{
    platform?: string
  }>
}

const platformColors: Record<string, string> = {
  twitter: "hsl(199, 89%, 48%)",
  linkedin: "hsl(188, 94%, 43%)",
  facebook: "hsl(217, 91%, 60%)",
  instagram: "hsl(330, 81%, 60%)",
  tiktok: "hsl(0, 0%, 0%)",
  youtube: "hsl(0, 100%, 50%)",
}

export function PlatformDistributionChart({ posts = [] }: PlatformDistributionChartProps) {
  // Count posts by platform
  const platformCounts: Record<string, number> = {}
  
  posts.forEach((post) => {
    const platform = post.platform || "unknown"
    platformCounts[platform] = (platformCounts[platform] || 0) + 1
  })
  
  const data = Object.entries(platformCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: platformColors[name.toLowerCase()] || "hsl(0, 0%, 50%)",
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
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}


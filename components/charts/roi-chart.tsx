"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"

const data = [
  { name: "Campaign A", roi: 320, spend: 1000, revenue: 3200 },
  { name: "Campaign B", roi: 180, spend: 800, revenue: 2240 },
  { name: "Campaign C", roi: 250, spend: 1200, revenue: 4200 },
  { name: "Campaign D", roi: 150, spend: 600, revenue: 1500 },
]

export function ROIChart() {
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
          formatter={(value: number, name: string) => {
            if (name === "roi") return [`${value}%`, "ROI"]
            if (name === "spend") return [`$${value.toLocaleString()}`, "Spend"]
            if (name === "revenue") return [`$${value.toLocaleString()}`, "Revenue"]
            return [value, name]
          }}
        />
        <Legend />
        <Bar 
          dataKey="roi" 
          fill="hsl(142, 76%, 36%)" 
          name="ROI %"
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="spend" 
          fill="hsl(199, 89%, 48%)" 
          name="Spend"
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="revenue" 
          fill="hsl(188, 94%, 43%)" 
          name="Revenue"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}


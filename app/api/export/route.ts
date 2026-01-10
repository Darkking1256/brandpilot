export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/export - Export posts or campaigns to CSV/JSON
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { type, format, ids } = body // type: 'posts' | 'campaigns', format: 'csv' | 'json'

    if (!type || !format) {
      return NextResponse.json(
        { error: "Type and format are required" },
        { status: 400 }
      )
    }

    let query = supabase.from(type).select("*")
    if (ids && Array.isArray(ids) && ids.length > 0) {
      query = query.in("id", ids)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching data:", error)
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      )
    }

    if (format === "json") {
      return NextResponse.json(data, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${type}-export-${new Date().toISOString().split("T")[0]}.json"`,
        },
      })
    }

    if (format === "csv") {
      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: "No data to export" },
          { status: 400 }
        )
      }

      // Convert to CSV
      const headers = Object.keys(data[0])
      const csvRows = [
        headers.join(","),
        ...data.map((row: any) =>
          headers
            .map((header) => {
              const value = row[header]
              if (value === null || value === undefined) return ""
              if (typeof value === "string" && value.includes(",")) {
                return `"${value.replace(/"/g, '""')}"`
              }
              return value
            })
            .join(",")
        ),
      ]

      const csv = csvRows.join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${type}-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    return NextResponse.json(
      { error: "Invalid format. Use 'csv' or 'json'" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


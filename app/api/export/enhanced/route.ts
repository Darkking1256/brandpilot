import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const {
      type,
      format,
      ids,
      includeImages,
      customFields,
      dateRange,
    } = await request.json()

    const supabase = await createClient()

    // Fetch data
    let query = supabase.from(type === "posts" ? "posts" : "campaigns").select("*").eq("user_id", user.id)

    if (ids && ids.length > 0) {
      query = query.in("id", ids)
    }

    if (dateRange) {
      if (dateRange.start) {
        query = query.gte("created_at", dateRange.start)
      }
      if (dateRange.end) {
        query = query.lte("created_at", dateRange.end)
      }
    }

    const { data: items, error } = await query

    if (error) {
      console.error("Error fetching data:", error)
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    // Format data based on custom fields
    const formattedData = (items || []).map((item: any) => {
      const formatted: any = {}
      const fields = customFields || ["id", "content", "platform", "status", "scheduled_date", "scheduled_time"]

      fields.forEach((field: string) => {
        if (field === "content" && type === "posts") {
          formatted.content = item.content
        } else if (field === "name" && type === "campaigns") {
          formatted.name = item.name
        } else if (field === "platform") {
          formatted.platform = item.platform
        } else if (field === "status") {
          formatted.status = item.status
        } else if (field === "scheduled_date") {
          formatted.scheduled_date = item.scheduled_date
        } else if (field === "scheduled_time") {
          formatted.scheduled_time = item.scheduled_time
        } else if (field === "image_url" && includeImages) {
          formatted.image_url = item.image_url
        }
      })

      return formatted
    })

    // Generate export based on format
    if (format === "csv") {
      return generateCSV(formattedData, includeImages)
    } else if (format === "json") {
      return generateJSON(formattedData, includeImages)
    } else if (format === "pdf") {
      return generatePDF(formattedData, includeImages)
    } else if (format === "excel") {
      return generateExcel(formattedData, includeImages)
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
  } catch (error) {
    console.error("Error in POST /api/export/enhanced:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateCSV(data: any[], includeImages: boolean) {
  if (data.length === 0) {
    return new NextResponse("", {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="export-${Date.now()}.csv"`,
      },
    })
  }

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          if (value === null || value === undefined) return ""
          if (includeImages && header === "image_url" && value) {
            return `"${value}"`
          }
          return `"${String(value).replace(/"/g, '""')}"`
        })
        .join(",")
    ),
  ]

  return new NextResponse(csvRows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="export-${Date.now()}.csv"`,
    },
  })
}

function generateJSON(data: any[], includeImages: boolean) {
  const jsonData = includeImages
    ? data
    : data.map(({ image_url, ...rest }) => rest)

  return NextResponse.json(jsonData, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="export-${Date.now()}.json"`,
    },
  })
}

function generatePDF(data: any[], includeImages: boolean) {
  // For PDF generation, you'd use a library like pdfkit or puppeteer
  // This is a simplified version
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          img { max-width: 200px; max-height: 200px; }
        </style>
      </head>
      <body>
        <h1>Export Report</h1>
        <table>
          <thead>
            <tr>
              ${Object.keys(data[0] || {}).map((key) => `<th>${key}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data.map((row) => `
              <tr>
                ${Object.values(row).map((value: any) => {
                  if (includeImages && typeof value === "string" && value.startsWith("http")) {
                    return `<td><img src="${value}" alt="Image" /></td>`
                  }
                  return `<td>${String(value || "")}</td>`
                }).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
    </html>
  `

  // In production, convert HTML to PDF using a service or library
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="export-${Date.now()}.html"`,
    },
  })
}

function generateExcel(data: any[], includeImages: boolean) {
  // For Excel generation, you'd use a library like exceljs
  // This returns CSV as a fallback (can be opened in Excel)
  return generateCSV(data, includeImages)
}


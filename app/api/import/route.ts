import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/import - Import posts or campaigns from JSON
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { type, data } = body // type: 'posts' | 'campaigns', data: array of items

    if (!type || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Type and data array are required" },
        { status: 400 }
      )
    }

    // Transform data to match database schema
    const transformedData = data.map((item: any) => {
      if (type === "posts") {
        return {
          content: item.content,
          platform: item.platform,
          scheduled_date: item.scheduledDate || item.scheduled_date,
          scheduled_time: item.scheduledTime || item.scheduled_time,
          status: item.status || "draft",
          image_url: item.imageUrl || item.image_url || null,
          link_url: item.linkUrl || item.link_url || null,
        }
      } else if (type === "campaigns") {
        return {
          name: item.name,
          description: item.description || null,
          platform: item.platform,
          objective: item.objective,
          budget: item.budget ? parseFloat(item.budget) : null,
          start_date: item.startDate || item.start_date,
          end_date: item.endDate || item.end_date || null,
          status: item.status || "draft",
        }
      }
      return item
    })

    const { data: insertedData, error } = await supabase
      .from(type)
      .insert(transformedData)
      .select()

    if (error) {
      console.error("Error importing data:", error)
      return NextResponse.json(
        { error: "Failed to import data", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imported: insertedData?.length || 0,
      data: insertedData,
    })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}


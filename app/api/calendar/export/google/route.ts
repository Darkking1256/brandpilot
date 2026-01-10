export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .in("status", ["scheduled", "published"])
      .order("scheduled_date", { ascending: true })

    if (error) {
      throw error
    }

    // Generate Google Calendar URL
    // Google Calendar accepts events via URL parameters
    const baseUrl = "https://calendar.google.com/calendar/render"
    const params = new URLSearchParams()

    // For multiple events, we'll create a link that opens Google Calendar
    // Users can then manually add events or we can create individual links
    
    // Create a simple link that opens Google Calendar
    // In a production app, you might want to use Google Calendar API to create events programmatically
    
    const calendarUrl = `${baseUrl}?action=TEMPLATE&mode=AGENDA`

    // Return instructions and the calendar URL
    return NextResponse.json({
      url: calendarUrl,
      message: "Click the link to open Google Calendar. You can then import the iCal file or add events manually.",
      icalUrl: "/api/calendar/export/ical", // Link to download iCal file for import
    })
  } catch (error: any) {
    console.error("Error generating Google Calendar link:", error)
    return NextResponse.json(
      { error: "Failed to generate Google Calendar link", details: error.message },
      { status: 500 }
    )
  }
}


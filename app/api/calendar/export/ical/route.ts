export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"

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

    // Generate iCal format
    let ical = "BEGIN:VCALENDAR\r\n"
    ical += "VERSION:2.0\r\n"
    ical += "PRODID:-//MarketPilot AI//Content Calendar//EN\r\n"
    ical += "CALSCALE:GREGORIAN\r\n"
    ical += "METHOD:PUBLISH\r\n"
    ical += "X-WR-CALNAME:MarketPilot AI Content Calendar\r\n"
    ical += "X-WR-CALDESC:Scheduled social media posts\r\n"

    posts?.forEach((post) => {
      try {
        const startDate = new Date(`${post.scheduled_date}T${post.scheduled_time || "10:00"}`)
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000) // 30 min duration

        // Format dates for iCal (YYYYMMDDTHHmmss)
        const formatICalDate = (date: Date) => {
          return format(date, "yyyyMMdd'T'HHmmss")
        }

        const summary = `${post.platform.toUpperCase()}: ${post.content.substring(0, 50).replace(/[,;\\]/g, "")}`
        const description = post.content
          .replace(/\\/g, "\\\\")
          .replace(/;/g, "\\;")
          .replace(/,/g, "\\,")
          .replace(/\n/g, "\\n")

        ical += "BEGIN:VEVENT\r\n"
        ical += `UID:${post.id}@marketpilot.ai\r\n`
        ical += `DTSTART:${formatICalDate(startDate)}\r\n`
        ical += `DTEND:${formatICalDate(endDate)}\r\n`
        ical += `DTSTAMP:${formatICalDate(new Date())}\r\n`
        ical += `SUMMARY:${summary}\r\n`
        ical += `DESCRIPTION:${description}\r\n`
        ical += `LOCATION:${post.platform}\r\n`
        ical += `STATUS:${post.status === "published" ? "CONFIRMED" : "TENTATIVE"}\r\n`
        if (post.image_url) {
          ical += `ATTACH:${post.image_url}\r\n`
        }
        ical += "END:VEVENT\r\n"
      } catch (err) {
        console.error(`Error processing post ${post.id}:`, err)
        // Continue with next post
      }
    })

    ical += "END:VCALENDAR\r\n"

    return new NextResponse(ical, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="content-calendar.ics"',
      },
    })
  } catch (error: any) {
    console.error("Error exporting calendar:", error)
    return NextResponse.json(
      { error: "Failed to export calendar", details: error.message },
      { status: 500 }
    )
  }
}


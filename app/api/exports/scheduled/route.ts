import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { addDays, addWeeks, addMonths } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()

    const { data: exports, error } = await supabase
      .from("scheduled_exports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching scheduled exports:", error)
      return NextResponse.json({ error: "Failed to fetch exports" }, { status: 500 })
    }

    return NextResponse.json({ exports: exports || [] })
  } catch (error) {
    console.error("Error in GET /api/exports/scheduled:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const {
      name,
      entityType,
      format,
      includeImages,
      scheduleType,
      scheduleConfig,
      emailRecipients,
    } = await request.json()

    const supabase = await createClient()

    if (!name || !entityType || !format || !scheduleType) {
      return NextResponse.json(
        { error: "Name, entity type, format, and schedule type are required" },
        { status: 400 }
      )
    }

    // Calculate next run time
    let nextRunAt = new Date()
    switch (scheduleType) {
      case "daily":
        nextRunAt = addDays(nextRunAt, 1)
        break
      case "weekly":
        nextRunAt = addWeeks(nextRunAt, 1)
        break
      case "monthly":
        nextRunAt = addMonths(nextRunAt, 1)
        break
      case "custom":
        // Use custom schedule config
        break
    }

    const { data: scheduledExport, error } = await supabase
      .from("scheduled_exports")
      .insert({
        user_id: user.id,
        name,
        entity_type: entityType,
        format,
        include_images: includeImages || false,
        schedule_type: scheduleType,
        schedule_config: scheduleConfig || {},
        email_recipients: emailRecipients || [],
        enabled: true,
        next_run_at: nextRunAt.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating scheduled export:", error)
      return NextResponse.json({ error: "Failed to create scheduled export" }, { status: 500 })
    }

    return NextResponse.json({ export: scheduledExport })
  } catch (error) {
    console.error("Error in POST /api/exports/scheduled:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


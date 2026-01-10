export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

const preferencesSchema = z.object({
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  sms_alerts: z.boolean().optional(),
  weekly_digest: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    const { data: preferences, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") { // PGRST116 = not found
      console.error("Error fetching preferences:", error)
      return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
    }

    // Return defaults if no preferences exist
    const defaultPreferences = {
      email_notifications: true,
      push_notifications: true,
      sms_alerts: false,
      weekly_digest: true,
      theme: "system",
      language: "en",
      timezone: "UTC",
    }

    return NextResponse.json({ preferences: preferences || defaultPreferences })
  } catch (error) {
    console.error("Error in GET /api/user/preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const body = await request.json()
    
    const validated = preferencesSchema.parse(body)
    
    // Check if preferences exist
    const { data: existingPreferences } = await supabase
      .from("user_preferences")
      .select("id")
      .eq("user_id", user.id)
      .single()

    let result
    if (existingPreferences) {
      // Update existing preferences
      const { data, error } = await supabase
        .from("user_preferences")
        .update({
          ...validated,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating preferences:", error)
        return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
      }
      result = data
    } else {
      // Create new preferences with defaults
      const { data, error } = await supabase
        .from("user_preferences")
        .insert({
          user_id: user.id,
          email_notifications: true,
          push_notifications: true,
          sms_alerts: false,
          weekly_digest: true,
          theme: "system",
          language: "en",
          timezone: "UTC",
          ...validated,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating preferences:", error)
        return NextResponse.json({ error: "Failed to create preferences" }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({ preferences: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error in PUT /api/user/preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


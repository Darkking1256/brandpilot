import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

const connectSchema = z.object({
  platform: z.enum(["twitter", "linkedin", "facebook", "instagram", "tiktok", "youtube"]),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.string().optional(),
  platformUserId: z.string().optional(),
  platformUsername: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const body = await request.json()

    const validated = connectSchema.parse(body)

    // Check if connection already exists
    const { data: existing } = await supabase
      .from("platform_connections")
      .select("id")
      .eq("user_id", user.id)
      .eq("platform", validated.platform)
      .single()

    let result
    if (existing) {
      // Update existing connection
      const { data, error } = await supabase
        .from("platform_connections")
        .update({
          access_token: validated.accessToken,
          refresh_token: validated.refreshToken,
          token_expires_at: validated.tokenExpiresAt
            ? new Date(validated.tokenExpiresAt).toISOString()
            : null,
          platform_user_id: validated.platformUserId,
          platform_username: validated.platformUsername,
          is_active: true,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating platform connection:", error)
        return NextResponse.json({ error: "Failed to update connection" }, { status: 500 })
      }
      result = data
    } else {
      // Create new connection
      const { data, error } = await supabase
        .from("platform_connections")
        .insert({
          user_id: user.id,
          platform: validated.platform,
          access_token: validated.accessToken,
          refresh_token: validated.refreshToken,
          token_expires_at: validated.tokenExpiresAt
            ? new Date(validated.tokenExpiresAt).toISOString()
            : null,
          platform_user_id: validated.platformUserId,
          platform_username: validated.platformUsername,
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating platform connection:", error)
        return NextResponse.json({ error: "Failed to create connection" }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({ connection: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error in POST /api/platforms/connect:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


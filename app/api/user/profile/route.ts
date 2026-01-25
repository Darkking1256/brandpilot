export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
}

const profileSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  company: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Return 401 if Supabase is not configured (triggers guest mode in dashboard)
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 401 })
    }

    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") { // PGRST116 = not found
      console.error("Error fetching profile:", error)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    return NextResponse.json({ profile: profile || null })
  } catch (error) {
    console.error("Error in GET /api/user/profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const body = await request.json()
    
    const validated = profileSchema.parse(body)
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single()

    let result
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          ...validated,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating profile:", error)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
      }
      result = data
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          ...validated,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating profile:", error)
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({ profile: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error in PUT /api/user/profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


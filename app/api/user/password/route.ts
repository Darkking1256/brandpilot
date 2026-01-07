import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const passwordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(1),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const validated = passwordSchema.parse(body)
    
    // Get current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      // For development without auth, return a helpful message
      return NextResponse.json({ 
        error: "Authentication required. Please sign in to change your password.",
        requiresAuth: true 
      }, { status: 401 })
    }

    // Update password using Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: validated.new_password,
    })

    if (updateError) {
      console.error("Error updating password:", updateError)
      return NextResponse.json({ 
        error: updateError.message || "Failed to update password" 
      }, { status: 400 })
    }

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error in PUT /api/user/password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Development Helper API: Auto-confirm user email
 * 
 * This endpoint uses the Supabase Admin API to auto-confirm user emails
 * for development purposes. Requires SUPABASE_SERVICE_ROLE_KEY.
 * 
 * POST /api/auth/auto-confirm-email
 * Body: { "email": "user@example.com" }
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { 
          error: "Service role key not configured",
          message: "Add SUPABASE_SERVICE_ROLE_KEY to your environment variables"
        },
        { status: 500 }
      )
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      return NextResponse.json(
        { error: "Failed to list users", details: listError.message },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${email} not found` },
        { status: 404 }
      )
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({
        message: "Email is already confirmed",
        user: {
          id: user.id,
          email: user.email,
          confirmed: true,
        },
      })
    }

    // Confirm email
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true,
      }
    )

    if (error) {
      return NextResponse.json(
        { error: "Failed to confirm email", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Email confirmed successfully",
      user: {
        id: user.id,
        email: user.email,
        confirmed: true,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}


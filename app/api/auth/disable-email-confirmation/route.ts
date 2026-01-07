import { NextResponse } from "next/server"

/**
 * This endpoint provides instructions for disabling email confirmation.
 * Email confirmation is a Supabase Dashboard setting and cannot be disabled via API
 * without admin/service role access.
 * 
 * To disable email confirmation:
 * 1. Go to https://app.supabase.com
 * 2. Select your project
 * 3. Go to Authentication → Settings
 * 4. Find "Enable email confirmations"
 * 5. Toggle it OFF
 * 6. Click Save
 */
export async function GET() {
  return NextResponse.json({
    message: "Email confirmation is a Supabase Dashboard setting",
    instructions: [
      "1. Go to https://app.supabase.com",
      "2. Select your project",
      "3. Navigate to Authentication → Settings",
      "4. Find 'Enable email confirmations'",
      "5. Toggle it OFF",
      "6. Click Save",
    ],
    note: "After disabling, users can sign in immediately without email confirmation.",
  })
}


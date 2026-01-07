import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

// POST /api/campaigns/bulk - Bulk operations for campaigns
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const body = await request.json()
    const { action, ids, data } = body

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Action and ids array are required" },
        { status: 400 }
      )
    }

    switch (action) {
      case "delete":
        const { error: deleteError } = await supabase
          .from("campaigns")
          .delete()
          .in("id", ids)
          .eq("user_id", user.id) // Only delete user's own campaigns

        if (deleteError) {
          console.error("Error deleting campaigns:", deleteError)
          return NextResponse.json(
            { error: "Failed to delete campaigns" },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true, deleted: ids.length })

      case "update":
        if (!data) {
          return NextResponse.json(
            { error: "Update data is required" },
            { status: 400 }
          )
        }

        const updateData: any = {}
        if (data.status !== undefined) updateData.status = data.status

        const { error: updateError } = await supabase
          .from("campaigns")
          .update(updateData)
          .in("id", ids)
          .eq("user_id", user.id) // Only update user's own campaigns

        if (updateError) {
          console.error("Error updating campaigns:", updateError)
          return NextResponse.json(
            { error: "Failed to update campaigns" },
            { status: 500 }
          )
        }

        return NextResponse.json({ success: true, updated: ids.length })

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


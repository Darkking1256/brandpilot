import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updates = await request.json()
    const supabase = await createClient()

    const { error } = await supabase
      .from("scheduled_exports")
      .update(updates)
      .eq("id", id)

    if (error) {
      console.error("Error updating scheduled export:", error)
      return NextResponse.json({ error: "Failed to update export" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PATCH /api/exports/scheduled/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = await createClient()

    const { error } = await supabase
      .from("scheduled_exports")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting scheduled export:", error)
      return NextResponse.json({ error: "Failed to delete export" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/exports/scheduled/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


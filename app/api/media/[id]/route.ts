import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const { id } = params

    // Check if asset exists and belongs to user
    const { data: asset, error: fetchError } = await supabase
      .from("media_assets")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("media_assets")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting asset:", deleteError)
      return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 })
    }

    // In production, also delete from storage
    // await supabase.storage.from("media").remove([asset.file_path])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/media/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


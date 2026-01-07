import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, content, category } = await request.json()
    const supabase = await createClient()

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (content !== undefined) updates.content = content
    if (category !== undefined) updates.category = category

    const { data, error } = await supabase
      .from("comment_templates")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ template: data })
  } catch (error: any) {
    console.error("Error updating comment template:", error)
    return NextResponse.json(
      { error: "Failed to update template", details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("comment_templates")
      .delete()
      .eq("id", params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting comment template:", error)
    return NextResponse.json(
      { error: "Failed to delete template", details: error.message },
      { status: 500 }
    )
  }
}


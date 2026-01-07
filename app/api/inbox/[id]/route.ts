import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("inbox_messages")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ message: data })
  } catch (error: any) {
    console.error("Error fetching inbox message:", error)
    return NextResponse.json(
      { error: "Failed to fetch inbox message", details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("inbox_messages")
      .update(body)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ message: data })
  } catch (error: any) {
    console.error("Error updating inbox message:", error)
    return NextResponse.json(
      { error: "Failed to update inbox message", details: error.message },
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

    const { error } = await supabase.from("inbox_messages").delete().eq("id", params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting inbox message:", error)
    return NextResponse.json(
      { error: "Failed to delete inbox message", details: error.message },
      { status: 500 }
    )
  }
}


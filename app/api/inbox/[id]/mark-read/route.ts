import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("inbox_messages")
      .update({ is_read: true })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ message: data })
  } catch (error: any) {
    console.error("Error marking message as read:", error)
    return NextResponse.json(
      { error: "Failed to mark message as read", details: error.message },
      { status: 500 }
    )
  }
}


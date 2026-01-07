import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("tracking_keywords")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ keyword: data })
  } catch (error: any) {
    console.error("Error fetching tracking keyword:", error)
    return NextResponse.json(
      { error: "Failed to fetch tracking keyword", details: error.message },
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
      .from("tracking_keywords")
      .update(body)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ keyword: data })
  } catch (error: any) {
    console.error("Error updating tracking keyword:", error)
    return NextResponse.json(
      { error: "Failed to update tracking keyword", details: error.message },
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

    const { error } = await supabase.from("tracking_keywords").delete().eq("id", params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting tracking keyword:", error)
    return NextResponse.json(
      { error: "Failed to delete tracking keyword", details: error.message },
      { status: 500 }
    )
  }
}


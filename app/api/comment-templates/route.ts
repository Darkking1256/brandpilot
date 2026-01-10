export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("comment_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ templates: data || [] })
  } catch (error: any) {
    console.error("Error fetching comment templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch templates", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const { name, content, category = "general" } = await request.json()

    if (!name || !content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("comment_templates")
      .insert({
        user_id: user.id,
        name,
        content,
        category,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ template: data })
  } catch (error: any) {
    console.error("Error creating comment template:", error)
    return NextResponse.json(
      { error: "Failed to create template", details: error.message },
      { status: 500 }
    )
  }
}


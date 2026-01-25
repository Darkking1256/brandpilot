export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
}

// GET /api/templates - Fetch all templates
export async function GET(request: NextRequest) {
  try {
    // Return empty array if Supabase is not configured (demo mode)
    if (!isSupabaseConfigured()) {
      return NextResponse.json([])
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'post' | 'campaign'

    let query = supabase.from("templates").select("*").order("created_at", { ascending: false })
    
    if (type) {
      query = query.eq("type", type)
    }

    const { data: templates, error } = await query

    if (error) {
      console.error("Error fetching templates:", error)
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 }
      )
    }

    return NextResponse.json(templates || [])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { name, type, content, description, tags } = body

    if (!name || !type || !content) {
      return NextResponse.json(
        { error: "Name, type, and content are required" },
        { status: 400 }
      )
    }

    const { data: template, error } = await supabase
      .from("templates")
      .insert({
        name,
        type,
        content,
        description: description || null,
        tags: tags || [],
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating template:", error)
      return NextResponse.json(
        { error: "Failed to create template" },
        { status: 500 }
      )
    }

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


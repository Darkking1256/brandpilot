export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

const keywordSchema = z.object({
  keyword: z.string().min(1),
  keyword_type: z.enum(["hashtag", "keyword", "username", "url"]),
  platforms: z.array(z.string()),
  is_active: z.boolean().default(true),
  alert_on_mention: z.boolean().default(true),
  min_engagement_threshold: z.number().default(0),
})

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("tracking_keywords")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ keywords: data || [] })
  } catch (error: any) {
    console.error("Error fetching tracking keywords:", error)
    return NextResponse.json(
      { error: "Failed to fetch tracking keywords", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const body = await request.json()

    const validated = keywordSchema.parse(body)

    const { data, error } = await supabase
      .from("tracking_keywords")
      .insert({
        user_id: user.id,
        ...validated,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ keyword: data }, { status: 201 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error creating tracking keyword:", error)
    return NextResponse.json(
      { error: "Failed to create tracking keyword", details: error.message },
      { status: 500 }
    )
  }
}


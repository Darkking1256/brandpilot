export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const search = searchParams.get("search")

    let query = supabase
      .from("media_assets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (type && type !== "all") {
      query = query.eq("file_type", type)
    }

    const { data: assets, error } = await query

    if (error) {
      console.error("Error fetching media assets:", error)
      return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 })
    }

    // Filter by search if provided
    let filteredAssets = assets || []
    if (search) {
      const searchLower = search.toLowerCase()
      filteredAssets = filteredAssets.filter(
        (asset) =>
          asset.file_name.toLowerCase().includes(searchLower) ||
          asset.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
          asset.description?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({ assets: filteredAssets })
  } catch (error) {
    console.error("Error in GET /api/media:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
}

// GET /api/campaigns - Fetch all campaigns for the current user
export async function GET(request: NextRequest) {
  try {
    // Return empty array if Supabase is not configured (demo mode)
    if (!isSupabaseConfigured()) {
      return NextResponse.json([])
    }

    const { user, error: authError } = await requireAuth()
    if (authError) return NextResponse.json([])

    const supabase = await createClient()

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching campaigns:", error)
      return NextResponse.json(
        { error: "Failed to fetch campaigns" },
        { status: 500 }
      )
    }

    // Transform data to match frontend format
    const transformedCampaigns = campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description || undefined,
      platform: campaign.platform,
      objective: campaign.objective,
      budget: campaign.budget ? parseFloat(campaign.budget) : undefined,
      startDate: campaign.start_date,
      endDate: campaign.end_date || undefined,
      status: campaign.status,
      createdAt: campaign.created_at,
    }))

    return NextResponse.json(transformedCampaigns)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    const body = await request.json()
    const { name, description, platform, objective, budget, startDate, endDate } = body

    // Validate required fields
    if (!name || !platform || !objective || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Determine status based on start date
    const startDateTime = new Date(startDate)
    const now = new Date()
    const status = startDateTime <= now ? "active" : "draft"

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        platform,
        objective,
        budget: budget ? parseFloat(budget) : null,
        start_date: startDate,
        end_date: endDate || null,
        status,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating campaign:", error)
      return NextResponse.json(
        { error: "Failed to create campaign" },
        { status: 500 }
      )
    }

    // Transform response to match frontend format
    const transformedCampaign = {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description || undefined,
      platform: campaign.platform,
      objective: campaign.objective,
      budget: campaign.budget ? parseFloat(campaign.budget) : undefined,
      startDate: campaign.start_date,
      endDate: campaign.end_date || undefined,
      status: campaign.status,
      createdAt: campaign.created_at,
    }

    return NextResponse.json(transformedCampaign, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


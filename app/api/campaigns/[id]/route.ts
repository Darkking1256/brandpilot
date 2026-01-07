import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

// GET /api/campaigns/[id] - Get a single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id) // Only get user's own campaigns
      .single()

    if (error || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
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

    return NextResponse.json(transformedCampaign)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/campaigns/[id] - Update a campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    const body = await request.json()
    const { name, description, platform, objective, budget, startDate, endDate, status } = body

    // Determine status if not provided
    let finalStatus = status
    if (!finalStatus && startDate) {
      const startDateTime = new Date(startDate)
      const now = new Date()
      finalStatus = startDateTime <= now ? "active" : "draft"
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description || null
    if (platform !== undefined) updateData.platform = platform
    if (objective !== undefined) updateData.objective = objective
    if (budget !== undefined) updateData.budget = budget ? parseFloat(budget) : null
    if (startDate !== undefined) updateData.start_date = startDate
    if (endDate !== undefined) updateData.end_date = endDate || null
    if (finalStatus !== undefined) updateData.status = finalStatus

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .update(updateData)
      .eq("id", params.id)
      .eq("user_id", user.id) // Only update user's own campaigns
      .select()
      .single()

    if (error) {
      console.error("Error updating campaign:", error)
      return NextResponse.json(
        { error: "Failed to update campaign" },
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

    return NextResponse.json(transformedCampaign)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    
    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id) // Only delete user's own campaigns

    if (error) {
      console.error("Error deleting campaign:", error)
      return NextResponse.json(
        { error: "Failed to delete campaign" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


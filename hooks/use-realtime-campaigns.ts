"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Campaign } from "@/components/campaigns-table"

export function useRealtimeCampaigns(initialCampaigns: Campaign[] = []) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const supabase = createClient()

  useEffect(() => {
    setCampaigns(initialCampaigns)
  }, [initialCampaigns])

  useEffect(() => {
    // Subscribe to changes in campaigns table
    const channel = supabase
      .channel("campaigns-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "campaigns",
        },
        (payload) => {
          console.log("Realtime campaign change:", payload)

          if (payload.eventType === "INSERT") {
            const newCampaign = payload.new as any
            const transformedCampaign: Campaign = {
              id: newCampaign.id,
              name: newCampaign.name,
              description: newCampaign.description || undefined,
              platform: newCampaign.platform,
              objective: newCampaign.objective,
              budget: newCampaign.budget ? parseFloat(newCampaign.budget) : undefined,
              startDate: newCampaign.start_date,
              endDate: newCampaign.end_date || undefined,
              status: newCampaign.status,
              createdAt: newCampaign.created_at,
            }
            setCampaigns((prev) => [transformedCampaign, ...prev])
          } else if (payload.eventType === "UPDATE") {
            const updatedCampaign = payload.new as any
            const transformedCampaign: Campaign = {
              id: updatedCampaign.id,
              name: updatedCampaign.name,
              description: updatedCampaign.description || undefined,
              platform: updatedCampaign.platform,
              objective: updatedCampaign.objective,
              budget: updatedCampaign.budget ? parseFloat(updatedCampaign.budget) : undefined,
              startDate: updatedCampaign.start_date,
              endDate: updatedCampaign.end_date || undefined,
              status: updatedCampaign.status,
              createdAt: updatedCampaign.created_at,
            }
            setCampaigns((prev) =>
              prev.map((campaign) =>
                campaign.id === updatedCampaign.id ? transformedCampaign : campaign
              )
            )
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id
            setCampaigns((prev) => prev.filter((campaign) => campaign.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return campaigns
}


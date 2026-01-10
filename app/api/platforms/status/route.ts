export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getOAuthCredentials } from "@/lib/oauth-credentials"

/**
 * Check OAuth configuration status for each platform
 * Checks database first, then falls back to environment variables
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const platformKeys = ["twitter", "linkedin", "facebook", "instagram", "youtube", "tiktok"]
  
  const platforms: Record<string, { name: string; configured: boolean; missing: string[]; source: "database" | "env" | "none" }> = {}

  for (const key of platformKeys) {
    const credentials = await getOAuthCredentials(key)
    
    let configured = false
    let source: "database" | "env" | "none" = "none"
    const missing: string[] = []

    if (credentials && credentials.client_id && credentials.client_secret) {
      configured = true
      // Check if it came from database
      const { data: dbCreds } = await supabase
        .from("oauth_app_credentials")
        .select("id")
        .eq("platform", key)
        .eq("is_active", true)
        .single()
      source = dbCreds ? "database" : "env"
    } else {
      // Determine what's missing
      switch (key) {
        case "twitter":
          if (!process.env.TWITTER_CLIENT_ID) missing.push("TWITTER_CLIENT_ID")
          if (!process.env.TWITTER_CLIENT_SECRET) missing.push("TWITTER_CLIENT_SECRET")
          break
        case "linkedin":
          if (!process.env.LINKEDIN_CLIENT_ID) missing.push("LINKEDIN_CLIENT_ID")
          if (!process.env.LINKEDIN_CLIENT_SECRET) missing.push("LINKEDIN_CLIENT_SECRET")
          break
        case "facebook":
          if (!process.env.FACEBOOK_APP_ID) missing.push("FACEBOOK_APP_ID")
          if (!process.env.FACEBOOK_APP_SECRET) missing.push("FACEBOOK_APP_SECRET")
          break
        case "instagram":
          if (!process.env.FACEBOOK_APP_ID) missing.push("FACEBOOK_APP_ID")
          if (!process.env.FACEBOOK_APP_SECRET) missing.push("FACEBOOK_APP_SECRET")
          break
        case "youtube":
          if (!process.env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID")
          if (!process.env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET")
          break
        case "tiktok":
          if (!process.env.TIKTOK_CLIENT_KEY) missing.push("TIKTOK_CLIENT_KEY")
          if (!process.env.TIKTOK_CLIENT_SECRET) missing.push("TIKTOK_CLIENT_SECRET")
          break
      }
    }

    platforms[key] = {
      name: key === "twitter" ? "Twitter/X" : key.charAt(0).toUpperCase() + key.slice(1),
      configured,
      missing,
      source,
    }
  }

  const configuredCount = Object.values(platforms).filter((p) => p.configured).length
  const totalCount = Object.keys(platforms).length

  return NextResponse.json({
    status: "ok",
    summary: {
      configured: configuredCount,
      total: totalCount,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    },
    platforms,
  })
}


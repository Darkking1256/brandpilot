import { createClient } from "@/lib/supabase/server"
import { decryptSecret } from "@/lib/encryption"

export interface OAuthCredentials {
  client_id: string
  client_secret: string
  redirect_uri: string
  additional_config?: Record<string, any>
}

/**
 * Get OAuth credentials for a platform
 * First checks database, then falls back to environment variables
 */
export async function getOAuthCredentials(platform: string): Promise<OAuthCredentials | null> {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const callbackUrl = `${baseUrl}/api/platforms/oauth/${platform}/callback`

  // Try database first
  const { data: dbCreds } = await supabase
    .from("oauth_app_credentials")
    .select("*")
    .eq("platform", platform)
    .eq("is_active", true)
    .single()

  if (dbCreds) {
    return {
      client_id: dbCreds.client_id,
      client_secret: decryptSecret(dbCreds.client_secret_encrypted),
      redirect_uri: dbCreds.redirect_uri || callbackUrl,
      additional_config: dbCreds.additional_config || {},
    }
  }

  // Fallback to environment variables
  let client_id = ""
  let client_secret = ""

  switch (platform) {
    case "twitter":
      client_id = process.env.TWITTER_CLIENT_ID || ""
      client_secret = process.env.TWITTER_CLIENT_SECRET || ""
      break
    case "linkedin":
      client_id = process.env.LINKEDIN_CLIENT_ID || ""
      client_secret = process.env.LINKEDIN_CLIENT_SECRET || ""
      break
    case "facebook":
    case "instagram":
      client_id = process.env.FACEBOOK_APP_ID || ""
      client_secret = process.env.FACEBOOK_APP_SECRET || ""
      break
    case "youtube":
      client_id = process.env.GOOGLE_CLIENT_ID || ""
      client_secret = process.env.GOOGLE_CLIENT_SECRET || ""
      break
    case "tiktok":
      client_id = process.env.TIKTOK_CLIENT_KEY || ""
      client_secret = process.env.TIKTOK_CLIENT_SECRET || ""
      break
  }

  if (client_id && client_secret) {
    return {
      client_id,
      client_secret,
      redirect_uri: callbackUrl,
      additional_config: {},
    }
  }

  return null
}


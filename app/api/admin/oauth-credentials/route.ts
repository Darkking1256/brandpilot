export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { encryptSecret, decryptSecret } from "@/lib/encryption"
import { z } from "zod"

const credentialSchema = z.object({
  platform: z.enum(["twitter", "linkedin", "facebook", "instagram", "youtube", "tiktok"]),
  client_id: z.string().min(1, "Client ID is required"),
  client_secret: z.string().min(1, "Client secret is required"),
  redirect_uri: z.string().url("Redirect URI must be a valid URL"),
  additional_config: z.record(z.any()).optional(),
})

/**
 * GET - List all OAuth credentials
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: credentials, error } = await supabase
      .from("oauth_app_credentials")
      .select("*")
      .order("platform")

    if (error) {
      console.error("Error fetching OAuth credentials:", error)
      return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 })
    }

    // Decrypt secrets for display (in production, you might want to mask these)
    const decryptedCredentials = credentials?.map((cred) => ({
      ...cred,
      client_secret: decryptSecret(cred.client_secret_encrypted),
    }))

    return NextResponse.json({ credentials: decryptedCredentials || [] })
  } catch (error) {
    console.error("Error in GET /api/admin/oauth-credentials:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST - Create or update OAuth credentials
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const validated = credentialSchema.parse(body)

    // Encrypt the client secret
    const encryptedSecret = encryptSecret(validated.client_secret)

    // Check if credentials already exist for this platform
    const { data: existing } = await supabase
      .from("oauth_app_credentials")
      .select("id")
      .eq("platform", validated.platform)
      .single()

    let result
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("oauth_app_credentials")
        .update({
          client_id: validated.client_id,
          client_secret_encrypted: encryptedSecret,
          redirect_uri: validated.redirect_uri,
          additional_config: validated.additional_config || null,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating OAuth credentials:", error)
        return NextResponse.json({ error: "Failed to update credentials" }, { status: 500 })
      }
      result = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from("oauth_app_credentials")
        .insert({
          platform: validated.platform,
          client_id: validated.client_id,
          client_secret_encrypted: encryptedSecret,
          redirect_uri: validated.redirect_uri,
          additional_config: validated.additional_config || null,
          is_active: true,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating OAuth credentials:", error)
        return NextResponse.json({ error: "Failed to create credentials" }, { status: 500 })
      }
      result = data
    }

    // Don't return the encrypted secret
    const { client_secret_encrypted, ...safeResult } = result
    return NextResponse.json({
      success: true,
      credential: safeResult,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error in POST /api/admin/oauth-credentials:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE - Delete OAuth credentials
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get("platform")

    if (!platform) {
      return NextResponse.json({ error: "Platform is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("oauth_app_credentials")
      .delete()
      .eq("platform", platform)

    if (error) {
      console.error("Error deleting OAuth credentials:", error)
      return NextResponse.json({ error: "Failed to delete credentials" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/admin/oauth-credentials:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import * as twitter from "@/lib/platforms/twitter"
import * as linkedin from "@/lib/platforms/linkedin"
import * as facebook from "@/lib/platforms/facebook"
import * as tiktok from "@/lib/platforms/tiktok"
import * as youtube from "@/lib/platforms/youtube"
import crypto from "crypto"

// Decryption for tokens
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ""

function decrypt(text: string): string {
  try {
    const parts = text.split(":")
    const iv = Buffer.from(parts.shift()!, "hex")
    const encryptedText = Buffer.from(parts.join(":"), "hex")
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
      iv
    )
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch {
    return text // Return as-is if decryption fails (might be unencrypted)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const body = await request.json()
    const { platform } = body

    if (!platform) {
      return NextResponse.json({ error: "Platform is required" }, { status: 400 })
    }

    // Get platform connection
    const { data: connection, error } = await supabase
      .from("platform_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform", platform)
      .eq("is_active", true)
      .single()

    if (error || !connection) {
      return NextResponse.json(
        { error: `No active connection found for ${platform}` },
        { status: 404 }
      )
    }

    const accessToken = decrypt(connection.access_token)
    let isValid = false
    let userInfo: any = null

    // Test connection by fetching user info
    switch (platform) {
      case "twitter":
        userInfo = await twitter.getUser(accessToken)
        isValid = !!userInfo?.id
        break

      case "linkedin":
        userInfo = await linkedin.getUser(accessToken)
        isValid = !!userInfo?.id
        break

      case "facebook":
      case "instagram":
        userInfo = await facebook.getUser(accessToken)
        isValid = !!userInfo?.id
        break

      case "tiktok":
        userInfo = await tiktok.getUser(accessToken)
        isValid = !!userInfo?.open_id
        break

      case "youtube":
        userInfo = await youtube.getChannel(accessToken)
        isValid = !!userInfo?.id
        break

      default:
        return NextResponse.json(
          { error: `Platform ${platform} is not supported` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: isValid,
      platform,
      user: userInfo,
      message: isValid
        ? "Connection verified successfully"
        : "Connection verification failed",
    })
  } catch (error: any) {
    console.error("Error testing platform connection:", error)
    return NextResponse.json(
      { error: error.message || "Failed to test connection" },
      { status: 500 }
    )
  }
}


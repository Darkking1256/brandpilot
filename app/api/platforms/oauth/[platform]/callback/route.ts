import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Platform } from '@/types'
import * as twitter from '@/lib/platforms/twitter'
import * as linkedin from '@/lib/platforms/linkedin'
import * as facebook from '@/lib/platforms/facebook'
import * as tiktok from '@/lib/platforms/tiktok'
import * as youtube from '@/lib/platforms/youtube'
import { getOAuthConfig } from '@/lib/platforms'
import crypto from 'crypto'

// Encryption for tokens
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  try {
    const platform = params.platform as Platform
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=oauth_denied`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=missing_params`)
    }

    const cookieStore = cookies()
    const storedState = (await cookieStore).get(`oauth_state_${platform}`)?.value
    const userId = (await cookieStore).get(`oauth_user_${platform}`)?.value

    if (!storedState || state !== storedState) {
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=invalid_state`)
    }

    if (!userId) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=session_expired`)
    }

    const redirectUri = `${baseUrl}/api/platforms/oauth/${platform}/callback`
    const config = getOAuthConfig(platform)
    
    let accessToken: string
    let refreshToken: string | undefined
    let expiresAt: Date
    let platformUserId: string
    let platformUsername: string
    let profilePictureUrl: string | undefined

    switch (platform) {
      case 'twitter': {
        const codeVerifier = (await cookieStore).get('twitter_code_verifier')?.value
        if (!codeVerifier) {
          return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=missing_verifier`)
        }

        const tokens = await twitter.exchangeCodeForTokens({
          code,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri,
          codeVerifier,
        })

        const user = await twitter.getUser(tokens.access_token)

        accessToken = tokens.access_token
        refreshToken = tokens.refresh_token
        expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
        platformUserId = user.id
        platformUsername = user.username
        profilePictureUrl = user.profile_image_url

        // Clean up verifier cookie
        ;(await cookieStore).delete('twitter_code_verifier')
        break
      }

      case 'linkedin': {
        const tokens = await linkedin.exchangeCodeForTokens({
          code,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri,
        })

        const user = await linkedin.getUser(tokens.access_token)

        accessToken = tokens.access_token
        refreshToken = tokens.refresh_token
        expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
        platformUserId = user.id
        platformUsername = `${user.localizedFirstName} ${user.localizedLastName}`
        profilePictureUrl = user.profilePicture
        break
      }

      case 'facebook':
      case 'instagram': {
        const shortLivedTokens = await facebook.exchangeCodeForTokens({
          code,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri,
        })

        // Exchange for long-lived token
        const tokens = await facebook.getLongLivedToken({
          accessToken: shortLivedTokens.access_token,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
        })

        const user = await facebook.getUser(tokens.access_token)

        accessToken = tokens.access_token
        expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
        platformUserId = user.id
        platformUsername = user.name
        profilePictureUrl = user.picture?.data?.url

        // If Instagram, get Instagram business account
        if (platform === 'instagram') {
          const pages = await facebook.getPages(tokens.access_token)
          if (pages.length > 0) {
            const igAccount = await facebook.getInstagramAccount(pages[0].id, pages[0].access_token)
            if (igAccount) {
              platformUserId = igAccount.id
              platformUsername = igAccount.username
              profilePictureUrl = igAccount.profile_picture_url
              accessToken = pages[0].access_token // Use page token for Instagram
            }
          }
        }
        break
      }

      case 'tiktok': {
        const codeVerifier = (await cookieStore).get('tiktok_code_verifier')?.value
        if (!codeVerifier) {
          return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=missing_verifier`)
        }

        const tokens = await tiktok.exchangeCodeForTokens({
          code,
          clientKey: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri,
          codeVerifier,
        })

        const user = await tiktok.getUser(tokens.access_token)

        accessToken = tokens.access_token
        refreshToken = tokens.refresh_token
        expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
        platformUserId = user.open_id
        platformUsername = user.display_name
        profilePictureUrl = user.avatar_url

        // Clean up verifier cookie
        ;(await cookieStore).delete('tiktok_code_verifier')
        break
      }

      case 'youtube': {
        const tokens = await youtube.exchangeCodeForTokens({
          code,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri,
        })

        const channel = await youtube.getChannel(tokens.access_token)

        accessToken = tokens.access_token
        refreshToken = tokens.refresh_token
        expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
        platformUserId = channel?.id || ''
        platformUsername = channel?.title || 'YouTube Channel'
        profilePictureUrl = channel?.thumbnails?.default?.url
        break
      }

      default:
        return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=unsupported_platform`)
    }

    // Save to database
    const supabase = await createClient()

    const { error: dbError } = await supabase
      .from('platform_connections')
      .upsert({
        user_id: userId,
        platform,
        platform_user_id: platformUserId,
        platform_username: platformUsername,
        access_token: encrypt(accessToken),
        refresh_token: refreshToken ? encrypt(refreshToken) : null,
        token_expires_at: expiresAt.toISOString(),
        profile_picture_url: profilePictureUrl,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform',
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=db_error`)
    }

    // Clean up state cookies
    ;(await cookieStore).delete(`oauth_state_${platform}`)
    ;(await cookieStore).delete(`oauth_user_${platform}`)

    return NextResponse.redirect(`${baseUrl}/dashboard/settings?success=connected&platform=${platform}`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      `${baseUrl}/dashboard/settings?error=${encodeURIComponent(error instanceof Error ? error.message : 'callback_failed')}`
    )
  }
}

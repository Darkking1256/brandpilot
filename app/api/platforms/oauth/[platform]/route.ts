import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { requireAuth } from '@/lib/auth'
import { Platform } from '@/types'
import * as twitter from '@/lib/platforms/twitter'
import * as linkedin from '@/lib/platforms/linkedin'
import * as facebook from '@/lib/platforms/facebook'
import * as tiktok from '@/lib/platforms/tiktok'
import * as youtube from '@/lib/platforms/youtube'
import { getOAuthConfig } from '@/lib/platforms'

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const platform = params.platform as Platform
    const validPlatforms: Platform[] = ['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok', 'youtube']
    
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      )
    }

    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/platforms/oauth/${platform}/callback`

    let authUrl: string
    const cookieStore = cookies()
    const state = twitter.generateState()

    // Store state in cookie for verification
    ;(await cookieStore).set(`oauth_state_${platform}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    })

    // Store user ID for callback
    ;(await cookieStore).set(`oauth_user_${platform}`, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10,
      path: '/',
    })

    const config = getOAuthConfig(platform)

    switch (platform) {
      case 'twitter': {
        const { codeVerifier, codeChallenge } = twitter.generatePKCE()
        ;(await cookieStore).set('twitter_code_verifier', codeVerifier, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 10,
          path: '/',
        })
        authUrl = twitter.getAuthorizationUrl({
          clientId: config.clientId,
          redirectUri,
          state,
          codeChallenge,
        })
        break
      }

      case 'linkedin': {
        authUrl = linkedin.getAuthorizationUrl({
          clientId: config.clientId,
          redirectUri,
          state,
        })
        break
      }

      case 'facebook':
      case 'instagram': {
        authUrl = facebook.getAuthorizationUrl({
          clientId: config.clientId,
          redirectUri,
          state,
        })
        break
      }

      case 'tiktok': {
        const { codeVerifier, codeChallenge } = tiktok.generatePKCE()
        ;(await cookieStore).set('tiktok_code_verifier', codeVerifier, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 10,
          path: '/',
        })
        authUrl = tiktok.getAuthorizationUrl({
          clientKey: config.clientId,
          redirectUri,
          state,
          codeChallenge,
        })
        break
      }

      case 'youtube': {
        authUrl = youtube.getAuthorizationUrl({
          clientId: config.clientId,
          redirectUri,
          state,
        })
        break
      }

      default:
        return NextResponse.json(
          { error: 'Platform not supported yet' },
          { status: 400 }
        )
    }

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('OAuth init error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'OAuth initialization failed' },
      { status: 500 }
    )
  }
}

import crypto from 'crypto'

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'
const GOOGLE_OAUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

interface GoogleTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

interface YouTubeChannel {
  id: string
  title: string
  description: string
  customUrl?: string
  thumbnails?: {
    default?: { url: string }
    medium?: { url: string }
    high?: { url: string }
  }
}

export function generateState() {
  return crypto.randomBytes(16).toString('hex')
}

export function getAuthorizationUrl({
  clientId,
  redirectUri,
  state,
}: {
  clientId: string
  redirectUri: string
  state: string
}) {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
  ]

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  return `${GOOGLE_OAUTH_BASE}?${params.toString()}`
}

export async function exchangeCodeForTokens({
  code,
  clientId,
  clientSecret,
  redirectUri,
}: {
  code: string
  clientId: string
  clientSecret: string
  redirectUri: string
}): Promise<GoogleTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  return response.json()
}

export async function refreshAccessToken({
  refreshToken,
  clientId,
  clientSecret,
}: {
  refreshToken: string
  clientId: string
  clientSecret: string
}): Promise<GoogleTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  return response.json()
}

export async function getChannel(accessToken: string): Promise<YouTubeChannel | null> {
  const response = await fetch(
    `${YOUTUBE_API_BASE}/channels?part=snippet&mine=true`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get channel: ${error}`)
  }

  const data = await response.json()
  const channel = data.items?.[0]

  if (!channel) return null

  return {
    id: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    customUrl: channel.snippet.customUrl,
    thumbnails: channel.snippet.thumbnails,
  }
}

export async function initVideoUpload({
  accessToken,
  title,
  description,
  privacyStatus = 'private',
  tags,
  categoryId = '22',
}: {
  accessToken: string
  title: string
  description: string
  privacyStatus?: 'public' | 'private' | 'unlisted'
  tags?: string[]
  categoryId?: string
}): Promise<string> {
  const metadata = {
    snippet: { title, description, tags: tags || [], categoryId },
    status: { privacyStatus, selfDeclaredMadeForKids: false },
  }

  const response = await fetch(
    `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/*',
      },
      body: JSON.stringify(metadata),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to init upload: ${error}`)
  }

  const uploadUrl = response.headers.get('Location')
  if (!uploadUrl) throw new Error('No upload URL returned')

  return uploadUrl
}

export async function uploadVideoData({
  uploadUrl,
  videoData,
  contentType = 'video/mp4',
}: {
  uploadUrl: string
  videoData: Buffer | Blob
  contentType?: string
}): Promise<{ id: string; snippet: { title: string } }> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: videoData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to upload video: ${error}`)
  }

  return response.json()
}

export async function deleteVideo({
  accessToken,
  videoId,
}: {
  accessToken: string
  videoId: string
}): Promise<void> {
  const response = await fetch(
    `${YOUTUBE_API_BASE}/videos?id=${videoId}`,
    { method: 'DELETE', headers: { 'Authorization': `Bearer ${accessToken}` } }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to delete video: ${error}`)
  }
}

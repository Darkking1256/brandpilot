import crypto from 'crypto'

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2'
const TIKTOK_OAUTH_BASE = 'https://www.tiktok.com/v2/auth/authorize'

interface TikTokTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
  open_id: string
  scope: string
  token_type: string
}

interface TikTokUser {
  open_id: string
  union_id: string
  avatar_url: string
  display_name: string
  username?: string
}

// Generate OAuth state for CSRF protection
export function generateState() {
  return crypto.randomBytes(16).toString('hex')
}

// Generate PKCE code verifier and challenge
export function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
  
  return { codeVerifier, codeChallenge }
}

// Build authorization URL
export function getAuthorizationUrl({
  clientKey,
  redirectUri,
  state,
  codeChallenge,
}: {
  clientKey: string
  redirectUri: string
  state: string
  codeChallenge: string
}) {
  const scopes = [
    'user.info.basic',
    'video.publish',
    'video.upload',
  ]

  const params = new URLSearchParams({
    client_key: clientKey,
    redirect_uri: redirectUri,
    state,
    scope: scopes.join(','),
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return `${TIKTOK_OAUTH_BASE}/?${params.toString()}`
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens({
  code,
  clientKey,
  clientSecret,
  redirectUri,
  codeVerifier,
}: {
  code: string
  clientKey: string
  clientSecret: string
  redirectUri: string
  codeVerifier: string
}): Promise<TikTokTokens> {
  const response = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  const data = await response.json()
  if (data.error) {
    throw new Error(`Token error: ${data.error.message}`)
  }

  return data.data
}

// Refresh access token
export async function refreshAccessToken({
  refreshToken,
  clientKey,
  clientSecret,
}: {
  refreshToken: string
  clientKey: string
  clientSecret: string
}): Promise<TikTokTokens> {
  const response = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  const data = await response.json()
  if (data.error) {
    throw new Error(`Refresh error: ${data.error.message}`)
  }

  return data.data
}

// Get authenticated user info
export async function getUser(accessToken: string): Promise<TikTokUser> {
  const response = await fetch(`${TIKTOK_API_BASE}/user/info/?fields=open_id,union_id,avatar_url,display_name`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get user: ${error}`)
  }

  const data = await response.json()
  if (data.error) {
    throw new Error(`User error: ${data.error.message}`)
  }

  return data.data.user
}

// Initialize video upload
export async function initVideoUpload({
  accessToken,
  sourceType = 'FILE_UPLOAD',
  videoSize,
  chunkSize,
  totalChunkCount,
}: {
  accessToken: string
  sourceType?: 'FILE_UPLOAD' | 'PULL_FROM_URL'
  videoSize: number
  chunkSize: number
  totalChunkCount: number
}): Promise<{
  publish_id: string
  upload_url: string
}> {
  const response = await fetch(`${TIKTOK_API_BASE}/post/publish/inbox/video/init/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_info: {
        source: sourceType,
        video_size: videoSize,
        chunk_size: chunkSize,
        total_chunk_count: totalChunkCount,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to init upload: ${error}`)
  }

  const data = await response.json()
  if (data.error) {
    throw new Error(`Init error: ${data.error.message}`)
  }

  return data.data
}

// Upload video chunk
export async function uploadVideoChunk({
  uploadUrl,
  videoData,
  chunkIndex,
  startByte,
  endByte,
  totalSize,
}: {
  uploadUrl: string
  videoData: Buffer
  chunkIndex: number
  startByte: number
  endByte: number
  totalSize: number
}): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Range': `bytes ${startByte}-${endByte}/${totalSize}`,
    },
    body: videoData as any,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to upload chunk ${chunkIndex}: ${error}`)
  }
}

// Publish video
export async function publishVideo({
  accessToken,
  publishId,
  title,
  privacyLevel = 'SELF_ONLY',
  disableDuet = false,
  disableStitch = false,
  disableComment = false,
}: {
  accessToken: string
  publishId: string
  title: string
  privacyLevel?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY'
  disableDuet?: boolean
  disableStitch?: boolean
  disableComment?: boolean
}): Promise<{ publish_id: string }> {
  const response = await fetch(`${TIKTOK_API_BASE}/post/publish/video/init/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post_info: {
        title,
        privacy_level: privacyLevel,
        disable_duet: disableDuet,
        disable_stitch: disableStitch,
        disable_comment: disableComment,
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_id: publishId,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to publish video: ${error}`)
  }

  const data = await response.json()
  if (data.error) {
    throw new Error(`Publish error: ${data.error.message}`)
  }

  return data.data
}

// Check publish status
export async function getPublishStatus({
  accessToken,
  publishId,
}: {
  accessToken: string
  publishId: string
}): Promise<{
  status: 'PROCESSING_UPLOAD' | 'PROCESSING_DOWNLOAD' | 'SEND_TO_USER_INBOX' | 'PUBLISH_COMPLETE' | 'FAILED'
  fail_reason?: string
  published_video_id?: string
}> {
  const response = await fetch(
    `${TIKTOK_API_BASE}/post/publish/status/fetch/?publish_id=${publishId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get status: ${error}`)
  }

  const data = await response.json()
  if (data.error) {
    throw new Error(`Status error: ${data.error.message}`)
  }

  return data.data
}

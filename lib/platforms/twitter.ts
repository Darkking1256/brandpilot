import crypto from 'crypto'

const TWITTER_API_BASE = 'https://api.twitter.com/2'
const TWITTER_OAUTH_BASE = 'https://twitter.com/i/oauth2'

interface TwitterTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
}

interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
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

// Generate OAuth state for CSRF protection
export function generateState() {
  return crypto.randomBytes(16).toString('hex')
}

// Build authorization URL
export function getAuthorizationUrl({
  clientId,
  redirectUri,
  state,
  codeChallenge,
}: {
  clientId: string
  redirectUri: string
  state: string
  codeChallenge: string
}) {
  const scopes = [
    'tweet.read',
    'tweet.write',
    'users.read',
    'offline.access',
  ]

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return `${TWITTER_OAUTH_BASE}/authorize?${params.toString()}`
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens({
  code,
  clientId,
  clientSecret,
  redirectUri,
  codeVerifier,
}: {
  code: string
  clientId: string
  clientSecret: string
  redirectUri: string
  codeVerifier: string
}): Promise<TwitterTokens> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${TWITTER_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  return response.json()
}

// Refresh access token
export async function refreshAccessToken({
  refreshToken,
  clientId,
  clientSecret,
}: {
  refreshToken: string
  clientId: string
  clientSecret: string
}): Promise<TwitterTokens> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${TWITTER_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  return response.json()
}

// Get authenticated user info
export async function getUser(accessToken: string): Promise<TwitterUser> {
  const response = await fetch(`${TWITTER_API_BASE}/users/me?user.fields=profile_image_url`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get user: ${error}`)
  }

  const data = await response.json()
  return data.data
}

// Post a tweet
export async function postTweet({
  accessToken,
  text,
  mediaIds,
}: {
  accessToken: string
  text: string
  mediaIds?: string[]
}): Promise<{ id: string; text: string }> {
  const body: any = { text }
  
  if (mediaIds && mediaIds.length > 0) {
    body.media = { media_ids: mediaIds }
  }

  const response = await fetch(`${TWITTER_API_BASE}/tweets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to post tweet: ${error}`)
  }

  const data = await response.json()
  return data.data
}

// Upload media (requires v1.1 API)
export async function uploadMedia({
  accessToken,
  mediaData,
  mediaType,
}: {
  accessToken: string
  mediaData: Buffer
  mediaType: string
}): Promise<string> {
  // Twitter media upload uses v1.1 API with OAuth 1.0a
  // For production, you'll need to implement OAuth 1.0a signing
  // or use a library like twitter-api-v2
  throw new Error('Media upload requires OAuth 1.0a implementation')
}

// Delete a tweet
export async function deleteTweet({
  accessToken,
  tweetId,
}: {
  accessToken: string
  tweetId: string
}): Promise<void> {
  const response = await fetch(`${TWITTER_API_BASE}/tweets/${tweetId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to delete tweet: ${error}`)
  }
}

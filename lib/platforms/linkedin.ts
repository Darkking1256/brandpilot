import crypto from 'crypto'

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2'
const LINKEDIN_OAUTH_BASE = 'https://www.linkedin.com/oauth/v2'

interface LinkedInTokens {
  access_token: string
  expires_in: number
  refresh_token?: string
  refresh_token_expires_in?: number
  scope: string
}

interface LinkedInUser {
  id: string
  localizedFirstName: string
  localizedLastName: string
  profilePicture?: string
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
}: {
  clientId: string
  redirectUri: string
  state: string
}) {
  const scopes = [
    'openid',
    'profile',
    'email',
    'w_member_social',
  ]

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: scopes.join(' '),
  })

  return `${LINKEDIN_OAUTH_BASE}/authorization?${params.toString()}`
}

// Exchange authorization code for tokens
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
}): Promise<LinkedInTokens> {
  const response = await fetch(`${LINKEDIN_OAUTH_BASE}/accessToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
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
}): Promise<LinkedInTokens> {
  const response = await fetch(`${LINKEDIN_OAUTH_BASE}/accessToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  return response.json()
}

// Get authenticated user info
export async function getUser(accessToken: string): Promise<LinkedInUser> {
  const response = await fetch(`${LINKEDIN_API_BASE}/userinfo`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get user: ${error}`)
  }

  const data = await response.json()
  return {
    id: data.sub,
    localizedFirstName: data.given_name,
    localizedLastName: data.family_name,
    profilePicture: data.picture,
  }
}

// Get user's URN for posting
export async function getUserUrn(accessToken: string): Promise<string> {
  const user = await getUser(accessToken)
  return `urn:li:person:${user.id}`
}

// Create a post on LinkedIn
export async function createPost({
  accessToken,
  authorUrn,
  text,
  visibility = 'PUBLIC',
}: {
  accessToken: string
  authorUrn: string
  text: string
  visibility?: 'PUBLIC' | 'CONNECTIONS'
}): Promise<{ id: string }> {
  const response = await fetch(`${LINKEDIN_API_BASE}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202401',
    },
    body: JSON.stringify({
      author: authorUrn,
      commentary: text,
      visibility,
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create post: ${error}`)
  }

  const postId = response.headers.get('x-restli-id') || ''
  return { id: postId }
}

// Delete a post
export async function deletePost({
  accessToken,
  postUrn,
}: {
  accessToken: string
  postUrn: string
}): Promise<void> {
  const response = await fetch(`${LINKEDIN_API_BASE}/posts/${encodeURIComponent(postUrn)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to delete post: ${error}`)
  }
}

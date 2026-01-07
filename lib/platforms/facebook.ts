import crypto from 'crypto'

const FACEBOOK_API_BASE = 'https://graph.facebook.com/v18.0'
const FACEBOOK_OAUTH_BASE = 'https://www.facebook.com/v18.0/dialog/oauth'

interface FacebookTokens {
  access_token: string
  token_type: string
  expires_in: number
}

interface FacebookUser {
  id: string
  name: string
  email?: string
  picture?: {
    data: {
      url: string
    }
  }
}

interface FacebookPage {
  id: string
  name: string
  access_token: string
  category: string
}

interface InstagramAccount {
  id: string
  username: string
  profile_picture_url?: string
}

// Generate OAuth state for CSRF protection
export function generateState() {
  return crypto.randomBytes(16).toString('hex')
}

// Build authorization URL for Facebook
export function getAuthorizationUrl({
  clientId,
  redirectUri,
  state,
  scope,
}: {
  clientId: string
  redirectUri: string
  state: string
  scope?: string[]
}) {
  const defaultScopes = [
    'public_profile',
    'email',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'instagram_basic',
    'instagram_content_publish',
  ]

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: (scope || defaultScopes).join(','),
    response_type: 'code',
  })

  return `${FACEBOOK_OAUTH_BASE}?${params.toString()}`
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
}): Promise<FacebookTokens> {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  })

  const response = await fetch(`${FACEBOOK_API_BASE}/oauth/access_token?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to exchange code: ${error.error?.message || JSON.stringify(error)}`)
  }

  return response.json()
}

// Exchange short-lived token for long-lived token
export async function getLongLivedToken({
  accessToken,
  clientId,
  clientSecret,
}: {
  accessToken: string
  clientId: string
  clientSecret: string
}): Promise<FacebookTokens> {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: clientId,
    client_secret: clientSecret,
    fb_exchange_token: accessToken,
  })

  const response = await fetch(`${FACEBOOK_API_BASE}/oauth/access_token?${params.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to get long-lived token: ${error.error?.message}`)
  }

  return response.json()
}

// Get authenticated user info
export async function getUser(accessToken: string): Promise<FacebookUser> {
  const response = await fetch(
    `${FACEBOOK_API_BASE}/me?fields=id,name,email,picture&access_token=${accessToken}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to get user: ${error.error?.message}`)
  }

  return response.json()
}

// Get user's Facebook Pages
export async function getPages(accessToken: string): Promise<FacebookPage[]> {
  const response = await fetch(
    `${FACEBOOK_API_BASE}/me/accounts?fields=id,name,access_token,category&access_token=${accessToken}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to get pages: ${error.error?.message}`)
  }

  const data = await response.json()
  return data.data || []
}

// Get Instagram Business Account connected to a Page
export async function getInstagramAccount(
  pageId: string,
  pageAccessToken: string
): Promise<InstagramAccount | null> {
  const response = await fetch(
    `${FACEBOOK_API_BASE}/${pageId}?fields=instagram_business_account{id,username,profile_picture_url}&access_token=${pageAccessToken}`
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to get Instagram account: ${error.error?.message}`)
  }

  const data = await response.json()
  return data.instagram_business_account || null
}

// Post to Facebook Page
export async function postToPage({
  pageId,
  pageAccessToken,
  message,
  link,
  photoUrl,
}: {
  pageId: string
  pageAccessToken: string
  message: string
  link?: string
  photoUrl?: string
}): Promise<{ id: string }> {
  let endpoint = `${FACEBOOK_API_BASE}/${pageId}/feed`
  const body: any = {
    message,
    access_token: pageAccessToken,
  }

  if (link) {
    body.link = link
  }

  if (photoUrl) {
    endpoint = `${FACEBOOK_API_BASE}/${pageId}/photos`
    body.url = photoUrl
    body.caption = message
    delete body.message
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to post: ${error.error?.message}`)
  }

  return response.json()
}

// Post to Instagram (Container-based publishing)
export async function postToInstagram({
  instagramAccountId,
  accessToken,
  imageUrl,
  caption,
}: {
  instagramAccountId: string
  accessToken: string
  imageUrl: string
  caption: string
}): Promise<{ id: string }> {
  // Step 1: Create media container
  const containerResponse = await fetch(
    `${FACEBOOK_API_BASE}/${instagramAccountId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: accessToken,
      }),
    }
  )

  if (!containerResponse.ok) {
    const error = await containerResponse.json()
    throw new Error(`Failed to create media container: ${error.error?.message}`)
  }

  const { id: containerId } = await containerResponse.json()

  // Step 2: Publish the container
  const publishResponse = await fetch(
    `${FACEBOOK_API_BASE}/${instagramAccountId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    }
  )

  if (!publishResponse.ok) {
    const error = await publishResponse.json()
    throw new Error(`Failed to publish: ${error.error?.message}`)
  }

  return publishResponse.json()
}

// Delete a post
export async function deletePost({
  postId,
  accessToken,
}: {
  postId: string
  accessToken: string
}): Promise<void> {
  const response = await fetch(
    `${FACEBOOK_API_BASE}/${postId}?access_token=${accessToken}`,
    { method: 'DELETE' }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to delete post: ${error.error?.message}`)
  }
}

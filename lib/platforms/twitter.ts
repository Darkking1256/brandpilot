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

// Twitter v1.1 API endpoints
const TWITTER_V1_UPLOAD_BASE = 'https://upload.twitter.com/1.1'

// Generate OAuth 1.0a nonce
function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex')
}

// Generate OAuth 1.0a timestamp
function generateTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString()
}

// Percent encode for OAuth 1.0a
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
}

// Create OAuth 1.0a signature base string
function createSignatureBaseString(
  method: string,
  url: string,
  params: Record<string, string>
): string {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&')

  return `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(sortedParams)}`
}

// Create OAuth 1.0a signature
function createSignature(
  signatureBaseString: string,
  consumerSecret: string,
  tokenSecret: string = ''
): string {
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`
  return crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64')
}

// Create OAuth 1.0a authorization header
function createOAuth1Header({
  method,
  url,
  consumerKey,
  consumerSecret,
  accessToken,
  accessTokenSecret,
  additionalParams = {},
}: {
  method: string
  url: string
  consumerKey: string
  consumerSecret: string
  accessToken: string
  accessTokenSecret: string
  additionalParams?: Record<string, string>
}): string {
  const nonce = generateNonce()
  const timestamp = generateTimestamp()

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0',
    ...additionalParams,
  }

  // Create signature base string
  const signatureBaseString = createSignatureBaseString(method, url, oauthParams)
  
  // Create signature
  const signature = createSignature(signatureBaseString, consumerSecret, accessTokenSecret)
  oauthParams.oauth_signature = signature

  // Create header string
  const headerParams = Object.keys(oauthParams)
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(', ')

  return `OAuth ${headerParams}`
}

// Upload media using OAuth 1.0a (v1.1 API)
export async function uploadMedia({
  consumerKey,
  consumerSecret,
  accessToken,
  accessTokenSecret,
  mediaData,
  mediaType,
}: {
  consumerKey: string
  consumerSecret: string
  accessToken: string
  accessTokenSecret: string
  mediaData: Buffer
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'video/mp4'
}): Promise<string> {
  const mediaBase64 = mediaData.toString('base64')
  const mediaSize = mediaData.length

  // For images under 5MB, use simple upload
  // For larger files or videos, use chunked upload
  const isLargeFile = mediaSize > 5 * 1024 * 1024 || mediaType === 'video/mp4'

  if (isLargeFile) {
    return uploadMediaChunked({
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret,
      mediaData,
      mediaType,
    })
  }

  // Simple upload for small images
  const uploadUrl = `${TWITTER_V1_UPLOAD_BASE}/media/upload.json`
  
  // Build form data
  const formParams = new URLSearchParams()
  formParams.append('media_data', mediaBase64)

  const authHeader = createOAuth1Header({
    method: 'POST',
    url: uploadUrl,
    consumerKey,
    consumerSecret,
    accessToken,
    accessTokenSecret,
  })

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formParams.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to upload media: ${error}`)
  }

  const data = await response.json()
  return data.media_id_string
}

// Chunked upload for large files and videos
async function uploadMediaChunked({
  consumerKey,
  consumerSecret,
  accessToken,
  accessTokenSecret,
  mediaData,
  mediaType,
}: {
  consumerKey: string
  consumerSecret: string
  accessToken: string
  accessTokenSecret: string
  mediaData: Buffer
  mediaType: string
}): Promise<string> {
  const uploadUrl = `${TWITTER_V1_UPLOAD_BASE}/media/upload.json`
  const mediaCategory = mediaType === 'video/mp4' ? 'tweet_video' : 'tweet_image'
  const totalBytes = mediaData.length

  // Step 1: INIT
  const initParams = new URLSearchParams({
    command: 'INIT',
    total_bytes: totalBytes.toString(),
    media_type: mediaType,
    media_category: mediaCategory,
  })

  const initHeader = createOAuth1Header({
    method: 'POST',
    url: uploadUrl,
    consumerKey,
    consumerSecret,
    accessToken,
    accessTokenSecret,
  })

  const initResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': initHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: initParams.toString(),
  })

  if (!initResponse.ok) {
    const error = await initResponse.text()
    throw new Error(`Failed to init media upload: ${error}`)
  }

  const initData = await initResponse.json()
  const mediaId = initData.media_id_string

  // Step 2: APPEND (upload chunks)
  const chunkSize = 5 * 1024 * 1024 // 5MB chunks
  let segmentIndex = 0

  for (let offset = 0; offset < totalBytes; offset += chunkSize) {
    const chunk = mediaData.slice(offset, Math.min(offset + chunkSize, totalBytes))
    const chunkBase64 = chunk.toString('base64')

    const appendParams = new URLSearchParams({
      command: 'APPEND',
      media_id: mediaId,
      segment_index: segmentIndex.toString(),
      media_data: chunkBase64,
    })

    const appendHeader = createOAuth1Header({
      method: 'POST',
      url: uploadUrl,
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret,
    })

    const appendResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': appendHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: appendParams.toString(),
    })

    if (!appendResponse.ok) {
      const error = await appendResponse.text()
      throw new Error(`Failed to append media chunk: ${error}`)
    }

    segmentIndex++
  }

  // Step 3: FINALIZE
  const finalizeParams = new URLSearchParams({
    command: 'FINALIZE',
    media_id: mediaId,
  })

  const finalizeHeader = createOAuth1Header({
    method: 'POST',
    url: uploadUrl,
    consumerKey,
    consumerSecret,
    accessToken,
    accessTokenSecret,
  })

  const finalizeResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': finalizeHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: finalizeParams.toString(),
  })

  if (!finalizeResponse.ok) {
    const error = await finalizeResponse.text()
    throw new Error(`Failed to finalize media upload: ${error}`)
  }

  const finalizeData = await finalizeResponse.json()

  // For videos, we may need to check processing status
  if (finalizeData.processing_info) {
    await waitForMediaProcessing({
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret,
      mediaId,
    })
  }

  return mediaId
}

// Wait for media processing to complete (for videos)
async function waitForMediaProcessing({
  consumerKey,
  consumerSecret,
  accessToken,
  accessTokenSecret,
  mediaId,
}: {
  consumerKey: string
  consumerSecret: string
  accessToken: string
  accessTokenSecret: string
  mediaId: string
}): Promise<void> {
  const uploadUrl = `${TWITTER_V1_UPLOAD_BASE}/media/upload.json`
  const maxAttempts = 60 // Max 60 attempts (about 5 minutes with 5s intervals)
  let attempts = 0

  while (attempts < maxAttempts) {
    const statusParams = new URLSearchParams({
      command: 'STATUS',
      media_id: mediaId,
    })

    const statusUrl = `${uploadUrl}?${statusParams.toString()}`

    const statusHeader = createOAuth1Header({
      method: 'GET',
      url: uploadUrl,
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret,
      additionalParams: { command: 'STATUS', media_id: mediaId },
    })

    const statusResponse = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': statusHeader,
      },
    })

    if (!statusResponse.ok) {
      const error = await statusResponse.text()
      throw new Error(`Failed to check media status: ${error}`)
    }

    const statusData = await statusResponse.json()
    const processingInfo = statusData.processing_info

    if (!processingInfo) {
      // Processing complete
      return
    }

    if (processingInfo.state === 'succeeded') {
      return
    }

    if (processingInfo.state === 'failed') {
      throw new Error(`Media processing failed: ${processingInfo.error?.message || 'Unknown error'}`)
    }

    // Wait before checking again
    const waitSeconds = processingInfo.check_after_secs || 5
    await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000))
    attempts++
  }

  throw new Error('Media processing timed out')
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

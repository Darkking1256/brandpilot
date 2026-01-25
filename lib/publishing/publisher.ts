import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import * as twitter from '@/lib/platforms/twitter'
import * as linkedin from '@/lib/platforms/linkedin'
import * as facebook from '@/lib/platforms/facebook'
import * as tiktok from '@/lib/platforms/tiktok'
import * as youtube from '@/lib/platforms/youtube'
import { getOAuthConfig } from '@/lib/platforms'
import { Platform } from '@/types'

// Supabase admin client for cron jobs (lazy initialization to avoid build-time errors)
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase configuration is missing. NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.')
  }
  
  return createClient(supabaseUrl, serviceRoleKey)
}

// Decryption for tokens
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''

function decrypt(text: string): string {
  const parts = text.split(':')
  const iv = Buffer.from(parts.shift()!, 'hex')
  const encryptedText = Buffer.from(parts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

interface Post {
  id: string
  user_id: string
  content: string
  platform: Platform
  media_urls?: string[]
  scheduled_for: string
  status: string
}

interface PlatformConnection {
  platform: Platform
  platform_user_id: string
  access_token: string
  refresh_token?: string
  token_expires_at: string
  access_token_secret?: string // For OAuth 1.0a (Twitter media upload)
}

// Check if token is expired or about to expire
function isTokenExpired(expiresAt: string): boolean {
  const expiry = new Date(expiresAt)
  const now = new Date()
  // Consider expired if less than 5 minutes remaining
  return expiry.getTime() - now.getTime() < 5 * 60 * 1000
}

// Refresh access token if needed
async function refreshTokenIfNeeded(
  connection: PlatformConnection,
  userId: string
): Promise<string> {
  if (!isTokenExpired(connection.token_expires_at)) {
    return decrypt(connection.access_token)
  }

  if (!connection.refresh_token) {
    throw new Error(`Token expired and no refresh token available for ${connection.platform}`)
  }

  const config = getOAuthConfig(connection.platform)
  let newTokens: { access_token: string; refresh_token?: string; expires_in: number }

  switch (connection.platform) {
    case 'twitter':
      newTokens = await twitter.refreshAccessToken({
        refreshToken: decrypt(connection.refresh_token),
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      })
      break

    case 'linkedin':
      newTokens = await linkedin.refreshAccessToken({
        refreshToken: decrypt(connection.refresh_token),
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      })
      break

    case 'tiktok':
      newTokens = await tiktok.refreshAccessToken({
        refreshToken: decrypt(connection.refresh_token),
        clientKey: config.clientId,
        clientSecret: config.clientSecret,
      })
      break

    case 'youtube':
      newTokens = await youtube.refreshAccessToken({
        refreshToken: decrypt(connection.refresh_token),
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      })
      break

    default:
      throw new Error(`Token refresh not supported for ${connection.platform}`)
  }

  // Update stored token
  const encryptedToken = encryptToken(newTokens.access_token)
  const newExpiry = new Date(Date.now() + newTokens.expires_in * 1000)

  await getSupabaseAdmin()
    .from('platform_connections')
    .update({
      access_token: encryptedToken,
      refresh_token: newTokens.refresh_token ? encryptToken(newTokens.refresh_token) : connection.refresh_token,
      token_expires_at: newExpiry.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('platform', connection.platform)

  return newTokens.access_token
}

function encryptToken(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

// Publish to a specific platform
async function publishToPlatform(
  post: Post,
  connection: PlatformConnection,
  accessToken: string
): Promise<{ success: boolean; platformPostId?: string; error?: string }> {
  try {
    switch (post.platform) {
      case 'twitter': {
        let mediaIds: string[] | undefined

        // Handle media uploads if media_urls are present
        if (post.media_urls && post.media_urls.length > 0) {
          const config = getOAuthConfig('twitter')
          
          // For Twitter media upload, we need OAuth 1.0a credentials
          // These should be the consumer key/secret from Twitter Developer Portal
          const consumerKey = config.clientId
          const consumerSecret = config.clientSecret
          
          // We need the access token secret for OAuth 1.0a
          // This is stored separately from the OAuth 2.0 access token
          const accessTokenSecret = connection.access_token_secret 
            ? decrypt(connection.access_token_secret)
            : ''

          if (!accessTokenSecret) {
            console.warn('Twitter OAuth 1.0a access token secret not available, posting without media')
          } else {
            mediaIds = []
            
            for (const mediaUrl of post.media_urls.slice(0, 4)) { // Twitter max 4 images
              try {
                // Fetch the media from URL
                const mediaResponse = await fetch(mediaUrl)
                if (!mediaResponse.ok) {
                  console.error(`Failed to fetch media from ${mediaUrl}`)
                  continue
                }
                
                const mediaBuffer = Buffer.from(await mediaResponse.arrayBuffer())
                
                // Detect media type from URL or response
                const contentType = mediaResponse.headers.get('content-type') || 'image/jpeg'
                let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'video/mp4' = 'image/jpeg'
                
                if (contentType.includes('png')) mediaType = 'image/png'
                else if (contentType.includes('gif')) mediaType = 'image/gif'
                else if (contentType.includes('webp')) mediaType = 'image/webp'
                else if (contentType.includes('mp4') || contentType.includes('video')) mediaType = 'video/mp4'
                
                // Upload media using OAuth 1.0a
                const mediaId = await twitter.uploadMedia({
                  consumerKey,
                  consumerSecret,
                  accessToken,
                  accessTokenSecret,
                  mediaData: mediaBuffer,
                  mediaType,
                })
                
                mediaIds.push(mediaId)
              } catch (mediaError) {
                console.error('Twitter media upload error:', mediaError)
                // Continue without this media
              }
            }
            
            // If no media was successfully uploaded, set to undefined
            if (mediaIds.length === 0) {
              mediaIds = undefined
            }
          }
        }

        const result = await twitter.postTweet({
          accessToken,
          text: post.content,
          mediaIds,
        })
        return { success: true, platformPostId: result.id }
      }

      case 'linkedin': {
        const userUrn = await linkedin.getUserUrn(accessToken)
        const result = await linkedin.createPost({
          accessToken,
          authorUrn: userUrn,
          text: post.content,
        })
        return { success: true, platformPostId: result.id }
      }

      case 'facebook': {
        // Get user's pages and post to first one
        const pages = await facebook.getPages(accessToken)
        if (pages.length === 0) {
          return { success: false, error: 'No Facebook pages connected' }
        }
        const result = await facebook.postToPage({
          pageId: pages[0].id,
          pageAccessToken: pages[0].access_token,
          message: post.content,
        })
        return { success: true, platformPostId: result.id }
      }

      case 'instagram': {
        const pages = await facebook.getPages(accessToken)
        if (pages.length === 0) {
          return { success: false, error: 'No Facebook pages connected' }
        }
        const igAccount = await facebook.getInstagramAccount(pages[0].id, pages[0].access_token)
        if (!igAccount) {
          return { success: false, error: 'No Instagram account connected' }
        }
        if (!post.media_urls || post.media_urls.length === 0) {
          return { success: false, error: 'Instagram requires at least one image' }
        }
        const result = await facebook.postToInstagram({
          instagramAccountId: igAccount.id,
          accessToken: pages[0].access_token,
          imageUrl: post.media_urls[0],
          caption: post.content,
        })
        return { success: true, platformPostId: result.id }
      }

      case 'tiktok': {
        // TikTok requires video content
        if (!post.media_urls || post.media_urls.length === 0) {
          return { success: false, error: 'TikTok requires a video file' }
        }

        const tiktokVideoUrl = post.media_urls[0]
        
        try {
          // Fetch the video from URL
          const videoResponse = await fetch(tiktokVideoUrl)
          if (!videoResponse.ok) {
            return { success: false, error: 'Failed to fetch video for TikTok upload' }
          }
          
          const videoBuffer = Buffer.from(await videoResponse.arrayBuffer())
          const videoSize = videoBuffer.length
          const chunkSize = 10 * 1024 * 1024 // 10MB chunks
          const totalChunkCount = Math.ceil(videoSize / chunkSize)
          
          // Initialize video upload
          const initResult = await tiktok.initVideoUpload({
            accessToken,
            sourceType: 'FILE_UPLOAD',
            videoSize,
            chunkSize,
            totalChunkCount,
          })
          
          // Upload video in chunks
          for (let i = 0; i < totalChunkCount; i++) {
            const startByte = i * chunkSize
            const endByte = Math.min(startByte + chunkSize - 1, videoSize - 1)
            const chunk = videoBuffer.slice(startByte, endByte + 1)
            
            await tiktok.uploadVideoChunk({
              uploadUrl: initResult.upload_url,
              videoData: chunk,
              chunkIndex: i,
              startByte,
              endByte,
              totalSize: videoSize,
            })
          }
          
          // Publish the video
          const publishResult = await tiktok.publishVideo({
            accessToken,
            publishId: initResult.publish_id,
            title: post.content.slice(0, 150), // TikTok title limit
            privacyLevel: 'PUBLIC_TO_EVERYONE',
          })
          
          // Poll for publish status (with timeout)
          let status = await tiktok.getPublishStatus({
            accessToken,
            publishId: publishResult.publish_id,
          })
          
          let attempts = 0
          const maxAttempts = 30 // Max 30 attempts, 2s each = 60s timeout
          
          while (
            status.status !== 'PUBLISH_COMPLETE' && 
            status.status !== 'FAILED' && 
            attempts < maxAttempts
          ) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            status = await tiktok.getPublishStatus({
              accessToken,
              publishId: publishResult.publish_id,
            })
            attempts++
          }
          
          if (status.status === 'PUBLISH_COMPLETE') {
            return { success: true, platformPostId: status.published_video_id }
          } else if (status.status === 'FAILED') {
            return { success: false, error: `TikTok publish failed: ${status.fail_reason}` }
          } else {
            // Still processing - mark as success, video will appear eventually
            return { success: true, platformPostId: publishResult.publish_id }
          }
        } catch (error) {
          console.error('TikTok upload error:', error)
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'TikTok upload failed' 
          }
        }
      }

      case 'youtube': {
        // YouTube requires video content
        if (!post.media_urls || post.media_urls.length === 0) {
          return { success: false, error: 'YouTube requires a video file' }
        }

        const youtubeVideoUrl = post.media_urls[0]
        
        try {
          // Fetch the video from URL
          const videoResponse = await fetch(youtubeVideoUrl)
          if (!videoResponse.ok) {
            return { success: false, error: 'Failed to fetch video for YouTube upload' }
          }
          
          const videoBuffer = Buffer.from(await videoResponse.arrayBuffer())
          
          // Extract title and description from content
          // Format: First line is title, rest is description
          const contentLines = post.content.split('\n')
          const title = contentLines[0].slice(0, 100) || 'Video' // YouTube title max 100 chars
          const description = contentLines.slice(1).join('\n') || post.content
          
          // Extract hashtags as tags
          const hashtagRegex = /#(\w+)/g
          const tags: string[] = []
          let match
          while ((match = hashtagRegex.exec(post.content)) !== null) {
            tags.push(match[1])
          }
          
          // Initialize resumable upload
          const uploadUrl = await youtube.initVideoUpload({
            accessToken,
            title,
            description,
            privacyStatus: 'public',
            tags: tags.length > 0 ? tags : undefined,
          })
          
          // Upload the video data
          const uploadResult = await youtube.uploadVideoData({
            uploadUrl,
            videoData: videoBuffer,
            contentType: 'video/mp4',
          })
          
          return { success: true, platformPostId: uploadResult.id }
        } catch (error) {
          console.error('YouTube upload error:', error)
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'YouTube upload failed' 
          }
        }
      }

      default:
        return { success: false, error: `Platform ${post.platform} not supported` }
    }
  } catch (error) {
    console.error(`Error publishing to ${post.platform}:`, error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Main function to process scheduled posts
export async function processScheduledPosts(): Promise<{
  processed: number
  successful: number
  failed: number
  errors: string[]
}> {
  const results = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [] as string[],
  }

  try {
    // Get posts that are scheduled and due for publishing
    const now = new Date().toISOString()
    
    const { data: posts, error: fetchError } = await getSupabaseAdmin()
      .from('posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(100) // Process max 100 posts per run

    if (fetchError) {
      throw new Error(`Failed to fetch posts: ${fetchError.message}`)
    }

    if (!posts || posts.length === 0) {
      return results
    }

    for (const post of posts) {
      results.processed++

      try {
        // Get platform connection for this user
        const { data: connection, error: connError } = await getSupabaseAdmin()
          .from('platform_connections')
          .select('*')
          .eq('user_id', post.user_id)
          .eq('platform', post.platform)
          .eq('is_active', true)
          .single()

        if (connError || !connection) {
          throw new Error(`No active ${post.platform} connection for user`)
        }

        // Refresh token if needed and get access token
        const accessToken = await refreshTokenIfNeeded(connection, post.user_id)

        // Publish the post
        const publishResult = await publishToPlatform(post, connection, accessToken)

        if (publishResult.success) {
          // Update post status to published
          await getSupabaseAdmin()
            .from('posts')
            .update({
              status: 'published',
              published_at: new Date().toISOString(),
              platform_post_id: publishResult.platformPostId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', post.id)

          results.successful++
        } else {
          throw new Error(publishResult.error || 'Publishing failed')
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results.errors.push(`Post ${post.id}: ${errorMsg}`)
        results.failed++

        // Update post status to failed
        await getSupabaseAdmin()
          .from('posts')
          .update({
            status: 'failed',
            error_message: errorMsg,
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id)
      }
    }

    return results
  } catch (error) {
    console.error('Error processing scheduled posts:', error)
    results.errors.push(error instanceof Error ? error.message : 'Unknown error')
    return results
  }
}

// Get publishing queue status
export async function getQueueStatus(): Promise<{
  pending: number
  scheduled: number
  published_today: number
  failed_today: number
}> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const supabase = getSupabaseAdmin()
  const [pending, scheduled, publishedToday, failedToday] = await Promise.all([
    supabase
      .from('posts')
      .select('id', { count: 'exact' })
      .eq('status', 'draft'),
    supabase
      .from('posts')
      .select('id', { count: 'exact' })
      .eq('status', 'scheduled'),
    supabase
      .from('posts')
      .select('id', { count: 'exact' })
      .eq('status', 'published')
      .gte('published_at', today.toISOString()),
    supabase
      .from('posts')
      .select('id', { count: 'exact' })
      .eq('status', 'failed')
      .gte('updated_at', today.toISOString()),
  ])

  return {
    pending: pending.count || 0,
    scheduled: scheduled.count || 0,
    published_today: publishedToday.count || 0,
    failed_today: failedToday.count || 0,
  }
}


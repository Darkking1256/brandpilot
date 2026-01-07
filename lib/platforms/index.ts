// Re-export all platform modules
export * as twitter from './twitter'
export * as linkedin from './linkedin'
export * as facebook from './facebook'
export * as tiktok from './tiktok'
export * as youtube from './youtube'

import { Platform } from '@/types'

// Platform configuration
export const PLATFORM_CONFIG: Record<Platform, {
  name: string
  color: string
  requiresOAuth: boolean
  supportsImages: boolean
  supportsVideos: boolean
  maxCharacters?: number
}> = {
  twitter: {
    name: 'Twitter/X',
    color: '#000000',
    requiresOAuth: true,
    supportsImages: true,
    supportsVideos: true,
    maxCharacters: 280,
  },
  linkedin: {
    name: 'LinkedIn',
    color: '#0A66C2',
    requiresOAuth: true,
    supportsImages: true,
    supportsVideos: true,
    maxCharacters: 3000,
  },
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    requiresOAuth: true,
    supportsImages: true,
    supportsVideos: true,
    maxCharacters: 63206,
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    requiresOAuth: true,
    supportsImages: true,
    supportsVideos: true,
    maxCharacters: 2200,
  },
  tiktok: {
    name: 'TikTok',
    color: '#000000',
    requiresOAuth: true,
    supportsImages: false,
    supportsVideos: true,
    maxCharacters: 2200,
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    requiresOAuth: true,
    supportsImages: false,
    supportsVideos: true,
    maxCharacters: 5000,
  },
}

// Get OAuth configuration for a platform
export function getOAuthConfig(platform: Platform) {
  switch (platform) {
    case 'twitter':
      return {
        clientId: process.env.TWITTER_CLIENT_ID!,
        clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      }
    case 'linkedin':
      return {
        clientId: process.env.LINKEDIN_CLIENT_ID!,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      }
    case 'facebook':
    case 'instagram':
      return {
        clientId: process.env.FACEBOOK_APP_ID!,
        clientSecret: process.env.FACEBOOK_APP_SECRET!,
      }
    case 'tiktok':
      return {
        clientId: process.env.TIKTOK_CLIENT_KEY!,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
      }
    case 'youtube':
      return {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }
    default:
      throw new Error(`Unknown platform: ${platform}`)
  }
}


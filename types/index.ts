export interface User {
  id: string
  email: string
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  platform: Platform
  scheduled_at: string
  status: PostStatus
  created_at: string
  updated_at: string
}

export type Platform = "twitter" | "linkedin" | "facebook" | "instagram" | "tiktok" | "youtube"

export type PostStatus = "draft" | "scheduled" | "published" | "failed"

export interface Campaign {
  id: string
  user_id: string
  name: string
  description?: string
  status: CampaignStatus
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
}

export type CampaignStatus = "draft" | "active" | "paused" | "completed"

export interface Ad {
  id: string
  user_id: string
  campaign_id?: string
  platform: Platform
  name: string
  status: AdStatus
  budget?: number
  created_at: string
  updated_at: string
}

export type AdStatus = "draft" | "active" | "paused" | "completed"


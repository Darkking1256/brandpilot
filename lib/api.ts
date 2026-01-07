// API utility functions for making requests to our API routes

export interface Post {
  id: string
  content: string
  platform: string
  scheduledDate: string
  scheduledTime: string
  status: "draft" | "scheduled" | "published" | "failed"
  imageUrl?: string
  linkUrl?: string
  createdAt: string
}

export interface Campaign {
  id: string
  name: string
  description?: string
  platform: string
  objective: string
  budget?: number
  startDate: string
  endDate?: string
  status: "draft" | "active" | "paused" | "completed"
  createdAt: string
}

export interface Ad {
  id: string
  name: string
  description?: string
  platform: string
  ad_type: "image" | "video" | "carousel" | "story" | "sponsored"
  objective: "awareness" | "traffic" | "engagement" | "conversions" | "leads" | "sales"
  budget: number
  daily_budget?: number
  bid_strategy?: "lowest_cost" | "cost_cap" | "bid_cap" | "target_cost"
  target_audience?: Record<string, any>
  creative_url?: string
  creative_type?: "image" | "video" | "carousel"
  landing_page_url?: string
  start_date: string
  end_date?: string
  status: "draft" | "active" | "paused" | "completed" | "archived"
  // Performance metrics
  impressions?: number
  clicks?: number
  conversions?: number
  spend?: number
  ctr?: number
  cpc?: number
  cpm?: number
  cpa?: number
  roas?: number
  created_at: string
  updated_at: string
}

// Posts API
export async function getPosts(): Promise<Post[]> {
  const response = await fetch("/api/posts")
  if (!response.ok) {
    throw new Error("Failed to fetch posts")
  }
  return response.json()
}

export async function getPost(id: string): Promise<Post> {
  const response = await fetch(`/api/posts/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch post")
  }
  return response.json()
}

export async function createPost(data: {
  content: string
  platform: string
  scheduledDate: string
  scheduledTime: string
  imageUrl?: string
  linkUrl?: string
}): Promise<Post> {
  const response = await fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create post")
  }
  return response.json()
}

export async function updatePost(
  id: string,
  data: {
    content?: string
    platform?: string
    scheduledDate?: string
    scheduledTime?: string
    imageUrl?: string
    linkUrl?: string
    status?: string
  }
): Promise<Post> {
  const response = await fetch(`/api/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update post")
  }
  return response.json()
}

export async function deletePost(id: string): Promise<void> {
  const response = await fetch(`/api/posts/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete post")
  }
}

// Campaigns API
export async function getCampaigns(): Promise<Campaign[]> {
  const response = await fetch("/api/campaigns")
  if (!response.ok) {
    throw new Error("Failed to fetch campaigns")
  }
  return response.json()
}

export async function getCampaign(id: string): Promise<Campaign> {
  const response = await fetch(`/api/campaigns/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch campaign")
  }
  return response.json()
}

export async function createCampaign(data: {
  name: string
  description?: string
  platform: string
  objective: string
  budget?: number
  startDate: string
  endDate?: string
}): Promise<Campaign> {
  const response = await fetch("/api/campaigns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create campaign")
  }
  return response.json()
}

export async function updateCampaign(
  id: string,
  data: {
    name?: string
    description?: string
    platform?: string
    objective?: string
    budget?: number
    startDate?: string
    endDate?: string
    status?: string
  }
): Promise<Campaign> {
  const response = await fetch(`/api/campaigns/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update campaign")
  }
  return response.json()
}

export async function deleteCampaign(id: string): Promise<void> {
  const response = await fetch(`/api/campaigns/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete campaign")
  }
}

// Ads API
export async function getAds(): Promise<Ad[]> {
  const response = await fetch("/api/ads")
  if (!response.ok) {
    throw new Error("Failed to fetch ads")
  }
  const data = await response.json()
  return data.ads
}

export async function getAd(id: string): Promise<Ad> {
  const response = await fetch(`/api/ads/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch ad")
  }
  const data = await response.json()
  return data.ad
}

export async function createAd(data: {
  name: string
  description?: string
  platform: string
  ad_type: string
  objective: string
  budget: number
  daily_budget?: number
  bid_strategy?: string
  target_audience?: Record<string, any>
  creative_url?: string
  creative_type?: string
  landing_page_url?: string
  start_date: string
  end_date?: string
  status?: string
}): Promise<Ad> {
  const response = await fetch("/api/ads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create ad")
  }
  const result = await response.json()
  return result.ad
}

export async function updateAd(
  id: string,
  data: Partial<{
    name: string
    description: string
    platform: string
    ad_type: string
    objective: string
    budget: number
    daily_budget: number
    bid_strategy: string
    target_audience: Record<string, any>
    creative_url: string
    creative_type: string
    landing_page_url: string
    start_date: string
    end_date: string
    status: string
    impressions: number
    clicks: number
    conversions: number
    spend: number
  }>
): Promise<Ad> {
  const response = await fetch(`/api/ads/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update ad")
  }
  const result = await response.json()
  return result.ad
}

export async function deleteAd(id: string): Promise<void> {
  const response = await fetch(`/api/ads/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error("Failed to delete ad")
  }
}


"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface Notification {
  id: string
  type: "post" | "campaign"
  action: "created" | "updated" | "deleted" | "published" | "status_changed"
  title: string
  message: string
  timestamp: Date
  data?: any
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()
  const supabase = createClient()

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 50)) // Keep last 50

    // Show toast notification
    toast({
      variant: notification.action === "deleted" ? "destructive" : "success",
      title: notification.title,
      description: notification.message,
    })
  }, [toast])

  useEffect(() => {
    // Subscribe to posts changes
    const postsChannel = supabase
      .channel("posts-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          const post: any = payload.new || payload.old
          const postData: any = payload.new || payload.old

          if (payload.eventType === "INSERT") {
            addNotification({
              id: `post-${post.id}-${Date.now()}`,
              type: "post",
              action: "created",
              title: "New Post Created",
              message: `Post scheduled for ${postData.platform}`,
              timestamp: new Date(),
              data: postData,
            })
          } else if (payload.eventType === "UPDATE") {
            const oldStatus = payload.old.status
            const newStatus = payload.new.status

            if (oldStatus !== newStatus) {
              if (newStatus === "published") {
                addNotification({
                  id: `post-${post.id}-${Date.now()}`,
                  type: "post",
                  action: "published",
                  title: "Post Published! 🎉",
                  message: `Your post on ${postData.platform} has been published`,
                  timestamp: new Date(),
                  data: postData,
                })
              } else {
                addNotification({
                  id: `post-${post.id}-${Date.now()}`,
                  type: "post",
                  action: "status_changed",
                  title: "Post Status Updated",
                  message: `Post status changed to ${newStatus}`,
                  timestamp: new Date(),
                  data: postData,
                })
              }
            } else {
              addNotification({
                id: `post-${post.id}-${Date.now()}`,
                type: "post",
                action: "updated",
                title: "Post Updated",
                message: `Post on ${postData.platform} has been updated`,
                timestamp: new Date(),
                data: postData,
              })
            }
          } else if (payload.eventType === "DELETE") {
            addNotification({
              id: `post-${post.id}-${Date.now()}`,
              type: "post",
              action: "deleted",
              title: "Post Deleted",
              message: "A post has been deleted",
              timestamp: new Date(),
              data: postData,
            })
          }
        }
      )
      .subscribe()

    // Subscribe to campaigns changes
    const campaignsChannel = supabase
      .channel("campaigns-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaigns",
        },
        (payload) => {
          const campaign: any = payload.new || payload.old
          const campaignData: any = payload.new || payload.old

          if (payload.eventType === "INSERT") {
            addNotification({
              id: `campaign-${campaign.id}-${Date.now()}`,
              type: "campaign",
              action: "created",
              title: "New Campaign Created",
              message: `"${campaignData.name}" campaign has been created`,
              timestamp: new Date(),
              data: campaignData,
            })
          } else if (payload.eventType === "UPDATE") {
            const oldStatus = payload.old.status
            const newStatus = payload.new.status

            if (oldStatus !== newStatus) {
              addNotification({
                id: `campaign-${campaign.id}-${Date.now()}`,
                type: "campaign",
                action: "status_changed",
                title: "Campaign Status Updated",
                message: `"${campaignData.name}" is now ${newStatus}`,
                timestamp: new Date(),
                data: campaignData,
              })
            } else {
              addNotification({
                id: `campaign-${campaign.id}-${Date.now()}`,
                type: "campaign",
                action: "updated",
                title: "Campaign Updated",
                message: `"${campaignData.name}" has been updated`,
                timestamp: new Date(),
                data: campaignData,
              })
            }
          } else if (payload.eventType === "DELETE") {
            addNotification({
              id: `campaign-${campaign.id}-${Date.now()}`,
              type: "campaign",
              action: "deleted",
              title: "Campaign Deleted",
              message: `"${campaignData.name}" has been deleted`,
              timestamp: new Date(),
              data: campaignData,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(postsChannel)
      supabase.removeChannel(campaignsChannel)
    }
  }, [supabase, addNotification])

  return { notifications, clearNotifications: () => setNotifications([]) }
}


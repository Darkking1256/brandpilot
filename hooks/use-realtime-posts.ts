"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Post } from "@/components/posts-table"

export function useRealtimePosts(initialPosts: Post[] = []) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const supabase = createClient()

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  useEffect(() => {
    // Subscribe to changes in posts table
    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "posts",
        },
        (payload) => {
          console.log("Realtime post change:", payload)

          if (payload.eventType === "INSERT") {
            const newPost = payload.new as any
            const transformedPost: Post = {
              id: newPost.id,
              content: newPost.content,
              platform: newPost.platform,
              scheduledDate: newPost.scheduled_date,
              scheduledTime: newPost.scheduled_time,
              status: newPost.status,
              imageUrl: newPost.image_url || undefined,
              linkUrl: newPost.link_url || undefined,
              createdAt: newPost.created_at,
            }
            setPosts((prev) => [transformedPost, ...prev])
          } else if (payload.eventType === "UPDATE") {
            const updatedPost = payload.new as any
            const transformedPost: Post = {
              id: updatedPost.id,
              content: updatedPost.content,
              platform: updatedPost.platform,
              scheduledDate: updatedPost.scheduled_date,
              scheduledTime: updatedPost.scheduled_time,
              status: updatedPost.status,
              imageUrl: updatedPost.image_url || undefined,
              linkUrl: updatedPost.link_url || undefined,
              createdAt: updatedPost.created_at,
            }
            setPosts((prev) =>
              prev.map((post) => (post.id === updatedPost.id ? transformedPost : post))
            )
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id
            setPosts((prev) => prev.filter((post) => post.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return posts
}


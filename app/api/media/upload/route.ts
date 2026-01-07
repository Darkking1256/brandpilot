import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const supabase = await createClient()

    const uploadedAssets = []

    for (const file of files) {
      // Validate file size (max 10MB for images, 100MB for videos)
      const isVideo = file.type.startsWith("video/")
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB for videos, 10MB for images
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds ${isVideo ? "100MB" : "10MB"} limit` },
          { status: 400 }
        )
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "video/quicktime"]
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} not supported` },
          { status: 400 }
        )
      }

      // Determine file type
      let fileType: "image" | "video" | "document" = "document"
      if (file.type.startsWith("image/")) {
        fileType = "image"
      } else if (file.type.startsWith("video/")) {
        fileType = "video"
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg")
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/${fileType}s/${fileName}`
      
      // Try to upload to Supabase Storage first
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      let fileUrl: string
      
      // Try Supabase Storage upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        })
      
      if (uploadError) {
        // If storage fails (bucket doesn't exist, etc.), fall back to base64 for images only
        // Videos are too large for base64
        if (isVideo) {
          console.error("Storage upload failed for video:", uploadError)
          return NextResponse.json(
            { error: "Video upload failed. Please configure Supabase Storage or use a video URL instead." },
            { status: 500 }
          )
        }
        
        console.warn("Storage upload failed, using base64 fallback:", uploadError)
        const base64 = buffer.toString("base64")
        fileUrl = `data:${file.type};base64,${base64}`
      } else {
        // Get public URL from Supabase Storage
        const { data: urlData } = supabase.storage
          .from("media")
          .getPublicUrl(filePath)
        fileUrl = urlData.publicUrl
      }

      // Get image dimensions if it's an image (only for base64)
      let width: number | null = null
      let height: number | null = null

      // Save to database
      const DISABLE_AUTH = process.env.DISABLE_AUTH === "true" || process.env.NEXT_PUBLIC_DISABLE_AUTH === "true"
      
      const { data: asset, error: dbError } = await supabase
        .from("media_assets")
        .insert({
          user_id: DISABLE_AUTH ? null : user.id,
          file_name: file.name,
          file_url: fileUrl,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.type,
          width,
          height,
          tags: [],
        })
        .select()
        .single()

      if (dbError) {
        console.error("Database error:", dbError)
        // Even if database insert fails, return the URL so the caller can use it
        uploadedAssets.push({
          file_url: fileUrl,
          file_name: file.name,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.type,
        })
      } else {
        uploadedAssets.push(asset)
      }
    }

    return NextResponse.json({ assets: uploadedAssets })
  } catch (error) {
    console.error("Error uploading media:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload media" },
      { status: 500 }
    )
  }
}


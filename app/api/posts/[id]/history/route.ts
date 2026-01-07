import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("post_versions")
      .select("*")
      .eq("post_id", params.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Also get the current post as the latest version
    const { data: currentPost } = await supabase
      .from("posts")
      .select("id, content, image_url, link_url, updated_at")
      .eq("id", params.id)
      .single()

    const versions = (data || []).map((version, index) => ({
      ...version,
      version_number: (data?.length || 0) - index,
      changes: index === 0 ? "Current version" : `Version ${(data?.length || 0) - index}`,
    }))

    // Add current post as the latest version if it exists
    if (currentPost) {
      versions.unshift({
        id: currentPost.id,
        post_id: params.id,
        content: currentPost.content,
        image_url: currentPost.image_url,
        link_url: currentPost.link_url,
        version_number: (data?.length || 0) + 1,
        created_at: currentPost.updated_at || new Date().toISOString(),
        created_by: null,
        changes: "Current version",
      })
    }

    return NextResponse.json({ versions })
  } catch (error: any) {
    console.error("Error fetching post history:", error)
    return NextResponse.json(
      { error: "Failed to fetch history", details: error.message },
      { status: 500 }
    )
  }
}


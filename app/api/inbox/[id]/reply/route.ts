import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const supabase = await createClient()
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Reply content is required" }, { status: 400 })
    }

    // Get original message (verify it belongs to the user)
    const { data: originalMessage, error: fetchError } = await supabase
      .from("inbox_messages")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !originalMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Create reply message
    const { data: replyMessage, error: createError } = await supabase
      .from("inbox_messages")
      .insert({
        user_id: user.id,
        platform: originalMessage.platform,
        message_type: "reply",
        platform_message_id: `reply_${Date.now()}`,
        platform_post_id: originalMessage.platform_post_id,
        sender_id: user.id,
        sender_username: "You",
        content,
        thread_id: originalMessage.thread_id,
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    // Mark original as responded
    await supabase
      .from("inbox_messages")
      .update({
        is_read: true,
        requires_response: false,
        responded_at: new Date().toISOString(),
        response_id: replyMessage.id,
      })
      .eq("id", params.id)

    // TODO: Actually send reply via platform API
    // await sendPlatformReply(originalMessage.platform, originalMessage.platform_message_id, content)

    return NextResponse.json({ reply: replyMessage }, { status: 201 })
  } catch (error: any) {
    console.error("Error replying to message:", error)
    return NextResponse.json(
      { error: "Failed to send reply", details: error.message },
      { status: 500 }
    )
  }
}


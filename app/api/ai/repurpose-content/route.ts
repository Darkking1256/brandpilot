import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import Groq from "groq-sdk"

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

// Use Groq by default (faster and cheaper), fallback to OpenAI
const getAIClient = () => {
  if (groq) return { type: "groq" as const, client: groq }
  if (openai) return { type: "openai" as const, client: openai }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, targetPlatforms, sourcePlatform, preserveTone } = body

    if (!content || !targetPlatforms || !Array.isArray(targetPlatforms) || targetPlatforms.length === 0) {
      return NextResponse.json(
        { error: "Content and target platforms are required" },
        { status: 400 }
      )
    }

    const aiClient = getAIClient()
    if (!aiClient) {
      return NextResponse.json(
        { error: "AI service not configured. Please add OPENAI_API_KEY or GROQ_API_KEY to your environment variables." },
        { status: 500 }
      )
    }

    // Platform-specific guidelines for repurposing
    const platformGuidelines: Record<string, string> = {
      twitter: "Adapt this content for Twitter/X (max 280 characters). Make it concise, engaging, and use hashtags strategically. Be conversational and timely.",
      linkedin: "Adapt this content for LinkedIn (200-300 words). Make it professional, value-focused, and thought-leadership oriented. Use a professional tone.",
      facebook: "Adapt this content for Facebook (100-200 words). Make it friendly, conversational, and engaging. Encourage interaction with questions or calls-to-action.",
      instagram: "Adapt this content for Instagram (100-200 words). Make it creative, visually-oriented, use emojis strategically, and include relevant hashtags.",
      tiktok: "Adapt this content for TikTok (50-100 words). Make it trendy, use popular phrases, include relevant hashtags, and keep it fun and engaging.",
      youtube: "Adapt this content for YouTube (200-500 words). Make it engaging for video descriptions or community posts. Include relevant keywords, encourage engagement (likes, comments, subscriptions), and use a conversational tone suitable for video content.",
    }

    const sourcePlatformGuidelines: Record<string, string> = {
      twitter: "This content is originally from Twitter/X. Adapt it while maintaining the core message.",
      linkedin: "This content is originally from LinkedIn. Adapt it while maintaining the professional insights.",
      facebook: "This content is originally from Facebook. Adapt it while maintaining the conversational tone.",
      instagram: "This content is originally from Instagram. Adapt it while maintaining the visual storytelling elements.",
      tiktok: "This content is originally from TikTok. Adapt it while maintaining the engaging, trend-focused elements.",
      other: "This is original content. Adapt it appropriately for each platform.",
    }

    const sourceGuideline = sourcePlatformGuidelines[sourcePlatform || "other"] || ""

    // Repurpose for each target platform
    const repurposedContent: Record<string, string> = {}

    for (const platform of targetPlatforms) {
      const systemPrompt = `You are an expert social media content repurposing specialist. Your task is to adapt existing content for different social media platforms while maintaining the core message and intent.

${sourceGuideline}
${platformGuidelines[platform] || `Adapt this content for ${platform}.`}
${preserveTone ? "Maintain the original tone and style as much as possible." : "Feel free to adjust the tone to match the platform's best practices."}

Generate the repurposed content that:
- Maintains the core message and key points
- Fits the platform's format and best practices
- Is engaging and appropriate for the target audience
- Uses platform-appropriate formatting (hashtags, mentions, etc.)`

      const userPrompt = `Repurpose the following content for ${platform}:\n\n${content}`

      let generatedContent = ""

      if (aiClient.type === "groq") {
        const completion = await groq!.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          model: "llama-3.1-70b-versatile",
          temperature: 0.7,
          max_tokens: 500,
        })
        generatedContent = completion.choices[0]?.message?.content || ""
      } else {
        const completion = await openai!.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          model: "gpt-4o-mini",
          temperature: 0.7,
          max_tokens: 500,
        })
        generatedContent = completion.choices[0]?.message?.content || ""
      }

      repurposedContent[platform] = generatedContent.trim()
    }

    return NextResponse.json({
      repurposed: repurposedContent,
      original: content,
      sourcePlatform: sourcePlatform || "other",
    })
  } catch (error: any) {
    console.error("AI repurposing error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to repurpose content" },
      { status: 500 }
    )
  }
}


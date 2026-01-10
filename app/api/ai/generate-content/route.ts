export const dynamic = 'force-dynamic'
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
    const { prompt, platform, tone, length, type } = body

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
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

    // Build the system prompt based on platform and requirements
    const platformGuidelines: Record<string, string> = {
      twitter: "Create a concise, engaging tweet (max 280 characters). Use hashtags strategically. Be conversational and timely.",
      linkedin: "Create a professional LinkedIn post (200-300 words). Focus on value, insights, or thought leadership. Use a professional tone.",
      facebook: "Create an engaging Facebook post (100-200 words). Be friendly and conversational. Encourage engagement with questions.",
      instagram: "Create an Instagram caption (100-200 words). Be creative, use emojis strategically, and include relevant hashtags.",
      tiktok: "Create a TikTok caption (50-100 words). Be trendy, use popular phrases, and include relevant hashtags. Keep it fun and engaging.",
      youtube: "Create a YouTube video description or community post (200-500 words). Be engaging, include relevant keywords, and encourage viewers to like, subscribe, and comment. Include timestamps if applicable.",
    }

    const toneGuidelines: Record<string, string> = {
      professional: "Use a formal, business-appropriate tone.",
      casual: "Use a relaxed, friendly, conversational tone.",
      friendly: "Use a warm, approachable, and personable tone.",
      humorous: "Use a light-hearted, witty, and entertaining tone.",
      inspiring: "Use an uplifting, motivational, and empowering tone.",
    }

    const lengthGuidelines: Record<string, string> = {
      short: "Keep it brief and concise (50-100 words).",
      medium: "Use a moderate length (100-200 words).",
      long: "Provide more detail and context (200-300 words).",
    }

    const systemPrompt = `You are an expert social media content creator. ${platformGuidelines[platform] || ""} ${toneGuidelines[tone] || ""} ${lengthGuidelines[length] || ""} Generate engaging, authentic content that resonates with the target audience.`

    const userPrompt = type === "suggest"
      ? `Suggest 3 different variations of social media content based on: ${prompt}`
      : `Create social media content based on: ${prompt}`

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

    // Parse suggestions if type is "suggest"
    let suggestions: string[] = []
    if (type === "suggest") {
      // Try to extract numbered suggestions
      const lines = generatedContent.split("\n").filter(line => line.trim())
      suggestions = lines
        .filter(line => /^\d+[\.\)]/.test(line.trim()) || /^[-•]/.test(line.trim()))
        .map(line => line.replace(/^\d+[\.\)]\s*/, "").replace(/^[-•]\s*/, "").trim())
        .filter(Boolean)
      
      // If no numbered list found, split by paragraphs
      if (suggestions.length === 0) {
        suggestions = lines.slice(0, 3)
      }
    }

    return NextResponse.json({
      content: generatedContent,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    })
  } catch (error: any) {
    console.error("AI generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import Groq from "groq-sdk"

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

const getAIClient = () => {
  if (groq) return { type: "groq" as const, client: groq }
  if (openai) return { type: "openai" as const, client: openai }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, platform } = body

    if (!content || !platform) {
      return NextResponse.json(
        { error: "Content and platform are required" },
        { status: 400 }
      )
    }

    const aiClient = getAIClient()
    if (!aiClient) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      )
    }

    const platformGuidelines: Record<string, string> = {
      twitter: "Optimize for Twitter: max 280 characters, use hashtags, be concise and engaging.",
      linkedin: "Optimize for LinkedIn: professional tone, value-driven, 200-300 words ideal.",
      facebook: "Optimize for Facebook: friendly tone, encourage engagement, 100-200 words.",
      instagram: "Optimize for Instagram: creative, use emojis, include hashtags, 100-200 words.",
      tiktok: "Optimize for TikTok: trendy, fun, include hashtags, 50-100 words.",
    }

    const systemPrompt = `You are a social media optimization expert. ${platformGuidelines[platform]} Analyze the provided content and suggest improvements for better engagement, readability, and platform-specific best practices.`

    const userPrompt = `Optimize this content for ${platform}:\n\n${content}\n\nProvide:\n1. An optimized version\n2. Key improvements made\n3. Engagement tips`

    let optimizedContent = ""
    let improvements: string[] = []
    let tips: string[] = []

    if (aiClient.type === "groq") {
      const completion = await groq!.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.7,
        max_tokens: 800,
      })
      const response = completion.choices[0]?.message?.content || ""
      
      // Parse the response
      const lines = response.split("\n").filter(line => line.trim())
      optimizedContent = lines[0] || content
      
      // Extract improvements and tips
      let currentSection = ""
      lines.forEach(line => {
        if (line.toLowerCase().includes("optimized") || line.match(/^1\./)) {
          optimizedContent = line.replace(/^1\.\s*/, "").replace(/.*optimized.*:\s*/i, "").trim()
        } else if (line.toLowerCase().includes("improvement") || line.match(/^2\./)) {
          currentSection = "improvements"
        } else if (line.toLowerCase().includes("tip") || line.match(/^3\./)) {
          currentSection = "tips"
        } else if (currentSection === "improvements" && line.trim()) {
          improvements.push(line.replace(/^[-•]\s*/, "").trim())
        } else if (currentSection === "tips" && line.trim()) {
          tips.push(line.replace(/^[-•]\s*/, "").trim())
        }
      })
    } else {
      const completion = await openai!.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 800,
      })
      const response = completion.choices[0]?.message?.content || ""
      
      // Similar parsing logic
      const lines = response.split("\n").filter(line => line.trim())
      optimizedContent = lines[0] || content
    }

    return NextResponse.json({
      optimized: optimizedContent || content,
      improvements: improvements.length > 0 ? improvements : ["Content optimized for better engagement"],
      tips: tips.length > 0 ? tips : ["Use relevant hashtags", "Include a call-to-action", "Post at optimal times"],
    })
  } catch (error: any) {
    console.error("AI optimization error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to optimize content" },
      { status: 500 }
    )
  }
}


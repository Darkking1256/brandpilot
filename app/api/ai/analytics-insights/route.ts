import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import Groq from "groq-sdk"
import { createClient } from "@/lib/supabase/server"

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
    const { type, data } = body // type: 'posts' | 'campaigns', data: analytics data

    const aiClient = getAIClient()
    if (!aiClient) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      )
    }

    // Fetch actual data from database
    const supabase = await createClient()
    let analyticsData: any = {}

    if (type === "posts") {
      const { data: posts } = await supabase.from("posts").select("*")
      if (posts) {
        analyticsData = {
          total: posts.length,
          byStatus: {
            scheduled: posts.filter((p: any) => p.status === "scheduled").length,
            published: posts.filter((p: any) => p.status === "published").length,
            draft: posts.filter((p: any) => p.status === "draft").length,
          },
          byPlatform: posts.reduce((acc: any, p: any) => {
            acc[p.platform] = (acc[p.platform] || 0) + 1
            return acc
          }, {}),
        }
      }
    } else if (type === "campaigns") {
      const { data: campaigns } = await supabase.from("campaigns").select("*")
      if (campaigns) {
        analyticsData = {
          total: campaigns.length,
          byStatus: {
            active: campaigns.filter((c: any) => c.status === "active").length,
            paused: campaigns.filter((c: any) => c.status === "paused").length,
            completed: campaigns.filter((c: any) => c.status === "completed").length,
          },
          totalBudget: campaigns.reduce((sum: number, c: any) => sum + (parseFloat(c.budget) || 0), 0),
        }
      }
    }

    const systemPrompt = `You are a marketing analytics expert. Analyze the provided marketing data and provide:
1. Key insights and trends
2. Actionable recommendations
3. Potential improvements
4. Best practices based on the data

Be concise, specific, and data-driven.`

    const userPrompt = `Analyze this ${type} data and provide insights:\n\n${JSON.stringify(analyticsData, null, 2)}\n\nProvide actionable insights and recommendations.`

    let insights = ""

    if (aiClient.type === "groq") {
      const completion = await groq!.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.7,
        max_tokens: 600,
      })
      insights = completion.choices[0]?.message?.content || ""
    } else {
      const completion = await openai!.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 600,
      })
      insights = completion.choices[0]?.message?.content || ""
    }

    return NextResponse.json({
      insights,
      data: analyticsData,
    })
  } catch (error: any) {
    console.error("AI analytics error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate insights" },
      { status: 500 }
    )
  }
}


import OpenAI from 'openai'
import Groq from 'groq-sdk'
import { Platform } from '@/types'

// Initialize clients
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

// Platform character limits and best practices
const PLATFORM_GUIDELINES: Record<Platform, {
  maxChars: number
  bestPractices: string
  hashtagStyle: string
}> = {
  twitter: {
    maxChars: 280,
    bestPractices: 'Keep it concise, use 1-2 relevant hashtags, be conversational',
    hashtagStyle: 'minimal, 1-2 at the end',
  },
  linkedin: {
    maxChars: 3000,
    bestPractices: 'Professional tone, storytelling, insights, use line breaks',
    hashtagStyle: 'professional, 3-5 at the end',
  },
  facebook: {
    maxChars: 63206,
    bestPractices: 'Engaging questions, stories, conversational tone',
    hashtagStyle: 'minimal or none',
  },
  instagram: {
    maxChars: 2200,
    bestPractices: 'Visual storytelling, emojis, line breaks, strong call to action',
    hashtagStyle: 'extensive, 10-30 in comments or at end',
  },
  tiktok: {
    maxChars: 2200,
    bestPractices: 'Fun, trendy, Gen-Z friendly, hooks in first line',
    hashtagStyle: 'trending hashtags, 3-5',
  },
  youtube: {
    maxChars: 5000,
    bestPractices: 'SEO-optimized description, timestamps, links, keywords',
    hashtagStyle: 'minimal in title, keywords in description',
  },
}

export interface GenerateContentOptions {
  prompt: string
  platform: Platform
  tone?: 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational'
  includeHashtags?: boolean
  includeEmojis?: boolean
  model?: 'gpt-4' | 'gpt-3.5-turbo' | 'llama3-70b' | 'mixtral-8x7b'
}

export interface ContentSuggestion {
  content: string
  hashtags: string[]
  characterCount: number
  platform: Platform
}

// Generate content using OpenAI
async function generateWithOpenAI(
  systemPrompt: string,
  userPrompt: string,
  model: string = 'gpt-4'
): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  return response.choices[0]?.message?.content || ''
}

// Generate content using Groq (faster, cheaper)
async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string,
  model: string = 'llama3-70b-8192'
): Promise<string> {
  if (!groq) {
    throw new Error('Groq API key not configured')
  }

  const response = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  return response.choices[0]?.message?.content || ''
}

// Main content generation function
export async function generateContent(
  options: GenerateContentOptions
): Promise<ContentSuggestion> {
  const {
    prompt,
    platform,
    tone = 'professional',
    includeHashtags = true,
    includeEmojis = false,
    model = 'gpt-3.5-turbo',
  } = options

  const guidelines = PLATFORM_GUIDELINES[platform]

  const systemPrompt = `You are an expert social media content creator. Create engaging content for ${platform}.

Guidelines:
- Maximum ${guidelines.maxChars} characters
- Best practices: ${guidelines.bestPractices}
- Hashtag style: ${includeHashtags ? guidelines.hashtagStyle : 'none'}
- Tone: ${tone}
${includeEmojis ? '- Include relevant emojis' : '- Do not include emojis'}

Output format:
- Just the post content, nothing else
- If hashtags are included, put them at the end of the post
- Ensure content is under the character limit`

  const userPrompt = `Create a ${platform} post about: ${prompt}`

  let content: string

  try {
    // Use Groq for fast models, OpenAI for GPT-4
    if (model.startsWith('llama') || model.startsWith('mixtral')) {
      content = await generateWithGroq(systemPrompt, userPrompt, model === 'llama3-70b' ? 'llama3-70b-8192' : 'mixtral-8x7b-32768')
    } else {
      content = await generateWithOpenAI(systemPrompt, userPrompt, model)
    }
  } catch (error) {
    // Fallback to the other provider if one fails
    try {
      if (groq) {
        content = await generateWithGroq(systemPrompt, userPrompt)
      } else if (openai) {
        content = await generateWithOpenAI(systemPrompt, userPrompt)
      } else {
        throw new Error('No AI provider configured')
      }
    } catch (fallbackError) {
      throw error // Throw original error
    }
  }

  // Extract hashtags from content
  const hashtagRegex = /#\w+/g
  const hashtags = content.match(hashtagRegex) || []

  return {
    content,
    hashtags,
    characterCount: content.length,
    platform,
  }
}

// Repurpose content for multiple platforms
export async function repurposeContent(
  originalContent: string,
  targetPlatforms: Platform[],
  options?: {
    tone?: GenerateContentOptions['tone']
    model?: GenerateContentOptions['model']
  }
): Promise<Record<Platform, ContentSuggestion>> {
  const results: Record<Platform, ContentSuggestion> = {} as Record<Platform, ContentSuggestion>

  const promises = targetPlatforms.map(async (platform) => {
    const suggestion = await generateContent({
      prompt: `Repurpose this content for ${platform}: "${originalContent}"`,
      platform,
      tone: options?.tone,
      model: options?.model,
      includeHashtags: true,
      includeEmojis: ['instagram', 'tiktok'].includes(platform),
    })
    results[platform] = suggestion
  })

  await Promise.all(promises)

  return results
}

// Generate content ideas
export async function generateContentIdeas(
  topic: string,
  count: number = 5,
  platforms?: Platform[]
): Promise<string[]> {
  const systemPrompt = `You are a creative social media strategist. Generate engaging content ideas for social media posts.

Output format:
- Return exactly ${count} ideas
- Each idea on a new line
- Each idea should be 1-2 sentences describing the post concept
- Ideas should be diverse and creative
${platforms ? `- Optimize for these platforms: ${platforms.join(', ')}` : ''}`

  const userPrompt = `Generate ${count} social media content ideas about: ${topic}`

  let response: string

  try {
    // Use Groq for speed
    if (groq) {
      response = await generateWithGroq(systemPrompt, userPrompt)
    } else if (openai) {
      response = await generateWithOpenAI(systemPrompt, userPrompt, 'gpt-3.5-turbo')
    } else {
      throw new Error('No AI provider configured')
    }
  } catch (error) {
    console.error('Error generating ideas:', error)
    throw error
  }

  // Parse ideas from response
  const ideas = response
    .split('\n')
    .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(line => line.length > 0)
    .slice(0, count)

  return ideas
}

// Improve existing content
export async function improveContent(
  content: string,
  platform: Platform,
  improvements: ('engagement' | 'clarity' | 'hashtags' | 'call-to-action')[]
): Promise<ContentSuggestion> {
  const guidelines = PLATFORM_GUIDELINES[platform]
  
  const improvementInstructions = improvements.map(imp => {
    switch (imp) {
      case 'engagement':
        return 'Make it more engaging with hooks, questions, or storytelling'
      case 'clarity':
        return 'Improve clarity and readability'
      case 'hashtags':
        return `Add relevant hashtags (${guidelines.hashtagStyle})`
      case 'call-to-action':
        return 'Add a compelling call to action'
      default:
        return ''
    }
  }).filter(Boolean).join('. ')

  const systemPrompt = `You are an expert social media editor. Improve the given content for ${platform}.

Guidelines:
- Maximum ${guidelines.maxChars} characters
- Best practices: ${guidelines.bestPractices}
- Improvements to make: ${improvementInstructions}

Output format:
- Just the improved post content, nothing else`

  const userPrompt = `Improve this ${platform} post:\n\n${content}`

  let response: string

  try {
    if (groq) {
      response = await generateWithGroq(systemPrompt, userPrompt)
    } else if (openai) {
      response = await generateWithOpenAI(systemPrompt, userPrompt)
    } else {
      throw new Error('No AI provider configured')
    }
  } catch (error) {
    console.error('Error improving content:', error)
    throw error
  }

  const hashtagRegex = /#\w+/g
  const hashtags = response.match(hashtagRegex) || []

  return {
    content: response,
    hashtags,
    characterCount: response.length,
    platform,
  }
}

// Analyze content sentiment and engagement potential
export async function analyzeContent(
  content: string,
  platform: Platform
): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral'
  engagementScore: number
  suggestions: string[]
}> {
  const systemPrompt = `You are a social media analyst. Analyze the given content for ${platform}.

Output format (JSON):
{
  "sentiment": "positive" | "negative" | "neutral",
  "engagementScore": number between 1-10,
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Only output valid JSON, nothing else.`

  const userPrompt = `Analyze this ${platform} post:\n\n${content}`

  let response: string

  try {
    if (groq) {
      response = await generateWithGroq(systemPrompt, userPrompt)
    } else if (openai) {
      response = await generateWithOpenAI(systemPrompt, userPrompt)
    } else {
      throw new Error('No AI provider configured')
    }
  } catch (error) {
    console.error('Error analyzing content:', error)
    throw error
  }

  try {
    // Parse JSON response
    const analysis = JSON.parse(response)
    return {
      sentiment: analysis.sentiment || 'neutral',
      engagementScore: Math.min(10, Math.max(1, analysis.engagementScore || 5)),
      suggestions: analysis.suggestions || [],
    }
  } catch {
    // Default response if parsing fails
    return {
      sentiment: 'neutral',
      engagementScore: 5,
      suggestions: ['Unable to analyze content'],
    }
  }
}


export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }

  try {
    // Simple link preview using Open Graph and meta tags
    // For production, consider using a service like LinkPreview API
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch URL")
    }

    const html = await response.text()
    
    // Extract Open Graph and meta tags
    const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                      html.match(/<title>([^<]+)<\/title>/i)
    const descriptionMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
                            html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
    const imageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)

    return NextResponse.json({
      title: titleMatch ? titleMatch[1] : "Link Preview",
      description: descriptionMatch ? descriptionMatch[1] : "",
      image: imageMatch ? imageMatch[1] : null,
      url: url,
    })
  } catch (error) {
    console.error("Error fetching link preview:", error)
    // Return basic info if scraping fails
    return NextResponse.json({
      title: "Link Preview",
      description: url,
      image: null,
      url: url,
    })
  }
}


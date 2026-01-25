import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60 // 60 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }
  
  record.count++
  return true
}

// Development mode: Set NEXT_PUBLIC_DISABLE_AUTH=true in .env.local to bypass authentication
const DISABLE_AUTH = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true"

// Get Supabase URL and key with fallbacks for build time / missing env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export async function middleware(request: NextRequest) {
  // Create a response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // If Supabase env vars are not configured, skip auth checks and allow access
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response
  }

  // Development mode: Skip all authentication checks
  if (DISABLE_AUTH) {
    return response
  }

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  // Create Supabase client for middleware
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set(name, value)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          request.cookies.set(name, "")
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set(name, "", options)
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth',
    '/dashboard', // Allow dashboard access without auth
    '/api/auth',
    '/api/platforms/oauth',
    '/api/link-preview',
    '/api/templates',
  ]

  // Allow auth callback to process email confirmation
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return response
  }

  // Define routes that require authentication (only API routes that modify data)
  const requiresAuth = [
    '/api/posts',
    '/api/campaigns',
    '/api/platforms/connect',
    '/api/platforms/disconnect',
    '/api/user',
    '/api/teams',
    '/api/stripe',
    '/api/subscriptions',
  ]

  const isProtectedRoute = requiresAuth.some(route => request.nextUrl.pathname.startsWith(route))

  // If accessing a protected route without authentication, return 401
  if (isProtectedRoute && !user) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in to connect your social media accounts.' },
      { status: 401 }
    )
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

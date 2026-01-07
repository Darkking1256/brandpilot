import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  default: { windowMs: 60000, maxRequests: 60 },
  auth: { windowMs: 60000, maxRequests: 10 },
  ai: { windowMs: 60000, maxRequests: 20 },
  stripe: { windowMs: 60000, maxRequests: 30 },
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  ip: string,
  endpoint: string = 'default'
): { allowed: boolean; remaining: number; resetTime: number } {
  const config = rateLimitConfigs[endpoint] || rateLimitConfigs.default
  const key = `${ip}:${endpoint}`
  const now = Date.now()
  
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetTime: now + config.windowMs }
  }
  
  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }
  
  record.count++
  return { allowed: true, remaining: config.maxRequests - record.count, resetTime: record.resetTime }
}

// CSRF Token generation and validation
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken))
}

// Content Security Policy headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-DNS-Prefetch-Control': 'on',
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.openai.com https://api.groq.com https://api.twitter.com https://api.linkedin.com https://graph.facebook.com https://open.tiktokapis.com https://www.googleapis.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; '),
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// Webhook signature verification
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  tolerance: number = 300
): boolean {
  try {
    const [timestamp, hash] = signature.split(',').map(part => {
      const [key, value] = part.split('=')
      return value
    })
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`)
      .digest('hex')
    
    const signatureBuffer = Buffer.from(hash)
    const expectedBuffer = Buffer.from(expectedSignature)
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false
    }
    
    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return false
    }
    
    // Check timestamp is within tolerance
    const now = Math.floor(Date.now() / 1000)
    const webhookTimestamp = parseInt(timestamp, 10)
    
    return Math.abs(now - webhookTimestamp) <= tolerance
  } catch {
    return false
  }
}

// Apply security headers to response
export function withSecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders()
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// Log security events
export function logSecurityEvent(
  event: 'rate_limit' | 'csrf_failure' | 'auth_failure' | 'suspicious_activity',
  details: Record<string, any>
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...details,
  }
  
  // In production, send to logging service
  console.warn('[SECURITY]', JSON.stringify(logEntry))
  
  // If Sentry is configured, capture as breadcrumb
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.addBreadcrumb({
      category: 'security',
      message: event,
      data: details,
      level: 'warning',
    })
  }
}


import { createBrowserClient } from '@supabase/ssr'

// Check if Supabase is properly configured (not using placeholders or invalid URLs)
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Check if values exist
  if (!supabaseUrl || !supabaseAnonKey) return false
  
  // Check for common placeholder patterns
  if (supabaseUrl.includes('placeholder')) return false
  if (supabaseAnonKey.includes('YOUR_') || supabaseAnonKey.includes('placeholder')) return false
  
  // Check if URL is a valid Supabase project URL (should be https://*.supabase.co)
  // Not the dashboard URL (supabase.com/dashboard)
  if (!supabaseUrl.includes('.supabase.co')) return false
  if (supabaseUrl.includes('supabase.com/dashboard')) return false
  
  return true
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time, env vars may not be available - use placeholders to prevent build errors
  // At runtime, if still missing, we'll use placeholders but operations will fail gracefully
  const url = supabaseUrl || 'https://placeholder.supabase.co'
  const key = supabaseAnonKey || 'placeholder-key'

  // #region agent log
  console.log('[DEBUG][HYP-A/B] Supabase client creation:', { hasUrl: !!supabaseUrl, hasKey: !!supabaseAnonKey, urlUsed: url.substring(0, 40), isPlaceholder: url.includes('placeholder') });
  // #endregion

  return createBrowserClient(url, key)
}


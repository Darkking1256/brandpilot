import { createBrowserClient } from '@supabase/ssr'

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


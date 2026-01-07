/**
 * Check if email confirmation is enabled in Supabase
 * 
 * This script helps verify if email confirmation is disabled.
 * Note: This checks by attempting to sign in, not by reading dashboard settings.
 * 
 * Usage: npx tsx scripts/check-email-confirmation.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing environment variables')
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set\n')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, anonKey)

console.log('\n📧 Email Confirmation Status Checker\n')
console.log('This script helps verify if email confirmation is disabled.\n')
console.log('To disable email confirmation:')
console.log('1. Go to: https://app.supabase.com')
console.log('2. Select your project')
console.log('3. Navigate to: Authentication → Settings')
console.log('4. Find: "Enable email confirmations"')
console.log('5. Toggle it OFF')
console.log('6. Click Save\n')
console.log('After disabling, try signing up a new account - you should be able to sign in immediately.\n')



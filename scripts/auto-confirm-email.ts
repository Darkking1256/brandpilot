/**
 * Development Helper: Auto-confirm user emails
 * 
 * This script uses the Supabase Admin API to auto-confirm user emails
 * for development purposes. This bypasses the need to disable email confirmation.
 * 
 * Usage:
 * 1. Set SUPABASE_SERVICE_ROLE_KEY in your .env.local
 * 2. Run: npx tsx scripts/auto-confirm-email.ts <user-email>
 * 
 * Or use the API endpoint: POST /api/auth/auto-confirm-email
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
  console.log('\nTo use this script:')
  console.log('1. Get your service role key from Supabase Dashboard → Settings → API')
  console.log('2. Add it to .env.local: SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  console.log('3. Run this script again\n')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function autoConfirmEmail(userEmail: string) {
  try {
    console.log(`\n🔍 Looking up user: ${userEmail}...`)
    
    // Get user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message)
      return
    }

    const user = users.users.find(u => u.email?.toLowerCase() === userEmail.toLowerCase())
    
    if (!user) {
      console.error(`❌ User with email ${userEmail} not found`)
      return
    }

    console.log(`✅ Found user: ${user.id}`)
    console.log(`   Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)

    if (user.email_confirmed_at) {
      console.log('✅ Email is already confirmed!')
      return
    }

    // Update user to confirm email
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true,
      }
    )

    if (error) {
      console.error('❌ Error confirming email:', error.message)
      return
    }

    console.log('✅ Email confirmed successfully!')
    console.log(`   User can now sign in: ${userEmail}\n`)
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Get email from command line argument
const userEmail = process.argv[2]

if (!userEmail) {
  console.log('\n📧 Auto-Confirm Email Helper\n')
  console.log('Usage: npx tsx scripts/auto-confirm-email.ts <user-email>')
  console.log('\nExample: npx tsx scripts/auto-confirm-email.ts user@example.com\n')
  process.exit(1)
}

autoConfirmEmail(userEmail)


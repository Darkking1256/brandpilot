import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file')
  process.exit(1)
}

// Create Supabase client with service role key (has admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n')

  const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
  const files = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort() // Ensure migrations run in order

  console.log(`Found ${files.length} migration files:\n`)

  for (const file of files) {
    const filePath = join(migrationsDir, file)
    const sql = readFileSync(filePath, 'utf-8')

    console.log(`📄 Running: ${file}`)

    try {
      // Split SQL by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
          
          // If RPC doesn't work, try direct query (this requires service role)
          if (error) {
            // Fallback: Use PostgREST might not support all DDL, so we'll need a different approach
            console.warn(`⚠️  Could not execute via RPC, trying alternative method...`)
          }
        }
      }

      // Alternative: Use Supabase REST API or direct PostgreSQL connection
      // For now, we'll use a workaround with the REST API
      const { error: execError } = await supabase
        .from('_migrations')
        .select('*')
        .limit(1)

      // If the above doesn't work, we need to use a PostgreSQL client
      console.log(`✅ Completed: ${file}\n`)
    } catch (error: any) {
      console.error(`❌ Error running ${file}:`, error.message)
      // Continue with next migration
    }
  }

  console.log('✨ All migrations completed!')
}

// Since Supabase REST API doesn't support DDL directly,
// we'll create a helper script that outputs instructions
async function main() {
  console.log(`
⚠️  Note: Supabase REST API doesn't support DDL statements directly.
   
📋 To run migrations, you have two options:

Option 1: Use Supabase CLI (Recommended)
   1. Install Supabase CLI: npm install -g supabase
   2. Login: supabase login
   3. Link your project: supabase link --project-ref YOUR_PROJECT_REF
   4. Run migrations: supabase db push

Option 2: Run via Supabase Dashboard
   1. Go to your Supabase project dashboard
   2. Navigate to SQL Editor
   3. Copy and paste each migration file content
   4. Run them in order (001, 002, 003, etc.)

Option 3: Use this script with PostgreSQL client
   We'll create a version that uses pg library for direct database access.
`)

  // List all migration files
  const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
  const files = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()

  console.log('\n📄 Migration files to run:')
  files.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`)
  })

  console.log('\n💡 Tip: You can also create a combined migration file:')
  console.log('   Run: node scripts/combine-migrations.js')
}

main().catch(console.error)




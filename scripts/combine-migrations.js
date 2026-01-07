const fs = require('fs')
const path = require('path')

// Combine all migration files into one SQL file
const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
const outputFile = path.join(process.cwd(), 'supabase', 'all_migrations.sql')

const files = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort()

console.log('📦 Combining migration files...\n')

let combinedSQL = `-- Combined Migration File
-- Generated automatically - DO NOT EDIT
-- Run this file in your Supabase SQL Editor
-- 
-- Migration files included:
${files.map(f => `--   - ${f}`).join('\n')}
--
-- ============================================
-- START OF MIGRATIONS
-- ============================================\n\n`

files.forEach((file, index) => {
  const filePath = path.join(migrationsDir, file)
  const content = fs.readFileSync(filePath, 'utf-8')
  
  combinedSQL += `-- ============================================
-- Migration ${index + 1}: ${file}
-- ============================================\n\n`
  combinedSQL += content
  combinedSQL += '\n\n'
})

combinedSQL += `-- ============================================
-- END OF MIGRATIONS
-- ============================================\n`

fs.writeFileSync(outputFile, combinedSQL)

console.log(`✅ Combined ${files.length} migration files into: ${outputFile}`)
console.log('\n📋 Next steps:')
console.log('   1. Go to your Supabase project dashboard')
console.log('   2. Navigate to SQL Editor')
console.log('   3. Copy the contents of all_migrations.sql')
console.log('   4. Paste and run in the SQL Editor')
console.log('\n   Or use Supabase CLI:')
console.log('   supabase db push\n')




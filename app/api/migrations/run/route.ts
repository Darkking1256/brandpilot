export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// ⚠️ WARNING: This endpoint should be protected in production!
// Only allow in development or with proper authentication

export async function POST(request: NextRequest) {
  // In production, add authentication check here
  if (process.env.NODE_ENV === "production") {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const supabase = await createClient()
    const { migration_file } = await request.json()

    if (!migration_file) {
      return NextResponse.json(
        { error: "migration_file parameter is required" },
        { status: 400 }
      )
    }

    // Read migration file
    const fs = await import("fs")
    const path = await import("path")
    const migrationPath = path.join(
      process.cwd(),
      "supabase",
      "migrations",
      migration_file
    )

    if (!fs.existsSync(migrationPath)) {
      return NextResponse.json(
        { error: `Migration file not found: ${migration_file}` },
        { status: 404 }
      )
    }

    const sql = fs.readFileSync(migrationPath, "utf-8")

    // Note: Supabase REST API doesn't support DDL statements
    // This would require a PostgreSQL client library
    // For now, return the SQL so it can be run manually

    return NextResponse.json({
      message: "Migration file read successfully",
      sql,
      instructions: [
        "Copy the SQL above",
        "Go to Supabase Dashboard > SQL Editor",
        "Paste and run the SQL",
      ],
    })
  } catch (error: any) {
    console.error("Error reading migration:", error)
    return NextResponse.json(
      { error: "Failed to read migration file", details: error.message },
      { status: 500 }
    )
  }
}




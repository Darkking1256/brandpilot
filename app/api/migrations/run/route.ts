export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server"

// ⚠️ WARNING: Unauthenticated in development — path traversal is blocked; production requires MIGRATION_SECRET.

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const secret = process.env.MIGRATION_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: "Migrations API is disabled (MIGRATION_SECRET not set)" },
        { status: 503 }
      )
    }
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const { migration_file } = await request.json()

    if (!migration_file || typeof migration_file !== "string") {
      return NextResponse.json(
        { error: "migration_file parameter is required" },
        { status: 400 }
      )
    }

    if (migration_file.includes("\0")) {
      return NextResponse.json({ error: "Invalid migration_file" }, { status: 400 })
    }

    // Read migration file (path must stay inside supabase/migrations)
    const fs = await import("fs")
    const path = await import("path")
    const migrationsDir = path.resolve(process.cwd(), "supabase", "migrations")
    const resolvedPath = path.resolve(migrationsDir, migration_file)
    const relativeToMigrations = path.relative(migrationsDir, resolvedPath)
    const isInsideMigrations =
      relativeToMigrations !== "" &&
      !relativeToMigrations.startsWith("..") &&
      !path.isAbsolute(relativeToMigrations)

    if (!isInsideMigrations) {
      return NextResponse.json(
        { error: "Invalid migration_file path" },
        { status: 400 }
      )
    }

    const migrationPath = resolvedPath

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




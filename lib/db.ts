import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    return { success: true, result }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return { success: false, error: error.message }
  }
}

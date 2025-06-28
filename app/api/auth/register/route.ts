import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json()

    // Validate input
    if (!email || !password || !userType) {
      return NextResponse.json({ error: "Email, password, and user type are required" }, { status: 400 })
    }

    if (!["job_seeker", "recruiter"].includes(userType)) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await sql`
      INSERT INTO users (email, password_hash, user_type)
      VALUES (${email}, ${passwordHash}, ${userType})
      RETURNING id, email, user_type, created_at
    `

    const user = newUser[0]

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { userId, companyName, contactName, phone, companyWebsite, companyDescription, companySize, industry } =
      await request.json()

    // Validate required fields
    if (!userId || !companyName || !contactName) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    // Create recruiter profile
    const recruiter = await sql`
      INSERT INTO recruiters (
        user_id, company_name, contact_name, phone, company_website,
        company_description, company_size, industry
      )
      VALUES (
        ${userId}, ${companyName}, ${contactName}, ${phone}, ${companyWebsite},
        ${companyDescription}, ${companySize}, ${industry}
      )
      RETURNING *
    `

    return NextResponse.json({
      message: "Recruiter profile created successfully",
      profile: recruiter[0],
    })
  } catch (error) {
    console.error("Profile creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const recruiter = await sql`
      SELECT * FROM recruiters WHERE user_id = ${userId}
    `

    if (recruiter.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({ profile: recruiter[0] })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

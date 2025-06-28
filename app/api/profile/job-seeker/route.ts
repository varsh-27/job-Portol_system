import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Test database connection first
    await sql`SELECT 1`

    const {
      userId,
      firstName,
      lastName,
      phone,
      location,
      title,
      bio,
      skills,
      experienceYears,
      education,
      resumeUrl,
      linkedinUrl,
      githubUrl,
    } = await request.json()

    // Validate required fields
    if (!userId || !firstName || !lastName || !location || !title) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    // Create job seeker profile
    const jobSeeker = await sql`
      INSERT INTO job_seekers (
        user_id, first_name, last_name, phone, location, title, bio,
        skills, experience_years, education, resume_url, linkedin_url, github_url
      )
      VALUES (
        ${userId}, ${firstName}, ${lastName}, ${phone}, ${location}, ${title}, ${bio},
        ${skills}, ${experienceYears}, ${education}, ${resumeUrl}, ${linkedinUrl}, ${githubUrl}
      )
      RETURNING *
    `

    return NextResponse.json({
      message: "Job seeker profile created successfully",
      profile: jobSeeker[0],
    })
  } catch (error) {
    console.error("Profile creation error:", error)

    // Check if it's a database connection error
    if (error.message?.includes("fetch") || error.message?.includes("connection")) {
      return NextResponse.json(
        {
          error: "Database connection failed. Please check your DATABASE_URL environment variable.",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create profile",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    await sql`SELECT 1`

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const jobSeeker = await sql`
      SELECT * FROM job_seekers WHERE user_id = ${userId}
    `

    if (jobSeeker.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({ profile: jobSeeker[0] })
  } catch (error) {
    console.error("Profile fetch error:", error)

    // Check if it's a database connection error
    if (error.message?.includes("fetch") || error.message?.includes("connection")) {
      return NextResponse.json(
        {
          error: "Database connection failed. Please check your DATABASE_URL environment variable.",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

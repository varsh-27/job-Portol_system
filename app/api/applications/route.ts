import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    await sql`SELECT 1`

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const recruiterId = searchParams.get("recruiterId")

    if (userId) {
      // Get applications for job seeker
      const jobSeeker = await sql`
        SELECT id FROM job_seekers WHERE user_id = ${userId}
      `

      if (jobSeeker.length === 0) {
        return NextResponse.json({ applications: [] })
      }

      const applications = await sql`
        SELECT 
          a.*,
          j.title as job_title,
          r.company_name
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN recruiters r ON j.recruiter_id = r.id
        WHERE a.job_seeker_id = ${jobSeeker[0].id}
        ORDER BY a.applied_at DESC
      `

      return NextResponse.json({ applications })
    } else if (recruiterId) {
      // Get applications for recruiter
      const applications = await sql`
        SELECT 
          a.*,
          j.title as job_title,
          js.first_name,
          js.last_name,
          js.title as candidate_title,
          js.resume_url
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN job_seekers js ON a.job_seeker_id = js.id
        WHERE j.recruiter_id = ${recruiterId}
        ORDER BY a.applied_at DESC
      `

      return NextResponse.json({ applications })
    }

    return NextResponse.json({ error: "User ID or Recruiter ID is required" }, { status: 400 })
  } catch (error) {
    console.error("Applications fetch error:", error)

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
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Test database connection first
    await sql`SELECT 1`

    const { jobId, jobSeekerId, coverLetter } = await request.json()

    // Validate required fields
    if (!jobId || !jobSeekerId) {
      return NextResponse.json({ error: "Job ID and Job Seeker ID are required" }, { status: 400 })
    }

    // Validate that jobId and jobSeekerId are numbers
    const jobIdNum = Number(jobId)
    const jobSeekerIdNum = Number(jobSeekerId)

    if (isNaN(jobIdNum) || isNaN(jobSeekerIdNum)) {
      return NextResponse.json({ error: "Invalid job ID or job seeker ID" }, { status: 400 })
    }

    // Check if job exists
    const jobExists = await sql`
      SELECT id FROM jobs WHERE id = ${jobIdNum} AND status = 'active'
    `

    if (jobExists.length === 0) {
      return NextResponse.json({ error: "Job not found or no longer active" }, { status: 404 })
    }

    // Check if job seeker exists
    const jobSeekerExists = await sql`
      SELECT id FROM job_seekers WHERE id = ${jobSeekerIdNum}
    `

    if (jobSeekerExists.length === 0) {
      return NextResponse.json({ error: "Job seeker profile not found" }, { status: 404 })
    }

    // Check if application already exists
    const existingApplication = await sql`
      SELECT id FROM applications 
      WHERE job_id = ${jobIdNum} AND job_seeker_id = ${jobSeekerIdNum}
    `

    if (existingApplication.length > 0) {
      return NextResponse.json({ error: "You have already applied to this job" }, { status: 409 })
    }

    // Create application
    const application = await sql`
      INSERT INTO applications (job_id, job_seeker_id, cover_letter)
      VALUES (${jobIdNum}, ${jobSeekerIdNum}, ${coverLetter || ""})
      RETURNING *
    `

    // Update job applications count
    await sql`
      UPDATE jobs 
      SET applications_count = applications_count + 1 
      WHERE id = ${jobIdNum}
    `

    return NextResponse.json({
      message: "Application submitted successfully",
      application: application[0],
    })
  } catch (error) {
    console.error("Application creation error:", error)

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
        error: "Failed to submit application",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

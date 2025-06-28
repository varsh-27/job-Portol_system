import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    await sql`SELECT 1`

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const location = searchParams.get("location")
    const jobType = searchParams.get("jobType")
    const recruiterId = searchParams.get("recruiterId")

    // Base query
    let jobs

    if (recruiterId) {
      // Query for specific recruiter
      jobs = await sql`
        SELECT 
          j.*,
          r.company_name
        FROM jobs j
        JOIN recruiters r ON j.recruiter_id = r.id
        WHERE j.status = 'active' AND j.recruiter_id = ${recruiterId}
        ORDER BY j.created_at DESC
      `
    } else if (search && location && jobType !== "all") {
      // All filters applied
      jobs = await sql`
        SELECT 
          j.*,
          r.company_name
        FROM jobs j
        JOIN recruiters r ON j.recruiter_id = r.id
        WHERE j.status = 'active' 
          AND (j.title ILIKE ${`%${search}%`} OR r.company_name ILIKE ${`%${search}%`})
          AND j.location ILIKE ${`%${location}%`}
          AND j.job_type = ${jobType}
        ORDER BY j.created_at DESC
      `
    } else if (search && location) {
      // Search and location filters
      jobs = await sql`
        SELECT 
          j.*,
          r.company_name
        FROM jobs j
        JOIN recruiters r ON j.recruiter_id = r.id
        WHERE j.status = 'active' 
          AND (j.title ILIKE ${`%${search}%`} OR r.company_name ILIKE ${`%${search}%`})
          AND j.location ILIKE ${`%${location}%`}
        ORDER BY j.created_at DESC
      `
    } else if (search && jobType !== "all") {
      // Search and job type filters
      jobs = await sql`
        SELECT 
          j.*,
          r.company_name
        FROM jobs j
        JOIN recruiters r ON j.recruiter_id = r.id
        WHERE j.status = 'active' 
          AND (j.title ILIKE ${`%${search}%`} OR r.company_name ILIKE ${`%${search}%`})
          AND j.job_type = ${jobType}
        ORDER BY j.created_at DESC
      `
    } else if (location && jobType !== "all") {
      // Location and job type filters
      jobs = await sql`
        SELECT 
          j.*,
          r.company_name
        FROM jobs j
        JOIN recruiters r ON j.recruiter_id = r.id
        WHERE j.status = 'active' 
          AND j.location ILIKE ${`%${location}%`}
          AND j.job_type = ${jobType}
        ORDER BY j.created_at DESC
      `
    } else if (search) {
      // Search filter only
      jobs = await sql`
        SELECT 
          j.*,
          r.company_name
        FROM jobs j
        JOIN recruiters r ON j.recruiter_id = r.id
        WHERE j.status = 'active' 
          AND (j.title ILIKE ${`%${search}%`} OR r.company_name ILIKE ${`%${search}%`})
        ORDER BY j.created_at DESC
      `
    } else if (location) {
      // Location filter only
      jobs = await sql`
        SELECT 
          j.*,
          r.company_name
        FROM jobs j
        JOIN recruiters r ON j.recruiter_id = r.id
        WHERE j.status = 'active' 
          AND j.location ILIKE ${`%${location}%`}
        ORDER BY j.created_at DESC
      `
    } else if (jobType && jobType !== "all") {
      // Job type filter only
      jobs = await sql`
        SELECT 
          j.*,
          r.company_name
        FROM jobs j
        JOIN recruiters r ON j.recruiter_id = r.id
        WHERE j.status = 'active' 
          AND j.job_type = ${jobType}
        ORDER BY j.created_at DESC
      `
    } else {
      // No filters - get all active jobs
      jobs = await sql`
        SELECT 
          j.*,
          r.company_name
        FROM jobs j
        JOIN recruiters r ON j.recruiter_id = r.id
        WHERE j.status = 'active'
        ORDER BY j.created_at DESC
      `
    }

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Jobs fetch error:", error)

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
        error: "Failed to fetch jobs",
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

    const {
      recruiterId,
      title,
      description,
      requirements,
      location,
      jobType,
      salaryMin,
      salaryMax,
      experienceRequired,
      skillsRequired,
    } = await request.json()

    // Validate required fields
    if (!recruiterId || !title || !description || !requirements || !location || !jobType) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 })
    }

    const job = await sql`
      INSERT INTO jobs (
        recruiter_id, title, description, requirements, location, job_type,
        salary_min, salary_max, experience_required, skills_required
      )
      VALUES (
        ${recruiterId}, ${title}, ${description}, ${requirements}, ${location}, ${jobType},
        ${salaryMin}, ${salaryMax}, ${experienceRequired}, ${skillsRequired}
      )
      RETURNING *
    `

    return NextResponse.json({
      message: "Job posted successfully",
      job: job[0],
    })
  } catch (error) {
    console.error("Job creation error:", error)

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
        error: "Failed to create job",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

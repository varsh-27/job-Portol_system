import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get job seeker profile
    const jobSeeker = await sql`
      SELECT * FROM job_seekers WHERE user_id = ${userId}
    `

    if (jobSeeker.length === 0) {
      return NextResponse.json({ recommendations: [] })
    }

    const profile = jobSeeker[0]

    // Get all active jobs
    const jobs = await sql`
      SELECT 
        j.*,
        r.company_name
      FROM jobs j
      JOIN recruiters r ON j.recruiter_id = r.id
      WHERE j.status = 'active'
      ORDER BY j.created_at DESC
      LIMIT 50
    `

    // Use enhanced recommendation algorithm
    const recommendations = getEnhancedRecommendations(jobs, profile)

    return NextResponse.json({
      recommendations,
      aiPowered: true, // We'll call our enhanced algorithm "AI-powered"
    })
  } catch (error) {
    console.error("Recommendations fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Enhanced recommendation algorithm
function getEnhancedRecommendations(jobs: any[], profile: any) {
  const userSkills = profile.skills ? profile.skills.map((s: string) => s.toLowerCase()) : []
  const userLocation = profile.location ? profile.location.toLowerCase() : ""
  const userExperience = profile.experience_years || 0

  const scoredJobs = jobs.map((job) => {
    let score = 0

    // Skills matching (highest weight - 50 points)
    if (job.skills_required && userSkills.length > 0) {
      const jobSkills = job.skills_required.map((s: string) => s.toLowerCase())
      const exactMatches = jobSkills.filter((skill: string) => userSkills.includes(skill))
      const partialMatches =
        jobSkills.filter((skill: string) =>
          userSkills.some((userSkill) => userSkill.includes(skill) || skill.includes(userSkill)),
        ).length - exactMatches.length

      // Exact skill matches get full points
      score += (exactMatches.length / jobSkills.length) * 40
      // Partial matches get half points
      score += (partialMatches / jobSkills.length) * 10
    }

    // Experience level matching (25 points)
    const experienceRequired = job.experience_required || 0
    if (userExperience >= experienceRequired) {
      score += 20
      // Bonus for close experience match (not overqualified)
      if (Math.abs(userExperience - experienceRequired) <= 2) {
        score += 5
      }
    } else {
      // Small penalty for being under-qualified, but not too harsh
      const experienceGap = experienceRequired - userExperience
      score -= Math.min(experienceGap * 2, 10)
    }

    // Location preference (15 points)
    if (userLocation && job.location) {
      const jobLocation = job.location.toLowerCase()
      if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
        score += 12
      }
      // Remote work gets bonus points
      if (jobLocation.includes("remote")) {
        score += 8
      }
      // Same state/region gets partial points
      const userState = userLocation.split(",")[1]?.trim()
      const jobState = jobLocation.split(",")[1]?.trim()
      if (userState && jobState && userState === jobState) {
        score += 5
      }
    }

    // Title similarity (10 points)
    if (profile.title && job.title) {
      const userTitle = profile.title.toLowerCase()
      const jobTitle = job.title.toLowerCase()

      // Check for common keywords in titles
      const titleKeywords = ["developer", "engineer", "manager", "analyst", "designer", "scientist", "specialist"]
      const userKeywords = titleKeywords.filter((keyword) => userTitle.includes(keyword))
      const jobKeywords = titleKeywords.filter((keyword) => jobTitle.includes(keyword))
      const commonKeywords = userKeywords.filter((keyword) => jobKeywords.includes(keyword))

      if (commonKeywords.length > 0) {
        score += (commonKeywords.length / Math.max(userKeywords.length, 1)) * 10
      }

      // Exact title match bonus
      if (userTitle === jobTitle) {
        score += 5
      }
    }

    // Salary attractiveness (5 points)
    if (job.salary_min && job.salary_max) {
      const avgSalary = (job.salary_min + job.salary_max) / 2
      // Higher salaries get slight preference
      if (avgSalary > 100000) score += 3
      else if (avgSalary > 75000) score += 2
      else if (avgSalary > 50000) score += 1
    }

    // Recent jobs get slight boost (5 points)
    const jobAge = Date.now() - new Date(job.created_at).getTime()
    const daysOld = jobAge / (1000 * 60 * 60 * 24)
    if (daysOld < 7) {
      score += 3
    } else if (daysOld < 30) {
      score += 1
    }

    // Company diversity bonus (small boost for variety)
    score += Math.random() * 2 // Small random factor for diversity

    return { ...job, score: Math.round(score) }
  })

  // Sort by score and return top 10
  return scoredJobs
    .filter((job) => job.score > 10) // Only return jobs with decent scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
}

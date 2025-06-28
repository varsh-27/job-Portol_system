"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  User,
  FileText,
  Star,
  LogOut,
  Settings,
  Zap,
  TrendingUp,
  Calendar,
  Award,
  Filter,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

interface Job {
  id: number
  title: string
  company_name: string
  location: string
  job_type: string
  salary_min: number
  salary_max: number
  description: string
  skills_required: string[]
  created_at: string
  score?: number
}

interface Application {
  id: number
  job_title: string
  company_name: string
  status: string
  applied_at: string
}

interface RecommendationsResponse {
  recommendations: Job[]
  aiPowered: boolean
}

export default function JobSeekerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [recommendations, setRecommendations] = useState<Job[]>([])
  const [aiPowered, setAiPowered] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [jobTypeFilter, setJobTypeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [applying, setApplying] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      initializeDashboard(parsedUser.id)
    } else {
      router.push("/auth/login")
    }
  }, [router])

  const initializeDashboard = async (userId: number) => {
    try {
      setError("")

      // Test database connection first
      const dbTest = await fetch("/api/test-db")
      if (!dbTest.ok) {
        const dbError = await dbTest.json()
        throw new Error(`Database connection failed: ${dbError.message}`)
      }

      // Fetch all data
      await Promise.all([fetchProfile(userId), fetchJobs(), fetchApplications(userId), fetchRecommendations(userId)])
    } catch (error) {
      console.error("Dashboard initialization error:", error)
      setError(error.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async (userId: number) => {
    try {
      const response = await fetch(`/api/profile/job-seeker?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      } else if (response.status !== 404) {
        // 404 is expected if profile doesn't exist yet
        const errorData = await response.json()
        console.error("Profile fetch error:", errorData)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs")
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      } else {
        const errorData = await response.json()
        console.error("Jobs fetch error:", errorData)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    }
  }

  const fetchApplications = async (userId: number) => {
    try {
      const response = await fetch(`/api/applications?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      } else {
        const errorData = await response.json()
        console.error("Applications fetch error:", errorData)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    }
  }

  const fetchRecommendations = async (userId: number) => {
    try {
      const response = await fetch(`/api/recommendations?userId=${userId}`)
      if (response.ok) {
        const data: RecommendationsResponse = await response.json()
        setRecommendations(data.recommendations || [])
        setAiPowered(data.aiPowered)
      } else {
        const errorData = await response.json()
        console.error("Recommendations fetch error:", errorData)
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const applyToJob = async (jobId: number) => {
    if (!user || !profile) {
      setError("Please complete your profile before applying to jobs")
      return
    }

    setApplying(jobId)
    setError("")

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          jobSeekerId: profile.id,
          coverLetter: "",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh applications and jobs
        await Promise.all([fetchApplications(user.id), fetchJobs()])

        // Show success message (you could add a toast notification here)
        console.log("Application submitted successfully")
      } else {
        setError(data.error || "Failed to submit application")
      }
    } catch (error) {
      console.error("Error applying to job:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setApplying(null)
    }
  }

  const retryInitialization = () => {
    if (user) {
      setLoading(true)
      initializeDashboard(user.id)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation =
      locationFilter === "all" || job.location.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesType = jobTypeFilter === "all" || job.job_type === jobTypeFilter
    return matchesSearch && matchesLocation && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "shortlisted":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "hired":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <Button onClick={retryInitialization} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </Button>
                <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                  Go to Homepage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-3">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">JobPortal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-white/50 rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {profile?.first_name || user?.email?.split("@")[0]}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="hover:bg-white/50">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-white/50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.first_name || "Job Seeker"}! 👋
          </h2>
          <p className="text-gray-600">Ready to find your next opportunity?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recommendations</p>
                  <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm p-1 rounded-xl">
            <TabsTrigger value="jobs" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Browse Jobs
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Recommendations
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              My Applications
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Browse Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            {/* Search and Filters */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder="Search jobs, companies, or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 border-0 bg-gray-50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="w-48 h-12 border-0 bg-gray-50">
                        <MapPin className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="san francisco">San Francisco</SelectItem>
                        <SelectItem value="new york">New York</SelectItem>
                        <SelectItem value="seattle">Seattle</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                      <SelectTrigger className="w-48 h-12 border-0 bg-gray-50">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Job Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Jobs List */}
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{job.company_name[0]}</span>
                          </div>
                          <div>
                            <CardTitle className="text-xl text-gray-900">{job.title}</CardTitle>
                            <CardDescription className="text-lg font-medium text-gray-700">
                              {job.company_name}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => applyToJob(job.id)}
                        disabled={applying === job.id || !profile}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50"
                      >
                        {applying === job.id ? "Applying..." : "Apply Now"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {job.job_type}
                      </div>
                      {job.salary_min && job.salary_max && (
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-1" />${job.salary_min.toLocaleString()} - $
                          {job.salary_max.toLocaleString()}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-2 leading-relaxed">{job.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills_required?.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills_required?.length > 5 && (
                        <Badge variant="outline" className="text-gray-500">
                          +{job.skills_required.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredJobs.length === 0 && jobs.length > 0 && (
                <div className="text-center py-16">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </div>
              )}

              {jobs.length === 0 && (
                <div className="text-center py-16">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
                  <p className="text-gray-600">Check back later for new opportunities</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Other tabs remain the same... */}
          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="text-center py-12">
              <div className="flex justify-center items-center mb-6">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                  <Zap className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Job Recommendations</h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Our intelligent algorithm analyzes your skills, experience, and preferences to find the perfect job
                matches
              </p>

              <Alert className="max-w-3xl mx-auto mb-8 border-0 bg-gradient-to-r from-blue-50 to-purple-50">
                <Zap className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-base">
                  <strong className="text-blue-800">Smart Matching:</strong> Our advanced algorithm considers skills
                  alignment, experience level, location preferences, title similarity, and more to provide personalized
                  recommendations with match scores.
                </AlertDescription>
              </Alert>
            </div>

            <div className="grid gap-6">
              {recommendations.map((job, index) => (
                <Card
                  key={job.id}
                  className="card-hover border-l-4 border-l-blue-500 shadow-lg bg-white/80 backdrop-blur-sm"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{job.company_name[0]}</span>
                          </div>
                          <div>
                            <CardTitle className="text-xl flex items-center gap-3">
                              {job.title}
                              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0">
                                <Award className="h-3 w-3 mr-1" />
                                AI Match
                              </Badge>
                              {job.score && (
                                <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                                  {job.score}% match
                                </Badge>
                              )}
                              {index < 3 && (
                                <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-0">
                                  Top Pick
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-lg font-medium text-gray-700">
                              {job.company_name}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => applyToJob(job.id)}
                        disabled={applying === job.id || !profile}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50"
                      >
                        {applying === job.id ? "Applying..." : "Apply Now"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {job.job_type}
                      </div>
                      {job.salary_min && job.salary_max && (
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-1" />${job.salary_min.toLocaleString()} - $
                          {job.salary_max.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">{job.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills_required?.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {recommendations.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Recommendations Yet</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Complete your profile with skills and experience to get personalized job recommendations.
                  </p>
                  <Button
                    onClick={() => router.push("/profile/job-seeker/setup")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Complete Profile
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="grid gap-4">
              {applications.map((application) => (
                <Card key={application.id} className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{application.job_title}</h3>
                            <p className="text-gray-600 font-medium">{application.company_name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center mt-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          Applied on {new Date(application.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(application.status)} font-medium px-3 py-1`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {applications.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Applications Yet</h3>
                  <p className="text-gray-600 mb-8">Start applying to jobs to see your applications here.</p>
                  <Button
                    onClick={() => router.push("#jobs")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Browse Jobs
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {profile ? (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</Label>
                      <p className="text-xl font-semibold text-gray-900">
                        {profile.first_name} {profile.last_name}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Professional Title
                      </Label>
                      <p className="text-xl font-semibold text-gray-900">{profile.title}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Location</Label>
                      <p className="text-lg text-gray-700 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        {profile.location}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Experience</Label>
                      <p className="text-lg text-gray-700 flex items-center">
                        <Award className="h-4 w-4 mr-2 text-gray-500" />
                        {profile.experience_years} years
                      </p>
                    </div>
                  </div>

                  {profile.bio && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Professional Summary
                      </Label>
                      <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">{profile.bio}</p>
                    </div>
                  )}

                  {profile.skills && profile.skills.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Skills</Label>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill: string) => (
                          <Badge
                            key={skill}
                            className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 px-3 py-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.education && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Education</Label>
                      <p className="text-lg text-gray-700">{profile.education}</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-6 border-t">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Edit Profile
                    </Button>
                    {profile.resume_url && (
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <FileText className="h-4 w-4 mr-2" />
                        View Resume
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Complete Your Profile</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Set up your profile to get better job recommendations and attract employers.
                </p>
                <Button
                  onClick={() => router.push("/profile/job-seeker/setup")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Complete Profile
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Label({ className, children, ...props }: any) {
  return (
    <label className={`block text-sm font-medium ${className || ""}`} {...props}>
      {children}
    </label>
  )
}

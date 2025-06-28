"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Briefcase, Users, FileText, Settings, LogOut, MapPin, Clock, DollarSign, Eye } from "lucide-react"

interface Job {
  id: number
  title: string
  description: string
  location: string
  job_type: string
  salary_min: number
  salary_max: number
  applications_count: number
  status: string
  created_at: string
}

interface Application {
  id: number
  job_title: string
  first_name: string
  last_name: string
  candidate_title: string
  status: string
  applied_at: string
  resume_url: string
}

export default function RecruiterDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [showJobDialog, setShowJobDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    jobType: "full-time",
    salaryMin: "",
    salaryMax: "",
    experienceRequired: 0,
    skillsRequired: [] as string[],
  })
  const [newSkill, setNewSkill] = useState("")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchProfile(parsedUser.id)
      fetchJobs(parsedUser.id)
      fetchApplications(parsedUser.id)
    } else {
      router.push("/auth/login")
    }
  }, [router])

  const fetchProfile = async (userId: number) => {
    try {
      const response = await fetch(`/api/profile/recruiter?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const fetchJobs = async (userId: number) => {
    try {
      // First get recruiter ID
      const profileResponse = await fetch(`/api/profile/recruiter?userId=${userId}`)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        const recruiterId = profileData.profile?.id

        if (recruiterId) {
          const response = await fetch(`/api/jobs?recruiterId=${recruiterId}`)
          if (response.ok) {
            const data = await response.json()
            setJobs(data.jobs)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async (userId: number) => {
    try {
      const profileResponse = await fetch(`/api/profile/recruiter?userId=${userId}`)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        const recruiterId = profileData.profile?.id

        if (recruiterId) {
          const response = await fetch(`/api/applications?recruiterId=${recruiterId}`)
          if (response.ok) {
            const data = await response.json()
            setApplications(data.applications)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleJobFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setJobForm((prev) => ({
      ...prev,
      [name]: name === "experienceRequired" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !jobForm.skillsRequired.includes(newSkill.trim())) {
      setJobForm((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setJobForm((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profile) return

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recruiterId: profile.id,
          title: jobForm.title,
          description: jobForm.description,
          requirements: jobForm.requirements,
          location: jobForm.location,
          jobType: jobForm.jobType,
          salaryMin: jobForm.salaryMin ? Number.parseInt(jobForm.salaryMin) : null,
          salaryMax: jobForm.salaryMax ? Number.parseInt(jobForm.salaryMax) : null,
          experienceRequired: jobForm.experienceRequired,
          skillsRequired: jobForm.skillsRequired,
        }),
      })

      if (response.ok) {
        setShowJobDialog(false)
        setJobForm({
          title: "",
          description: "",
          requirements: "",
          location: "",
          jobType: "full-time",
          salaryMin: "",
          salaryMax: "",
          experienceRequired: 0,
          skillsRequired: [],
        })
        fetchJobs(user.id)
      }
    } catch (error) {
      console.error("Error creating job:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "reviewed":
        return "bg-blue-100 text-blue-800"
      case "shortlisted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "hired":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">JobPortal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {profile?.contact_name || user?.email}</span>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{jobs.filter((j) => j.status === "active").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {applications.filter((a) => a.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="jobs">My Jobs</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="profile">Company Profile</TabsTrigger>
            </TabsList>

            <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post a New Job</DialogTitle>
                  <DialogDescription>Fill out the details to post a new job opening</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmitJob} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input id="title" name="title" value={jobForm.title} onChange={handleJobFormChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={jobForm.description}
                      onChange={handleJobFormChange}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements *</Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      value={jobForm.requirements}
                      onChange={handleJobFormChange}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        name="location"
                        value={jobForm.location}
                        onChange={handleJobFormChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type *</Label>
                      <Select
                        value={jobForm.jobType}
                        onValueChange={(value) => setJobForm((prev) => ({ ...prev, jobType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaryMin">Minimum Salary</Label>
                      <Input
                        id="salaryMin"
                        name="salaryMin"
                        type="number"
                        value={jobForm.salaryMin}
                        onChange={handleJobFormChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salaryMax">Maximum Salary</Label>
                      <Input
                        id="salaryMax"
                        name="salaryMax"
                        type="number"
                        value={jobForm.salaryMax}
                        onChange={handleJobFormChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceRequired">Years of Experience Required</Label>
                    <Input
                      id="experienceRequired"
                      name="experienceRequired"
                      type="number"
                      min="0"
                      value={jobForm.experienceRequired}
                      onChange={handleJobFormChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Required Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {jobForm.skillsRequired.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="ml-1 text-xs">
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowJobDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Post Job</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="grid gap-6">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.job_type}
                          </span>
                          {job.salary_min && job.salary_max && (
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />${job.salary_min.toLocaleString()} - $
                              {job.salary_max.toLocaleString()}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={job.status === "active" ? "default" : "secondary"}>{job.status}</Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        {job.applications_count} applications • Posted {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {jobs.length === 0 && (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Posted Yet</h3>
                  <p className="text-gray-600 mb-4">Start by posting your first job opening.</p>
                  <Button onClick={() => setShowJobDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="grid gap-4">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {application.first_name} {application.last_name}
                        </h3>
                        <p className="text-gray-600">{application.candidate_title}</p>
                        <p className="text-sm text-gray-500 mt-1">Applied for: {application.job_title}</p>
                        <p className="text-sm text-gray-500">
                          Applied on {new Date(application.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                        {application.resume_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 mr-2" />
                              Resume
                            </a>
                          </Button>
                        )}
                        <Button size="sm">Review</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {applications.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600">
                    Applications will appear here once candidates start applying to your jobs.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {profile ? (
              <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Company Name</Label>
                      <p className="text-lg">{profile.company_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Contact Person</Label>
                      <p className="text-lg">{profile.contact_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Industry</Label>
                      <p>{profile.industry}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Company Size</Label>
                      <p>{profile.company_size}</p>
                    </div>
                  </div>

                  {profile.company_description && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Company Description</Label>
                      <p className="text-gray-700">{profile.company_description}</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button variant="outline">Edit Profile</Button>
                    {profile.company_website && (
                      <Button variant="outline" asChild>
                        <a href={profile.company_website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Your Company Profile</h3>
                <p className="text-gray-600 mb-4">Set up your company profile to attract the best candidates.</p>
                <Button onClick={() => router.push("/profile/recruiter/setup")}>Complete Profile</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

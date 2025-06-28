import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Briefcase, TrendingUp, Star, Zap, Shield, Globe } from "lucide-react"

export default function HomePage() {
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
            <div className="flex space-x-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="hover:bg-white/50">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-float">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              AI-Powered Job Matching
            </Badge>
          </div>
          <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your Dream Job or
            <span className="gradient-text block">Perfect Candidate</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Connect with top employers and talented professionals. Our intelligent platform uses advanced algorithms to
            match you with the best opportunities based on your skills and preferences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link href="/auth/register?type=job_seeker">
              <Button
                size="lg"
                className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl"
              >
                <Search className="h-5 w-5 mr-2" />
                Find Jobs
              </Button>
            </Link>
            <Link href="/auth/register?type=recruiter">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg border-2 hover:bg-white/50 shadow-lg bg-transparent"
              >
                <Users className="h-5 w-5 mr-2" />
                Post Jobs
              </Button>
            </Link>
          </div>

          {/* Floating Elements */}
          <div className="relative">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow animation-delay-2000"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-0">
              Why Choose Us
            </Badge>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Powerful Features for Modern Hiring</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced technology meets intuitive design to create the ultimate job search and recruitment experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-4">AI-Powered Matching</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Our intelligent algorithm analyzes skills, experience, and preferences to create perfect matches
                  between candidates and opportunities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-4">Smart Profile Builder</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Create comprehensive profiles with resume upload, skill tracking, and portfolio showcase to attract
                  the right opportunities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-4">Real-time Tracking</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Track applications, manage recruitment pipelines, and get insights with our comprehensive analytics
                  dashboard.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Trusted by Thousands</h3>
            <p className="text-xl opacity-90">Join our growing community of successful professionals and companies</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="glass-effect rounded-2xl p-8">
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-lg opacity-90">Active Jobs</div>
            </div>
            <div className="glass-effect rounded-2xl p-8">
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-lg opacity-90">Job Seekers</div>
            </div>
            <div className="glass-effect rounded-2xl p-8">
              <div className="text-5xl font-bold mb-2">5K+</div>
              <div className="text-lg opacity-90">Companies</div>
            </div>
            <div className="glass-effect rounded-2xl p-8">
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-90">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Built for Trust & Security</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your data and privacy are our top priorities. We use enterprise-grade security to protect your
              information.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Secure & Private</h4>
              <p className="text-gray-600">End-to-end encryption and privacy-first design</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Global Reach</h4>
              <p className="text-gray-600">Connect with opportunities worldwide</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-3">5-Star Support</h4>
              <p className="text-gray-600">24/7 customer support when you need it</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Transform Your Career?</h3>
          <p className="text-xl mb-10 opacity-90">
            Join thousands of professionals who have found their dream jobs through our platform
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/register?type=job_seeker">
              <Button
                size="lg"
                className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Start Job Search
              </Button>
            </Link>
            <Link href="/auth/register?type=recruiter">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
              >
                Hire Talent
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-3">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">JobPortal</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Connecting talent with opportunity through intelligent matching. The future of recruitment is here.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">For Job Seekers</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white cursor-pointer">Browse Jobs</li>
                <li className="hover:text-white cursor-pointer">Create Profile</li>
                <li className="hover:text-white cursor-pointer">Upload Resume</li>
                <li className="hover:text-white cursor-pointer">Track Applications</li>
                <li className="hover:text-white cursor-pointer">Career Advice</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">For Employers</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white cursor-pointer">Post Jobs</li>
                <li className="hover:text-white cursor-pointer">Find Candidates</li>
                <li className="hover:text-white cursor-pointer">Manage Applications</li>
                <li className="hover:text-white cursor-pointer">Company Profile</li>
                <li className="hover:text-white cursor-pointer">Recruitment Tools</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white cursor-pointer">Help Center</li>
                <li className="hover:text-white cursor-pointer">Contact Us</li>
                <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer">Terms of Service</li>
                <li className="hover:text-white cursor-pointer">API Documentation</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 JobPortal. All rights reserved. Made with ❤️ for the future of work.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

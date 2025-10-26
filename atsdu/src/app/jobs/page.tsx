"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Calendar, Search } from "lucide-react"

export default function JobsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      salary: "$120k - $160k",
      description: "Build amazing user interfaces with React and TypeScript",
      postedDate: "2 days ago",
      deadline: "5 days",
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      company: "StartUp XYZ",
      location: "Remote",
      salary: "$100k - $140k",
      description: "Work on our next-generation platform",
      postedDate: "1 week ago",
      deadline: "10 days",
    },
    {
      id: 3,
      title: "Product Manager",
      company: "Innovation Labs",
      location: "New York, NY",
      salary: "$110k - $150k",
      description: "Lead product strategy and development",
      postedDate: "3 days ago",
      deadline: "7 days",
    },
  ]

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Job Opportunities</h1>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>{job.company}</CardDescription>
                  </div>
                  <Badge variant="outline">{job.postedDate}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{job.description}</p>
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Deadline: {job.deadline}
                  </div>
                </div>
                <Button>Apply Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

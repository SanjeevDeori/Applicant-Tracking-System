"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Eye } from "lucide-react"

export default function OpportunitiesPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "alumni")) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const opportunities = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "Tech Corp",
      views: 234,
      applications: 12,
      status: "active",
      postedDate: "2024-01-15",
    },
    {
      id: 2,
      title: "Product Manager",
      company: "StartUp XYZ",
      views: 156,
      applications: 8,
      status: "active",
      postedDate: "2024-01-10",
    },
    {
      id: 3,
      title: "Data Scientist",
      company: "Analytics Inc",
      views: 89,
      applications: 5,
      status: "closed",
      postedDate: "2024-01-01",
    },
  ]

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Posted Opportunities</h1>
            <p className="text-muted-foreground">Manage your job postings</p>
          </div>
          <Button>Post New Opportunity</Button>
        </div>

        <div className="space-y-4">
          {opportunities.map((opp) => (
            <Card key={opp.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{opp.title}</CardTitle>
                    <CardDescription>{opp.company}</CardDescription>
                  </div>
                  <Badge variant={opp.status === "active" ? "default" : "secondary"}>{opp.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>{opp.views} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{opp.applications} applications</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Applications
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

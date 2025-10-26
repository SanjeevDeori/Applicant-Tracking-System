"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, MessageSquare, Award } from "lucide-react"

export default function AlumniDashboardPage() {
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

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background">
        <DashboardHeader />

        {/* Alumni Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Mentees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Active mentoring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Job Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Posted opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Endorsements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">From mentees</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Mentees</CardTitle>
              <CardDescription>Students you're currently mentoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between pb-4 border-b last:border-0">
                    <div>
                      <p className="font-medium">Student Name {i}</p>
                      <p className="text-sm text-muted-foreground">Mentoring since Jan 2024</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Message
                    </Button>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-transparent" variant="outline">
                View All Mentees
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Posted Opportunities</CardTitle>
              <CardDescription>Job openings you've shared</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="pb-4 border-b last:border-0">
                    <p className="font-medium">Senior Developer Role</p>
                    <p className="text-sm text-muted-foreground">Your Company Inc.</p>
                    <p className="text-xs text-muted-foreground mt-1">5 applications received</p>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-transparent" variant="outline">
                Post New Opportunity
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent interactions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Student Name</span> applied for your posted opportunity
                      </p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

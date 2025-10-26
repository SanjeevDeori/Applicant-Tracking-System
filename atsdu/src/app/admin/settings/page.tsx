"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings</p>
        </div>

        <div className="space-y-6 max-w-2xl">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" defaultValue="ATS Platform" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" type="email" defaultValue="support@ats.com" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Enable Email Notifications</Label>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="application-emails">Send Application Updates</Label>
                <Switch id="application-emails" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <Switch id="weekly-digest" defaultChecked />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage security policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="two-factor">Require Two-Factor Authentication</Label>
                <Switch id="two-factor" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                <Input type="number" defaultValue="90" className="w-20" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input type="number" defaultValue="30" className="w-20" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

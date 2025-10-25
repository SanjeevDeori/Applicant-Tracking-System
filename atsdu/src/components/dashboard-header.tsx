"use client"

import { useAuth } from "@/context/auth-context"
import { Card } from "@/components/ui/card"

export function DashboardHeader() {
  const { user } = useAuth()

  return (
    <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 mb-6">
      <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
      <p className="text-primary-foreground/80">
        {user?.role === "student"
          ? "Explore job opportunities and track your applications"
          : user?.role === "alumni"
            ? "Connect with opportunities and mentor students"
            : "Manage users and system settings"}
      </p>
    </Card>
  )
}

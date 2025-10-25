"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Calendar, Briefcase } from "lucide-react"

interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  description: string
  postedDate: string
  deadline: string
  applicants?: number
  onApply?: () => void
  onViewDetails?: () => void
  showApplicants?: boolean
}

export function JobCard({
  id,
  title,
  company,
  location,
  salary,
  description,
  postedDate,
  deadline,
  applicants,
  onApply,
  onViewDetails,
  showApplicants,
}: JobCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>{company}</CardDescription>
          </div>
          <Badge variant="outline">{postedDate}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4 text-foreground/80">{description}</p>
        <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {location}
          </div>
          {salary && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {salary}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Deadline: {deadline}
          </div>
          {showApplicants && applicants !== undefined && (
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {applicants} applicants
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {onApply && <Button onClick={onApply}>Apply Now</Button>}
          {onViewDetails && (
            <Button variant="outline" onClick={onViewDetails}>
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

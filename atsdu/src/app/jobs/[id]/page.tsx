"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  DollarSign,
  Calendar,
  Building2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function JobDetailPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const job = {
    id: params.id,
    title: "Senior Frontend Developer",
    company: "Tech Corp",
    location: "San Francisco, CA",
    salary: "$120k - $160k",
    description: "Build amazing user interfaces with React and TypeScript",
    fullDescription: `We are looking for an experienced Senior Frontend Developer to join our team. You will be responsible for building and maintaining our web applications using modern technologies like React, TypeScript, and Tailwind CSS.

Key Responsibilities:
- Design and implement user interfaces
- Collaborate with backend developers and designers
- Optimize application performance
- Mentor junior developers
- Participate in code reviews

Requirements:
- 5+ years of frontend development experience
- Strong knowledge of React and TypeScript
- Experience with modern CSS frameworks
- Understanding of web performance optimization
- Excellent communication skills`,
    postedDate: "2 days ago",
    deadline: "5 days",
    applicants: 24,
    requirements: ["React", "TypeScript", "Tailwind CSS", "REST APIs", "Git"],
  };

  const handleApply = () => {
    setHasApplied(true);
    // API call would go here
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background">
        <Link
          href="/jobs"
          className="flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">{job.title}</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {job.company}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{job.postedDate}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Deadline: {job.deadline}
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    {job.applicants} applicants
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {job.fullDescription}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req) => (
                    <Badge key={req} variant="secondary">
                      {req}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {!hasApplied ? (
              <Card>
                <CardHeader>
                  <CardTitle>Apply Now</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cover Letter</label>
                    <Textarea
                      placeholder="Tell us why you're interested in this position..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="min-h-32"
                    />
                  </div>
                  <Button className="w-full" onClick={handleApply}>
                    Submit Application
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-success/20 bg-success/5">
                <CardHeader>
                  <CardTitle className="text-success">
                    Application Submitted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-success/80">
                    Your application has been successfully submitted. We'll
                    review it and get back to you soon.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>About {job.company}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tech Corp is a leading technology company specializing in
                  innovative software solutions. We're committed to building
                  great products and fostering a collaborative work environment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  GraduationCap,
  Calendar,
  BookOpen,
  User,
} from "lucide-react";

export default function SignupPage() {
  const [currentStage, setCurrentStage] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "alumni" | "admin">("student");
  const [grade10, setGrade10] = useState("75");
  const [grade12, setGrade12] = useState("75");
  const [courseName, setCourseName] = useState("Bachelor of Technology");
  const [courseStartDate, setCourseStartDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup, error } = useAuth();
  const router = useRouter();

  const handleContinue = () => {
    // Validate first stage fields
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      return;
    }
    setCurrentStage(2);
  };

  const handleBack = () => {
    setCurrentStage(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create full name from first and last name
    const fullName = `${firstName} ${lastName}`.trim();

    setIsLoading(true);
    try {
      // Pass the additional fields to the signup function
      await signup(email, password, fullName, role, {
        firstName,
        lastName,
        mobileNumber,
        grade10: parseFloat(grade10),
        grade12: parseFloat(grade12),
        courseName,
        courseStartDate: courseStartDate || new Date().toISOString(),
      });
      router.push("/dashboard");
    } catch (err) {
      // Error is handled by context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join the ATS platform</CardDescription>
          {/* Progress indicator */}
          <div className="flex items-center space-x-2 mt-4">
            <div
              className={`h-2 w-full rounded-full ${
                currentStage >= 1 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`h-2 w-full rounded-full ${
                currentStage >= 2 ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Step {currentStage} of 2
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {currentStage === 1 ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Personal Information</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-medium text-foreground"
                    >
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-medium text-foreground"
                    >
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password *
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleContinue}
                  className="w-full"
                  disabled={
                    !firstName.trim() ||
                    !lastName.trim() ||
                    !email.trim() ||
                    !password.trim()
                  }
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">
                    Academic Information
                  </h3>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>

              {/* Contact & Account Information */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact & Account Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="mobileNumber"
                        className="text-sm font-medium text-foreground"
                      >
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="mobileNumber"
                          type="tel"
                          placeholder="1234567890"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          required
                          minLength={10}
                          maxLength={10}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        10 digits only
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="role"
                        className="text-sm font-medium text-foreground"
                      >
                        Account Type *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Select
                          value={role}
                          onValueChange={(value) =>
                            setRole(value as "student" | "alumni")
                          }
                        >
                          <SelectTrigger id="role" className="pl-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="alumni">Alumni</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Performance */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Academic Performance
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="grade10"
                        className="text-sm font-medium text-foreground"
                      >
                        Grade 10 Percentage
                      </label>
                      <Input
                        id="grade10"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="75"
                        value={grade10}
                        onChange={(e) => setGrade10(e.target.value)}
                        className="text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="grade12"
                        className="text-sm font-medium text-foreground"
                      >
                        Grade 12 Percentage
                      </label>
                      <Input
                        id="grade12"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="75"
                        value={grade12}
                        onChange={(e) => setGrade12(e.target.value)}
                        className="text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Course Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Course Information
                  </h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="courseName"
                        className="text-sm font-medium text-foreground"
                      >
                        Course Name
                      </label>
                      <Input
                        id="courseName"
                        type="text"
                        placeholder="Bachelor of Technology"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="courseStartDate"
                        className="text-sm font-medium text-foreground"
                      >
                        Course Start Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="courseStartDate"
                          type="date"
                          value={courseStartDate}
                          onChange={(e) => setCourseStartDate(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Complete Registration"}
                </Button>
              </div>
            </form>
          )}

          <p className="text-sm text-muted-foreground text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

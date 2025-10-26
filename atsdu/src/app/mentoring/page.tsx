"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Search, Star, MessageCircle } from "lucide-react";

export default function MentoringPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "alumni")) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const mentees = [
    {
      id: 1,
      name: "Alex Johnson",
      major: "Computer Science",
      status: "active",
      rating: 4.8,
      lastContact: "2 days ago",
    },
    {
      id: 2,
      name: "Sarah Chen",
      major: "Software Engineering",
      status: "active",
      rating: 4.9,
      lastContact: "1 day ago",
    },
    {
      id: 3,
      name: "Mike Davis",
      major: "Data Science",
      status: "inactive",
      rating: 4.7,
      lastContact: "1 week ago",
    },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Mentoring</h1>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search mentees..." className="pl-10" />
            </div>
            <Button>Add Mentee</Button>
          </div>
        </div>

        <div className="space-y-4">
          {mentees.map((mentee) => (
            <Card key={mentee.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{mentee.name}</CardTitle>
                    <CardDescription>{mentee.major}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      mentee.status === "active" ? "default" : "secondary"
                    }
                  >
                    {mentee.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning fill-warning" />
                      <span>{mentee.rating}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Last contact: {mentee.lastContact}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

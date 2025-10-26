"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Trash2, Edit2 } from "lucide-react";

export default function UsersPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
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

  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "student",
      joinDate: "2024-01-15",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "alumni",
      joinDate: "2024-01-10",
      status: "active",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "student",
      joinDate: "2024-01-05",
      status: "inactive",
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah@example.com",
      role: "alumni",
      joinDate: "2023-12-20",
      status: "active",
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-primary/10 text-primary";
      case "alumni":
        return "bg-info/10 text-info";
      case "admin":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-background">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">User Management</h1>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button>Add User</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Manage all system users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Join Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{u.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getRoleColor(u.role)}>{u.role}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {u.joinDate}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            u.status === "active" ? "default" : "secondary"
                          }
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

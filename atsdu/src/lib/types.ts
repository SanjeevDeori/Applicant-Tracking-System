export type UserRole = "student" | "alumni" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: string
}

export interface SignupAdditionalFields {
  firstName?: string
  lastName?: string
  mobileNumber?: string
  grade10?: number
  grade12?: number
  courseName?: string
  courseStartDate?: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, role: UserRole, additionalFields?: SignupAdditionalFields) => Promise<void>
  logout: () => Promise<void>
  error: string | null
}

export interface Job {
  id: string
  title: string
  company: string
  description: string
  location: string
  salary?: string
  postedDate: string
  deadline: string
  status: "open" | "closed"
}

export interface Application {
  id: string
  jobId: string
  userId: string
  status: "pending" | "reviewed" | "accepted" | "rejected"
  appliedDate: string
  resume?: string
}

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  dueDate: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  roomId: string
}

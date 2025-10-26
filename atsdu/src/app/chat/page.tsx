"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatProvider } from "@/context/chat-context"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatWindow } from "@/components/chat-window"

export default function ChatPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ChatProvider>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 h-screen flex flex-col md:flex-row bg-background">
          <ChatSidebar />
          <ChatWindow />
        </main>
      </div>
    </ChatProvider>
  )
}

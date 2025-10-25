"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Share2, Users } from "lucide-react"

interface CollaborationPanelProps {
  taskId: string
  collaborators: Array<{ id: string; name: string; avatar?: string }>
  comments: Array<{ id: string; author: string; text: string; timestamp: string }>
}

export function CollaborationPanel({ taskId, collaborators, comments }: CollaborationPanelProps) {
  return (
    <div className="space-y-4">
      {/* Collaborators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaborators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            {collaborators.map((collab) => (
              <Avatar key={collab.id} className="h-8 w-8">
                <AvatarFallback>{collab.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Button size="sm" variant="outline" className="w-full gap-2 bg-transparent">
            <Share2 className="h-4 w-4" />
            Add Collaborator
          </Button>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <p className="font-medium">{comment.author}</p>
                <p className="text-muted-foreground text-xs">{comment.timestamp}</p>
                <p className="mt-1">{comment.text}</p>
              </div>
            ))}
          </div>
          <Input placeholder="Add a comment..." className="text-sm" />
        </CardContent>
      </Card>
    </div>
  )
}

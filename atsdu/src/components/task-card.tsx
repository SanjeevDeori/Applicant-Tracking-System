"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, CheckCircle2, Circle } from "lucide-react";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  onStatusChange?: (status: string) => void;
  onEdit?: () => void;
}

export function TaskCard({
  id,
  title,
  description,
  assignedTo,
  dueDate,
  status,
  priority,
  onStatusChange,
  onEdit,
}: TaskCardProps) {
  const getPriorityColor = (p: string) => {
    switch (p) {
      case "high":
        return "bg-destructive/10 text-destructive";
      case "medium":
        return "bg-warning/10 text-warning";
      case "low":
        return "bg-success/10 text-success";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "in-progress":
        return <Circle className="h-5 w-5 text-primary fill-primary" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-1">{getStatusIcon(status)}</div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <Badge className={getPriorityColor(priority)}>{priority}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {assignedTo}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {dueDate}
              </div>
            </div>
            <div className="flex gap-2">
              {status !== "completed" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onStatusChange?.(
                      status === "todo" ? "in-progress" : "completed"
                    )
                  }
                >
                  {status === "todo" ? "Start" : "Complete"}
                </Button>
              )}
              {onEdit && (
                <Button size="sm" variant="ghost" onClick={onEdit}>
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

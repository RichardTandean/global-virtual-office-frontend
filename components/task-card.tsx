"use client"

import { useState } from "react"
import { TaskItem, statusLabels, statusColors } from "@/types/task"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import TaskDetailModal from "./task-detail-modal"
import { Video, AlertTriangle, Clock, Eye } from "lucide-react"

interface TaskCardProps {
  task: TaskItem
  onUpdated: () => void
  canCreate?: boolean
  userRole?: string
}

export default function TaskCard({ task, onUpdated, canCreate, userRole }: TaskCardProps) {
  const [open, setOpen] = useState(false)
  const isReviewer = userRole === "KoreaTeam" || userRole === "Admin"
  const isEditor = userRole === "Editor"

  const deadlineDate = task.deadline ? new Date(task.deadline) : null
  const deadlineValid = deadlineDate && !isNaN(deadlineDate.getTime())
  const deadlineText = deadlineValid
    ? deadlineDate!.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : null

  const isOverdue = deadlineValid && task.status !== "Completed" && deadlineDate! < new Date()

  const videoCount = (task as any).videoSubmissions?.length || 0
  const pendingVideoCount = (task as any).videoSubmissions?.filter((v: any) => v.status === "Pending")?.length || 0
  const needsReview = task.status === "NeedToBeReviewed" || task.status === "Review"

  return (
    <>
      <Card className="cursor-pointer hover:shadow-sm transition-shadow relative" onClick={() => setOpen(true)}>
        <CardContent className="p-3 md:p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-snug">{task.title}</h3>
            <Badge className={`shrink-0 text-[11px] ${statusColors[task.status]}`} variant="secondary">
              {statusLabels[task.status]}
            </Badge>
          </div>

          {task.description && (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {isReviewer && needsReview && (
              <Badge variant="secondary" className="text-[10px] gap-0.5 bg-purple-100 text-purple-700">
                <Eye className="h-3 w-3" />
                Perlu review
              </Badge>
            )}

            {isReviewer && pendingVideoCount > 0 && (
              <Badge variant="secondary" className="text-[10px] gap-0.5 bg-blue-100 text-blue-700">
                <Video className="h-3 w-3" />
                {pendingVideoCount} video baru
              </Badge>
            )}

            {isEditor && task.status === "Revise" && (
              <Badge variant="secondary" className="text-[10px] gap-0.5 bg-orange-100 text-orange-700">
                <AlertTriangle className="h-3 w-3" />
                Ada revisi
              </Badge>
            )}

            {isEditor && videoCount === 0 && (task.status === "Editing" || task.status === "Assigned") && (
              <Badge variant="secondary" className="text-[10px] gap-0.5 bg-zinc-100 text-zinc-600">
                <Video className="h-3 w-3" />
                Belum upload
              </Badge>
            )}

            {isOverdue && (
              <Badge variant="destructive" className="text-[10px] gap-0.5">
                <Clock className="h-3 w-3" />
                Terlambat
              </Badge>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{task.assignee.name}</span>
            {deadlineText && <span>{isOverdue ? "" : ""}{deadlineText}</span>}
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium">{task.progressPercent}%</span>
            </div>
            <Progress value={task.progressPercent} className="mt-1 h-1" />
          </div>
        </CardContent>
      </Card>

      {open && (
        <TaskDetailModal
          task={task}
          onClose={() => setOpen(false)}
          onUpdated={onUpdated}
          canCreate={canCreate}
          userRole={userRole}
        />
      )}
    </>
  )
}

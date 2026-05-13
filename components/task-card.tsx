"use client"

import { useState } from "react"
import { TaskItem } from "@/types/task"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusPill } from "@/components/ui/status-pill"
import TaskDetailModal from "./task-detail-modal"
import {
  Video,
  AlertTriangle,
  Clock,
  Eye,
  MessageSquare,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: TaskItem
  onUpdated: () => void
  canCreate?: boolean
  userRole?: string
}

function relativeDeadline(deadline: Date): {
  label: string
  tone: "muted" | "warn" | "danger"
} {
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  const dayMs = 24 * 60 * 60 * 1000
  const days = Math.round(diff / dayMs)
  if (diff < 0) {
    const overdue = Math.abs(days)
    return { label: overdue === 0 ? "Hari ini lewat" : `${overdue}h lewat`, tone: "danger" }
  }
  if (days === 0) return { label: "Hari ini", tone: "warn" }
  if (days === 1) return { label: "Besok", tone: "warn" }
  if (days <= 3) return { label: `${days} hari lagi`, tone: "warn" }
  if (days <= 7) return { label: `${days} hari lagi`, tone: "muted" }
  return {
    label: deadline.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    tone: "muted",
  }
}

export default function TaskCard({
  task,
  onUpdated,
  canCreate,
  userRole,
}: TaskCardProps) {
  const [open, setOpen] = useState(false)
  const isReviewer = userRole === "KoreaTeam" || userRole === "Admin"
  const isEditor = userRole === "Editor"

  const deadlineDate = task.deadline ? new Date(task.deadline) : null
  const deadlineValid = deadlineDate && !isNaN(deadlineDate.getTime())
  const isCompleted = task.status === "Completed"
  const deadlineInfo =
    deadlineValid && !isCompleted ? relativeDeadline(deadlineDate!) : null

  const videoCount = (task as any).videoSubmissions?.length || 0
  const pendingVideoCount =
    (task as any).videoSubmissions?.filter(
      (v: any) => v.status === "Pending"
    )?.length || 0
  const commentCount = (task as any)._count?.comments || 0
  const needsReview =
    task.status === "NeedToBeReviewed" || task.status === "Review"

  const initials = task.assignee.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative w-full text-left",
          "rounded-md border border-line bg-surface p-4",
          "transition-all duration-(--dur-base) ease-(--ease-out)",
          "hover:border-line-strong hover:bg-elevated hover:shadow-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[13px] font-semibold leading-snug text-ink line-clamp-2 flex-1">
            {task.title}
          </h3>
          <StatusPill status={task.status} size="sm" />
        </div>

        {task.description && (
          <p className="mt-2 text-[11px] leading-relaxed text-ink-secondary line-clamp-2">
            {task.description}
          </p>
        )}

        {(needsReview || pendingVideoCount > 0 || task.status === "Revise") && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {isReviewer && needsReview && (
              <span className="inline-flex items-center gap-1 rounded-xs bg-status-need-review/10 text-status-need-review px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                <Eye className="size-3" />
                Perlu review
              </span>
            )}
            {isReviewer && pendingVideoCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-xs bg-status-editing/10 text-status-editing px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                <Video className="size-3" />
                <span className="tabular-nums">{pendingVideoCount}</span> baru
              </span>
            )}
            {isEditor && task.status === "Revise" && (
              <span className="inline-flex items-center gap-1 rounded-xs bg-status-revise/10 text-status-revise px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                <AlertTriangle className="size-3" />
                Ada revisi
              </span>
            )}
            {isEditor &&
              videoCount === 0 &&
              (task.status === "Editing" || task.status === "Assigned") && (
                <span className="inline-flex items-center gap-1 rounded-xs bg-subtle text-ink-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                  <Video className="size-3" />
                  Belum upload
                </span>
              )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar size="xs">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="text-[11px] text-ink-secondary truncate">
              {task.assignee.name}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[10px] text-ink-muted shrink-0">
            {commentCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="size-3" />
                <span className="tabular-nums">{commentCount}</span>
              </span>
            )}
            {videoCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Video className="size-3" />
                <span className="tabular-nums">v{videoCount}</span>
              </span>
            )}
            {deadlineInfo && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  deadlineInfo.tone === "danger" && "text-status-danger",
                  deadlineInfo.tone === "warn" && "text-status-on-hold",
                  deadlineInfo.tone === "muted" && "text-ink-muted"
                )}
              >
                <Clock className="size-3" />
                {deadlineInfo.label}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-ink-muted">
            <span>{task.progressPercent}%</span>
            <ChevronRight className="size-3 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="h-px w-full bg-line overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-(--dur-base)"
              style={{ width: `${task.progressPercent}%` }}
            />
          </div>
        </div>
      </button>

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

"use client"

import { useState } from "react"
import { TaskItem, statusLabels, statusColors } from "@/types/task"
import TaskDetailModal from "./task-detail-modal"

interface TaskCardProps {
  task: TaskItem
  onUpdated: () => void
  canCreate?: boolean
  userRole?: string
}

export default function TaskCard({ task, onUpdated, canCreate, userRole }: TaskCardProps) {
  const [open, setOpen] = useState(false)

  const deadlineText = task.deadline
    ? new Date(task.deadline).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null

  const isOverdue =
    task.deadline &&
    task.status !== "Completed" &&
    new Date(task.deadline) < new Date()

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-900">{task.title}</h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              statusColors[task.status]
            }`}
          >
            {statusLabels[task.status]}
          </span>
        </div>

        {task.description && (
          <p className="mt-2 line-clamp-2 text-xs text-zinc-500">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
          <span>{task.assignee.name}</span>
          {deadlineText && (
            <span className={isOverdue ? "font-medium text-red-600" : ""}>
              {isOverdue ? "Terlambat: " : "Deadline: "}
              {deadlineText}
            </span>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Progress</span>
            <span className="font-medium text-zinc-700">{task.progressPercent}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-100">
            <div
              className="h-1.5 rounded-full bg-green-500 transition-all"
              style={{ width: `${task.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

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

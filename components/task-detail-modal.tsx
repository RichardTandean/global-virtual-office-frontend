"use client"

import { useState, useEffect, useCallback } from "react"
import { TaskItem, ProgressUpdateItem, statusLabels, statusColors } from "@/types/task"
import TaskTimer from "./task-timer"
import ProgressUpdateForm from "./progress-update-form"

interface TaskDetailModalProps {
  task: TaskItem
  onClose: () => void
  onUpdated: () => void
  canCreate?: boolean
}

export default function TaskDetailModal({
  task,
  onClose,
  onUpdated,
  canCreate,
}: TaskDetailModalProps) {
  const [detail, setDetail] = useState<TaskItem>(task)
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdateItem[]>([])

  const fetchDetail = useCallback(async () => {
    const res = await fetch(`/api/tasks/${task.id}`)
    if (res.ok) {
      const data = await res.json()
      setDetail(data)
    }
  }, [task.id])

  const fetchProgress = useCallback(async () => {
    const res = await fetch(`/api/tasks/${task.id}/progress`)
    if (res.ok) {
      const data = await res.json()
      setProgressUpdates(data)
    }
  }, [task.id])

  useEffect(() => {
    fetchDetail()
    fetchProgress()
  }, [fetchDetail, fetchProgress])

  async function handleStatusChange(newStatus: string) {
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        await fetchDetail()
        onUpdated()
      }
    } finally {
      setStatusLoading(false)
    }
  }

  const deadlineText = detail.deadline
    ? new Date(detail.deadline).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Tidak ada deadline"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-100 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-900">{detail.title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusColors[detail.status]
              }`}
            >
              {statusLabels[detail.status]}
            </span>
            <span className="text-xs text-zinc-500">
              Assigned to: <strong>{detail.assignee.name}</strong>
            </span>
            <span className="text-xs text-zinc-500">
              By: <strong>{detail.assigner.name}</strong>
            </span>
          </div>

          {detail.description && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-zinc-500">
                Deskripsi
              </h4>
              <p className="mt-1 text-sm text-zinc-700 whitespace-pre-wrap">
                {detail.description}
              </p>
            </div>
          )}

          {detail.briefUrl && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-zinc-500">
                Brief / Script
              </h4>
              <a
                href={detail.briefUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-blue-600 hover:underline"
              >
                Lihat brief →
              </a>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold uppercase text-zinc-500">
              Deadline
            </h4>
            <p className="mt-1 text-sm text-zinc-700">{deadlineText}</p>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase text-zinc-500">
                Progress
              </h4>
              <span className="text-sm font-semibold text-zinc-900">
                {detail.progressPercent}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full bg-green-500 transition-all"
                style={{ width: `${detail.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Timer */}
          <TaskTimer taskId={task.id} onStatusChange={fetchDetail} />

          {/* Status actions */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-zinc-500 mb-2">
              Update Status
            </h4>
            <div className="flex flex-wrap gap-2">
              {["Assigned", "InProgress", "Review", "Revision", "Done"].map(
                (s) => (
                  <button
                    key={s}
                    disabled={statusLoading || detail.status === s}
                    onClick={() => handleStatusChange(s)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      detail.status === s
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                    } disabled:opacity-50`}
                  >
                    {statusLabels[s]}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Progress update form */}
          <ProgressUpdateForm
            taskId={task.id}
            onSubmitted={() => {
              fetchProgress()
              fetchDetail()
              onUpdated()
            }}
          />

          {/* Progress history */}
          {progressUpdates.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-zinc-500 mb-2">
                Riwayat Progress
              </h4>
              <div className="space-y-3">
                {progressUpdates.map((up) => (
                  <div
                    key={up.id}
                    className="rounded-lg border border-zinc-100 bg-zinc-50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-700">
                        {up.user.name}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {new Date(up.createdAt).toLocaleString("id-ID")}
                      </span>
                    </div>
                    {up.note && (
                      <p className="mt-1 text-sm text-zinc-700">{up.note}</p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-semibold text-green-600">
                        {up.percent}%
                      </span>
                      {up.fileUrl && (
                        <a
                          href={up.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Lihat file
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

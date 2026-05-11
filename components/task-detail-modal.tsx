"use client"

import { useState, useEffect, useCallback } from "react"
import {
  TaskItem,
  ProgressUpdateItem,
  statusLabels,
  statusColors,
  FLOW,
  EDITOR_CAN_CHANGE,
  KOREA_CAN_CHANGE,
} from "@/types/task"
import TaskTimer from "./task-timer"
import ProgressUpdateForm from "./progress-update-form"

interface TaskDetailModalProps {
  task: TaskItem
  onClose: () => void
  onUpdated: () => void
  canCreate?: boolean
  userRole?: string
}

export default function TaskDetailModal({
  task,
  onClose,
  onUpdated,
  canCreate,
  userRole,
}: TaskDetailModalProps) {
  const [detail, setDetail] = useState<TaskItem>(task)
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState("")
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdateItem[]>([])

  // Revision / YouTube inputs
  const [showRevisionInput, setShowRevisionInput] = useState(false)
  const [revisionNote, setRevisionNote] = useState("")
  const [revisionAttachment, setRevisionAttachment] = useState("")
  const [showYoutubeInput, setShowYoutubeInput] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState("")

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

  const allowedTransitions =
    userRole === "Editor"
      ? EDITOR_CAN_CHANGE[detail.status] || []
      : KOREA_CAN_CHANGE[detail.status] || []

  async function handleStatusChange(newStatus: string) {
    setStatusLoading(true)
    setStatusError("")

    const body: any = { status: newStatus }

    if (newStatus === "Revise" && revisionNote) {
      body.revisionNote = revisionNote
      body.revisionAttachment = revisionAttachment || undefined
    }

    if (newStatus === "Completed" && youtubeUrl) {
      body.youtubeUrl = youtubeUrl
    }

    try {
      const res = await fetch(`/api/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setShowRevisionInput(false)
        setShowYoutubeInput(false)
        setRevisionNote("")
        setRevisionAttachment("")
        setYoutubeUrl("")
        await fetchDetail()
        onUpdated()
      } else {
        setStatusError(data.message || "Gagal update status")
      }
    } catch {
      setStatusError("Gagal update status")
    } finally {
      setStatusLoading(false)
    }
  }

  function handleReviseClick() {
    setShowRevisionInput(true)
    setStatusError("")
  }

  function handleReadyToUploadClick() {
    // Korea/Admin approves → ReadyToUpload
    handleStatusChange("ReadyToUpload")
  }

  function handleCompleteClick() {
    setShowYoutubeInput(true)
    setStatusError("")
  }

  const deadlineText = detail.deadline
    ? new Date(detail.deadline).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Tidak ada deadline"

  const currentIdx = FLOW.indexOf(detail.status)

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

          {/* Status flow indicator */}
          <div className="flex items-center gap-1">
            {FLOW.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className={`h-1.5 w-5 rounded-full ${
                    i <= currentIdx ? "bg-green-500" : "bg-zinc-200"
                  }`}
                />
                {i < FLOW.length - 1 && (
                  <div
                    className={`h-px w-2 ${
                      i < currentIdx ? "bg-green-400" : "bg-zinc-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Revision notes (shown when status is Revise) */}
          {detail.status === "Revise" && detail.revisionNote && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h4 className="text-xs font-semibold uppercase text-orange-700">
                Catatan Revisi
              </h4>
              <p className="mt-1 text-sm text-orange-900 whitespace-pre-wrap">
                {detail.revisionNote}
              </p>
              {detail.revisionAttachment && (
                <a
                  href={detail.revisionAttachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-orange-700 underline"
                >
                  Lihat attachment →
                </a>
              )}
            </div>
          )}

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
            {statusError && (
              <p className="mb-2 text-xs text-red-500">{statusError}</p>
            )}

            {/* Revision note input (shown when KoreaTeam clicks Revise) */}
            {showRevisionInput && (
              <div className="mb-3 space-y-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
                <p className="text-xs font-semibold text-orange-800">Catatan Revisi (wajib)</p>
                <textarea
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  rows={3}
                  placeholder="Tulis catatan revisi di sini..."
                  className="w-full rounded-lg border border-orange-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                />
                <input
                  type="url"
                  value={revisionAttachment}
                  onChange={(e) => setRevisionAttachment(e.target.value)}
                  placeholder="URL attachment (opsional)"
                  className="w-full rounded-lg border border-orange-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange("Revise")}
                    disabled={statusLoading || !revisionNote.trim()}
                    className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                  >
                    Kirim Revisi
                  </button>
                  <button
                    onClick={() => {
                      setShowRevisionInput(false)
                      setRevisionNote("")
                      setRevisionAttachment("")
                    }}
                    className="rounded-lg border border-orange-300 px-3 py-1.5 text-xs text-orange-700 hover:bg-orange-100"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* YouTube URL input (shown when editor clicks Completed from ReadyToUpload) */}
            {showYoutubeInput && (
              <div className="mb-3 space-y-2 rounded-lg border border-teal-200 bg-teal-50 p-3">
                <p className="text-xs font-semibold text-teal-800">Link YouTube (opsional)</p>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-lg border border-teal-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange("Completed")}
                    disabled={statusLoading}
                    className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                  >
                    Selesai
                  </button>
                  <button
                    onClick={() => {
                      setShowYoutubeInput(false)
                      setYoutubeUrl("")
                    }}
                    className="rounded-lg border border-teal-300 px-3 py-1.5 text-xs text-teal-700 hover:bg-teal-100"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Status buttons */}
            {!showRevisionInput && !showYoutubeInput && (
              <div className="flex flex-wrap gap-2">
                {FLOW.map((s) => {
                  const isAllowed = allowedTransitions.includes(s)
                  const isRevise = s === "Revise" && userRole !== "Editor" && allowedTransitions.includes(s)
                  const isReadyToUpload = s === "ReadyToUpload" && allowedTransitions.includes(s)
                  const isComplete = s === "Completed" && userRole === "Editor" && allowedTransitions.includes(s)

                  return (
                    <button
                      key={s}
                      disabled={statusLoading || !isAllowed || detail.status === s}
                      onClick={() => {
                        if (isRevise) handleReviseClick()
                        else if (isComplete) handleCompleteClick()
                        else if (isReadyToUpload) handleReadyToUploadClick()
                        else handleStatusChange(s)
                      }}
                      title={
                        !isAllowed && detail.status !== s
                          ? `Tidak bisa ubah dari ${statusLabels[detail.status]} ke ${statusLabels[s]}`
                          : ""
                      }
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        detail.status === s
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : isAllowed
                          ? "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                          : "border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed"
                      } disabled:opacity-100`}
                    >
                      {statusLabels[s]}
                    </button>
                  )
                })}
              </div>
            )}

            <p className="mt-1 text-xs text-zinc-400">
              {userRole === "Editor"
                ? "Editor: Ditugaskan→Dikerjakan, Dikerjakan→Perlu Direview, Revisi→Perlu Direview, Siap Upload→Selesai"
                : "Korea/Admin: Perlu Direview→Direview, Direview→Siap Upload / Revisi"}
            </p>
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

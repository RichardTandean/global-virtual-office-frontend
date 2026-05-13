"use client"

import { useState, useEffect, useCallback } from "react"
import {
  TaskItem,
  ProgressUpdateItem,
  statusLabels,
  FLOW,
  EDITOR_CAN_CHANGE,
  KOREA_CAN_CHANGE,
} from "@/types/task"
import { VideoSubmissionItem, VideoStatus } from "@/types/video-submission"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusPill } from "@/components/ui/status-pill"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  ChevronDown,
  Check,
  X,
  ArrowRight,
  ExternalLink,
  Calendar,
  User,
  FileText,
  History,
  Activity,
} from "lucide-react"
import ProgressUpdateForm from "./progress-update-form"
import VideoVersionList from "./video-version-list"
import VideoPlayer from "./video-player"
import VideoUploader from "./video-uploader"
import AssetList from "./asset-list"
import { cn } from "@/lib/utils"

interface TaskDetailModalProps {
  task: TaskItem
  onClose: () => void
  onUpdated: () => void
  canCreate?: boolean
  userRole?: string
}

interface StatusLogItem {
  id: string
  fromStatus: string
  toStatus: string
  note: string | null
  createdAt: string
  user: { id: string; name: string }
}

export default function TaskDetailModal({
  task,
  onClose,
  onUpdated,
  userRole,
}: TaskDetailModalProps) {
  const [detail, setDetail] = useState<TaskItem>(task)
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState("")
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdateItem[]>([])
  const [statusLogs, setStatusLogs] = useState<StatusLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnHoldForm, setShowOnHoldForm] = useState(false)

  const [selectedVideo, setSelectedVideo] = useState<VideoSubmissionItem | null>(null)
  const [videoTime, setVideoTime] = useState(0)

  const [showYoutubeInput, setShowYoutubeInput] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState("")

  const [revisionNote, setRevisionNote] = useState("")
  const [revisionAttachment, setRevisionAttachment] = useState("")
  const [showRevisionForm, setShowRevisionForm] = useState(false)
  const [revisionTargetVideoId, setRevisionTargetVideoId] = useState<string | null>(null)

  const [tab, setTab] = useState<"overview" | "video" | "history" | "assets">(
    "overview"
  )
  const [videoCount, setVideoCount] = useState(0)
  const [videoLoading, setVideoLoading] = useState(false)

  const isReviewer = userRole === "KoreaTeam" || userRole === "Admin"
  const isEditor = userRole === "Editor"

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  const fetchDetail = useCallback(async () => {
    const res = await fetch(`/api/tasks/${task.id}`)
    if (res.ok) {
      const data = await res.json()
      setDetail(data)
      setVideoCount(data.videoSubmissions?.length || 0)
    }
  }, [task.id])

  const fetchProgress = useCallback(async () => {
    const res = await fetch(`/api/tasks/${task.id}/progress`)
    if (res.ok) setProgressUpdates(await res.json())
  }, [task.id])

  const fetchStatusLogs = useCallback(async () => {
    const res = await fetch(`/api/tasks/${task.id}/status-logs`)
    if (res.ok) setStatusLogs(await res.json())
  }, [task.id])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([fetchDetail(), fetchProgress(), fetchStatusLogs()])
      setLoading(false)
    }
    init()
  }, [fetchDetail, fetchProgress, fetchStatusLogs])

  const allowedTransitions = isEditor
    ? EDITOR_CAN_CHANGE[detail.status] || []
    : KOREA_CAN_CHANGE[detail.status] || []

  async function handleStatusChange(newStatus: string) {
    setStatusLoading(true)
    setStatusError("")
    const body: any = { status: newStatus }
    if (newStatus === "Completed" && youtubeUrl) body.youtubeUrl = youtubeUrl

    try {
      const res = await fetch(`/api/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setShowYoutubeInput(false)
        setYoutubeUrl("")
        await Promise.all([fetchDetail(), fetchStatusLogs()])
        onUpdated()
        toast.success(statusLabels[newStatus] || "Status diperbarui")
      } else {
        setStatusError(data.message || "Gagal update status")
      }
    } catch {
      setStatusError("Gagal update status")
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleApproveVideo(videoId: string) {
    setVideoLoading(true)
    try {
      await fetch(`/api/video-submissions/${videoId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: VideoStatus.Approved }),
      })
      await fetchDetail()
      onUpdated()
      toast.success("Video disetujui")
    } finally {
      setVideoLoading(false)
    }
  }

  function handleRejectVideo(videoId: string) {
    setRevisionTargetVideoId(videoId)
    setRevisionNote("")
    setRevisionAttachment("")
    setShowRevisionForm(true)
  }

  async function handleSubmitRevision() {
    const videoId = revisionTargetVideoId
    if (!videoId || !revisionNote.trim()) return
    setVideoLoading(true)
    try {
      await fetch(`/api/video-submissions/${videoId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: VideoStatus.Rejected }),
      })
      await fetch(`/api/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Revise",
          revisionNote,
          revisionAttachment: revisionAttachment || undefined,
        }),
      })
      await Promise.all([fetchDetail(), fetchStatusLogs()])
      onUpdated()
      setShowRevisionForm(false)
      setRevisionNote("")
      setRevisionAttachment("")
      setRevisionTargetVideoId(null)
      toast.success("Revisi dikirim ke editor")
    } catch {
      toast.error("Gagal mengirim revisi")
    } finally {
      setVideoLoading(false)
    }
  }

  const deadlineDate = detail.deadline ? new Date(detail.deadline) : null
  const deadlineText =
    deadlineDate && !isNaN(deadlineDate.getTime())
      ? deadlineDate.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Tidak ada deadline"

  const currentIdx = FLOW.indexOf(detail.status)

  function handleVideoUploaded(video: VideoSubmissionItem) {
    fetchDetail()
    onUpdated()
    setSelectedVideo(video)
    setTab("video")
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-(--dur-fast)"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-labelledby="task-title"
        className={cn(
          "absolute inset-y-0 right-0 w-full max-w-3xl bg-surface border-l border-line",
          "flex flex-col shadow-lg",
          "animate-in slide-in-from-right duration-(--dur-modal-enter) ease-(--ease-out)"
        )}
      >
        {/* Header */}
        <header className="px-5 md:px-7 py-4 border-b border-line shrink-0 bg-surface">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                <span>Task</span>
                <span className="font-mono normal-case tracking-normal text-ink-secondary">
                  #{detail.id.slice(0, 6)}
                </span>
              </div>
              <h2
                id="task-title"
                className="font-display italic text-2xl md:text-3xl leading-tight text-ink"
              >
                {detail.title}
              </h2>
              <StatusPill status={detail.status} size="sm" />
            </div>
            <button
              onClick={onClose}
              className="size-8 inline-flex items-center justify-center rounded-sm text-ink-muted hover:text-ink hover:bg-subtle transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* status flow chips */}
          <div className="mt-4 flex items-center gap-0.5 overflow-x-auto pb-1">
            {FLOW.map((s, i) => (
              <div key={s} className="flex items-center gap-0.5 shrink-0">
                <div
                  className={cn(
                    "h-1 rounded-full transition-colors",
                    i === currentIdx ? "w-6 bg-accent" : "w-4",
                    i < currentIdx
                      ? "bg-accent/60"
                      : i > currentIdx
                      ? "bg-line"
                      : ""
                  )}
                />
                {i < FLOW.length - 1 && (
                  <div className="h-px w-1 bg-line shrink-0" />
                )}
              </div>
            ))}
          </div>
        </header>

        {/* Tabs */}
        <div className="px-5 md:px-7 border-b border-line shrink-0">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList variant="line" className="border-b-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="video">
                Video
                {videoCount > 0 && (
                  <span className="ml-1 font-mono text-[10px] tabular-nums text-ink-muted">
                    {videoCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="assets">Materi</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" />
            <TabsContent value="video" />
            <TabsContent value="history" />
            <TabsContent value="assets" />
          </Tabs>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-7 space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <div className="p-5 md:p-7 space-y-6">
                  {/* Meta strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[12px]">
                    <MetaRow
                      icon={<User className="size-3" />}
                      label="Assigned to"
                      value={detail.assignee.name}
                    />
                    <MetaRow
                      icon={<User className="size-3" />}
                      label="Created by"
                      value={detail.assigner.name}
                    />
                    <MetaRow
                      icon={<Calendar className="size-3" />}
                      label="Deadline"
                      value={deadlineText}
                    />
                    <MetaRow
                      icon={<Activity className="size-3" />}
                      label="Progress"
                      value={
                        <span className="font-mono tabular-nums text-ink">
                          {detail.progressPercent}%
                        </span>
                      }
                    />
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="h-1 w-full bg-subtle overflow-hidden rounded-full">
                      <div
                        className="h-full bg-accent transition-all duration-(--dur-base)"
                        style={{ width: `${detail.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Revision note */}
                  {detail.status === "Revise" && detail.revisionNote && (
                    <div className="rounded-md border border-status-revise/30 bg-status-revise/8 p-4">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-status-revise">
                        Catatan revisi
                      </h4>
                      <p className="mt-1.5 text-[13px] text-ink whitespace-pre-wrap leading-relaxed">
                        {detail.revisionNote}
                      </p>
                      {detail.revisionAttachment && (
                        <a
                          href={detail.revisionAttachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] text-accent hover:text-accent-hover hover:underline"
                        >
                          Lihat attachment <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {detail.description && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                        Deskripsi
                      </h4>
                      <p className="text-[13px] text-ink leading-relaxed whitespace-pre-wrap">
                        {detail.description}
                      </p>
                    </div>
                  )}

                  {detail.briefUrl && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                        Brief / Script
                      </h4>
                      <a
                        href={detail.briefUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] text-accent hover:text-accent-hover hover:underline"
                      >
                        <FileText className="size-3" />
                        Lihat brief
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}

                  {/* Status actions */}
                  {allowedTransitions.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-line">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                        Ubah status
                      </h4>
                      {statusError && (
                        <p className="text-[12px] text-status-danger">
                          {statusError}
                        </p>
                      )}

                      {isEditor &&
                        (detail.status === "Editing" ||
                          detail.status === "Revise") &&
                        videoCount === 0 && (
                          <div className="rounded-md border border-status-need-review/30 bg-status-need-review/10 p-3">
                            <p className="text-[12px] text-ink-secondary">
                              Upload video terlebih dahulu sebelum mengirim
                              untuk review.
                            </p>
                          </div>
                        )}

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={statusLoading}
                          render={
                            <Button size="sm" disabled={statusLoading}>
                              {statusLoading ? "Memproses..." : "Pilih status"}
                              <ChevronDown />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="start">
                          {allowedTransitions.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => {
                                if (s === "Completed" && isEditor) {
                                  setShowYoutubeInput(true)
                                  setShowOnHoldForm(false)
                                } else if (s === "OnHold" && isEditor) {
                                  setShowOnHoldForm(true)
                                  setShowYoutubeInput(false)
                                } else {
                                  handleStatusChange(s)
                                }
                              }}
                            >
                              <ArrowRight className="size-3" />
                              {statusLabels[s]}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {showYoutubeInput && (
                        <div className="rounded-md border border-status-ready-upload/30 bg-status-ready-upload/8 p-3 space-y-2">
                          <p className="text-[11px] font-medium text-status-ready-upload uppercase tracking-wider">
                            Link YouTube (opsional)
                          </p>
                          <Input
                            type="url"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange("Completed")}
                              disabled={statusLoading}
                            >
                              Tandai selesai
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setShowYoutubeInput(false)
                                setYoutubeUrl("")
                              }}
                            >
                              Batal
                            </Button>
                          </div>
                        </div>
                      )}

                      {showOnHoldForm && (
                        <div className="rounded-md border border-status-on-hold/30 bg-status-on-hold/8 p-3 space-y-2">
                          <p className="text-[11px] font-medium text-status-on-hold uppercase tracking-wider">
                            Update progress sebelum on hold
                          </p>
                          <p className="text-[11px] text-ink-secondary">
                            Tulis progress saat ini agar tim tahu sampai di mana
                            pekerjaanmu.
                          </p>
                          <ProgressUpdateForm
                            taskId={task.id}
                            onSubmitted={() => {
                              fetchProgress()
                              fetchDetail()
                              fetchStatusLogs()
                              onUpdated()
                              setShowOnHoldForm(false)
                              toast.success("Progress disimpan, status On Hold")
                            }}
                          />
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => setShowOnHoldForm(false)}
                          >
                            Batal
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {tab === "video" && (
                <div className="p-5 md:p-7 space-y-5">
                  {isEditor && (
                    <VideoUploader
                      taskId={task.id}
                      onUploaded={handleVideoUploaded}
                    />
                  )}

                  {isReviewer && selectedVideo && (
                    <div className="space-y-3">
                      <VideoPlayer
                        videoId={selectedVideo.id}
                        initialTime={videoTime}
                        onTimeUpdate={setVideoTime}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-status-success text-white hover:bg-status-success/90"
                          disabled={videoLoading}
                          onClick={() => handleApproveVideo(selectedVideo.id)}
                        >
                          <Check />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-status-danger/40 text-status-danger hover:bg-status-danger/10"
                          disabled={videoLoading}
                          onClick={() => handleRejectVideo(selectedVideo.id)}
                        >
                          <X />
                          Tolak (Revisi)
                        </Button>
                      </div>

                      {showRevisionForm &&
                        revisionTargetVideoId === selectedVideo.id && (
                          <div className="rounded-md border border-status-revise/30 bg-status-revise/8 p-3 space-y-2">
                            <p className="text-[11px] font-medium text-status-revise uppercase tracking-wider">
                              Catatan revisi
                            </p>
                            <Textarea
                              value={revisionNote}
                              onChange={(e) => setRevisionNote(e.target.value)}
                              rows={3}
                              placeholder="Tulis catatan revisi..."
                            />
                            <Input
                              type="url"
                              value={revisionAttachment}
                              onChange={(e) =>
                                setRevisionAttachment(e.target.value)
                              }
                              placeholder="URL attachment (opsional)"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleSubmitRevision}
                                disabled={videoLoading || !revisionNote.trim()}
                              >
                                Kirim revisi
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setShowRevisionForm(false)
                                  setRevisionTargetVideoId(null)
                                }}
                              >
                                Batal
                              </Button>
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  <div>
                    <h4 className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                      Versions
                    </h4>
                    <VideoVersionList
                      taskId={task.id}
                      role={userRole || "Editor"}
                      onSelectVideo={setSelectedVideo}
                      selectedVideoId={selectedVideo?.id}
                    />
                  </div>
                </div>
              )}

              {tab === "history" && (
                <div className="p-5 md:p-7 space-y-6">
                  {statusLogs.length === 0 && progressUpdates.length === 0 && (
                    <p className="text-[12px] text-ink-muted text-center py-6">
                      Belum ada riwayat aktivitas.
                    </p>
                  )}

                  {statusLogs.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted flex items-center gap-1.5">
                        <History className="size-3" />
                        Riwayat status
                      </h4>
                      <div className="rounded-md border border-line bg-subtle/30 divide-y divide-line">
                        {statusLogs.map((log) => (
                          <div key={log.id} className="px-4 py-3 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[12px] font-medium text-ink">
                                {log.user.name}
                              </span>
                              <span className="font-mono text-[10px] tabular-nums text-ink-muted">
                                {new Date(log.createdAt).toLocaleString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <StatusPill
                                status={log.fromStatus}
                                size="sm"
                                variant="ghost"
                              />
                              <ArrowRight className="size-3 text-ink-muted" />
                              <StatusPill status={log.toStatus} size="sm" />
                            </div>
                            {log.note && (
                              <p className="text-[12px] text-ink-secondary">
                                {log.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {progressUpdates.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted flex items-center gap-1.5">
                        <Activity className="size-3" />
                        Riwayat progress
                      </h4>
                      <div className="rounded-md border border-line bg-subtle/30 divide-y divide-line">
                        {progressUpdates.map((up) => (
                          <div key={up.id} className="px-4 py-3 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[12px] font-medium text-ink">
                                {up.user.name}
                              </span>
                              <span className="font-mono text-[10px] tabular-nums text-ink-muted">
                                {new Date(up.createdAt).toLocaleString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                            {up.note && (
                              <p className="text-[12px] text-ink-secondary">
                                {up.note}
                              </p>
                            )}
                            <div className="flex items-center gap-3">
                              <span className="font-mono tabular-nums text-[12px] font-semibold text-status-success">
                                {up.percent}%
                              </span>
                              {up.fileUrl && (
                                <a
                                  href={up.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-accent hover:underline"
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
              )}

              {tab === "assets" && (
                <div className="p-5 md:p-7">
                  <AssetList
                    taskId={task.id}
                    role={userRole || "Editor"}
                    userId={userRole === "Editor" ? detail.assignee.id : ""}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  )
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-ink-muted shrink-0 mt-0.5">{icon}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted shrink-0 w-20">
        {label}
      </span>
      <span className="text-ink truncate">{value}</span>
    </div>
  )
}

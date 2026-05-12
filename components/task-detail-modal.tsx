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
import { VideoSubmissionItem, VideoStatus } from "@/types/video-submission"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { ChevronDown, Check, X, ArrowLeft } from "lucide-react"
import ProgressUpdateForm from "./progress-update-form"
import VideoVersionList from "./video-version-list"
import VideoPlayer from "./video-player"
import VideoUploader from "./video-uploader"
import AssetList from "./asset-list"

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

  const [detailTab, setDetailTab] = useState("detail")
  const [videoCount, setVideoCount] = useState(0)
  const [videoLoading, setVideoLoading] = useState(false)

  const isReviewer = userRole === "KoreaTeam" || userRole === "Admin"
  const isEditor = userRole === "Editor"

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
    if (res.ok) {
      const data = await res.json()
      setProgressUpdates(data)
    }
  }, [task.id])

  const fetchStatusLogs = useCallback(async () => {
    const res = await fetch(`/api/tasks/${task.id}/status-logs`)
    if (res.ok) {
      const data = await res.json()
      setStatusLogs(data)
    }
  }, [task.id])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([fetchDetail(), fetchProgress(), fetchStatusLogs()])
      setLoading(false)
    }
    init()
  }, [fetchDetail, fetchProgress, fetchStatusLogs])

  const allowedTransitions =
    isEditor
      ? EDITOR_CAN_CHANGE[detail.status] || []
      : KOREA_CAN_CHANGE[detail.status] || []

  async function handleStatusChange(newStatus: string) {
    setStatusLoading(true)
    setStatusError("")

    const body: any = { status: newStatus }
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
        setShowYoutubeInput(false)
        setYoutubeUrl("")
        await Promise.all([fetchDetail(), fetchStatusLogs()])
        onUpdated()
        toast.success(`${statusLabels[newStatus]}`)
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

  async function handleRejectVideo(videoId: string) {
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
  const deadlineText = deadlineDate && !isNaN(deadlineDate.getTime())
    ? deadlineDate.toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "Tidak ada deadline"

  const currentIdx = FLOW.indexOf(detail.status)

  function handleVideoUploaded(video: VideoSubmissionItem) {
    fetchDetail()
    onUpdated()
    setSelectedVideo(video)
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-5xl h-[92vh] md:h-[85vh] flex flex-col p-0 gap-0 max-sm:rounded-none max-sm:h-screen max-sm:max-w-full bg-background backdrop-blur-none">
        <div className="fixed inset-0 -z-10 bg-black/50 backdrop-blur-sm" />
        <DialogHeader className="px-4 md:px-6 py-3 md:py-4 border-b shrink-0 bg-background">
          <div className="flex items-center gap-2 md:gap-3">
            <DialogTitle className="text-base md:text-lg truncate">{detail.title}</DialogTitle>
            <Badge className={`shrink-0 ${statusColors[detail.status]}`}>{statusLabels[detail.status]}</Badge>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="p-6 space-y-4 bg-background">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <Tabs value={detailTab} onValueChange={setDetailTab} className="flex flex-col flex-1 min-h-0 bg-background">
            <TabsList className="w-full justify-start rounded-none border-b bg-background px-3 md:px-6 h-auto py-0 gap-0 shrink-0 overflow-x-auto sticky top-0 z-10">
              <TabsTrigger value="detail" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2.5 text-xs md:text-sm">
                Detil
              </TabsTrigger>
              <TabsTrigger value="assets" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-2.5 text-xs md:text-sm">
                Materi
              </TabsTrigger>
            </TabsList>

            {/* Tab: Detil — includes video + revision */}
            <TabsContent value="detail" className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 md:space-y-6 m-0 bg-background">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className="text-xs text-muted-foreground">
                  Assigned to: <strong>{detail.assignee.name}</strong>
                </span>
                <span className="text-xs text-muted-foreground">
                  By: <strong>{detail.assigner.name}</strong>
                </span>
              </div>

              {/* Status flow */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {FLOW.map((s, i) => (
                  <div key={s} className="flex items-center gap-1 shrink-0">
                    <div className={`h-1.5 w-4 md:w-5 rounded-full ${i <= currentIdx ? "bg-green-500" : "bg-muted"}`} />
                    {i < FLOW.length - 1 && (
                      <div className={`h-px w-1.5 md:w-2 ${i < currentIdx ? "bg-green-400" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Revision note */}
              {detail.status === "Revise" && detail.revisionNote && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950 p-3 md:p-4">
                  <h4 className="text-xs font-semibold uppercase text-orange-700 dark:text-orange-300">Catatan Revisi</h4>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{detail.revisionNote}</p>
                  {detail.revisionAttachment && (
                    <a href={detail.revisionAttachment} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs underline">
                      Lihat attachment &rarr;
                    </a>
                  )}
                </div>
              )}

              {detail.description && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Deskripsi</h4>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{detail.description}</p>
                </div>
              )}

              {detail.briefUrl && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Brief / Script</h4>
                  <a href={detail.briefUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-blue-600 hover:underline">
                    Lihat brief &rarr;
                  </a>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Deadline</h4>
                <p className="mt-1 text-sm">{deadlineText}</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Progress</h4>
                  <span className="text-sm font-semibold">{detail.progressPercent}%</span>
                </div>
                <Progress value={detail.progressPercent} className="mt-2 h-2" />
              </div>

              {/* ------ VIDEO SECTION ------ */}
              <Separator />
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                  Video {videoCount > 0 && <Badge variant="secondary" className="text-[10px]">{videoCount}</Badge>}
                </h4>

                {isEditor && (
                  <div className="mb-4">
                    <VideoUploader taskId={task.id} onUploaded={handleVideoUploaded} />
                  </div>
                )}

                {isReviewer && selectedVideo && (
                  <div className="mb-4">
                    <VideoPlayer
                      videoId={selectedVideo.id}
                      initialTime={videoTime}
                      onTimeUpdate={setVideoTime}
                    />

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={videoLoading}
                        onClick={() => handleApproveVideo(selectedVideo.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        disabled={videoLoading}
                        onClick={() => handleRejectVideo(selectedVideo.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Tolak (Revisi)
                      </Button>
                    </div>

                    {showRevisionForm && revisionTargetVideoId === selectedVideo.id && (
                      <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950 p-3 space-y-2">
                        <p className="text-xs font-semibold text-orange-800 dark:text-orange-200">Catatan Revisi</p>
                        <Textarea
                          value={revisionNote}
                          onChange={(e) => setRevisionNote(e.target.value)}
                          rows={3}
                          placeholder="Tulis catatan revisi..."
                          className="text-sm"
                        />
                        <Input
                          type="url"
                          value={revisionAttachment}
                          onChange={(e) => setRevisionAttachment(e.target.value)}
                          placeholder="URL attachment (opsional)"
                          className="text-xs"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSubmitRevision}
                            disabled={videoLoading || !revisionNote.trim()}
                          >
                            Kirim Revisi
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
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

                <VideoVersionList
                  taskId={task.id}
                  role={userRole || "Editor"}
                  onSelectVideo={setSelectedVideo}
                  selectedVideoId={selectedVideo?.id}
                />
              </div>
              {/* ------ END VIDEO ------ */}

              <Separator />

              {/* Status actions */}
              {allowedTransitions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Update Status</h4>
                  {statusError && <p className="mb-2 text-xs text-destructive">{statusError}</p>}

                  {isEditor && (detail.status === "Editing" || detail.status === "Revise") && videoCount === 0 && (
                    <div className="mb-3 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950 p-3">
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        Upload video terlebih dahulu sebelum mengirim untuk review.
                      </p>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      disabled={statusLoading}
                      className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                    >
                      {statusLoading ? "Memproses..." : "Ubah Status"}
                      <ChevronDown className="h-3 w-3" />
                    </DropdownMenuTrigger>
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
                          <ArrowLeft className="h-3 w-3 mr-2 text-muted-foreground" />
                          {statusLabels[s]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {showYoutubeInput && (
                    <div className="mt-3 space-y-2 rounded-lg border border-teal-200 bg-teal-50 dark:bg-teal-950 p-3">
                      <p className="text-xs font-semibold text-teal-800 dark:text-teal-200">Link YouTube (opsional)</p>
                      <Input type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleStatusChange("Completed")} disabled={statusLoading}>Selesai</Button>
                        <Button size="sm" variant="outline" onClick={() => { setShowYoutubeInput(false); setYoutubeUrl("") }}>Batal</Button>
                      </div>
                    </div>
                  )}

                  {showOnHoldForm && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 p-3 space-y-2">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                        Update progress sebelum On Hold
                      </p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300">
                        Tulis progress saat ini agar tim tahu sampai di mana pekerjaanmu. Status akan otomatis berubah ke On Hold setelah disimpan.
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
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowOnHoldForm(false)}
                      >
                        Batal
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {statusLogs.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Riwayat Status</h4>
                  <div className="space-y-2">
                    {statusLogs.map((log) => (
                      <div key={log.id} className="rounded-lg border bg-muted/30 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{log.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs">
                          <Badge variant="secondary" className={`text-[10px] ${statusColors[log.fromStatus] || ""}`}>
                            {statusLabels[log.fromStatus] || log.fromStatus}
                          </Badge>
                          <ArrowLeft className="h-3 w-3 rotate-180 text-muted-foreground" />
                          <Badge variant="secondary" className={`text-[10px] ${statusColors[log.toStatus] || ""}`}>
                            {statusLabels[log.toStatus] || log.toStatus}
                          </Badge>
                        </div>
                        {log.note && <p className="mt-1 text-sm">{log.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {progressUpdates.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Riwayat Progress</h4>
                  <div className="space-y-3">
                    {progressUpdates.map((up) => (
                      <div key={up.id} className="rounded-lg border bg-muted/30 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{up.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(up.createdAt).toLocaleString("id-ID")}
                          </span>
                        </div>
                        {up.note && <p className="mt-1 text-sm">{up.note}</p>}
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs font-semibold text-green-600">{up.percent}%</span>
                          {up.fileUrl && (
                            <a href={up.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                              Lihat file
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab: Materi */}
            <TabsContent value="assets" className="flex-1 overflow-y-auto p-4 md:p-6 m-0 bg-background">
              <AssetList taskId={task.id} role={userRole || "Editor"} userId={userRole === "Editor" ? detail.assignee.id : ""} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

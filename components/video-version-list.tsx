"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import {
  VideoSubmissionItem,
  VideoStatus,
  videoStatusColors,
} from "@/types/video-submission"
import { MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoVersionListProps {
  taskId: string
  role: string
  onSelectVideo: (video: VideoSubmissionItem) => void
  selectedVideoId?: string
  compact?: boolean
}

export default function VideoVersionList({
  taskId,
  onSelectVideo,
  selectedVideoId,
  compact,
}: VideoVersionListProps) {
  const t = useTranslations()
  const [videos, setVideos] = useState<VideoSubmissionItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/video-submissions/task/${taskId}`)
      if (res.ok) {
        const data = await res.json()
        setVideos(data)
      }
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <Skeleton
            key={i}
            className={`${compact ? "h-12" : "h-16"} w-full`}
          />
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line bg-subtle/30 px-4 py-6 text-center">
        <p className="text-[11px] text-ink-muted">{t("videoUploader.noVideos")}</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {/* timeline rail */}
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-line" aria-hidden />
      {videos.map((video) => {
        const isSelected = selectedVideoId === video.id
        return (
          <button
            key={video.id}
            type="button"
            onClick={() => onSelectVideo(video)}
            className={cn(
              "relative w-full text-left flex items-start gap-3 rounded-sm pl-1 pr-3 py-2.5",
              "transition-colors duration-(--dur-fast)",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              isSelected
                ? "bg-accent-subtle"
                : "hover:bg-subtle/60"
            )}
          >
            <span
              className={cn(
                "relative z-10 mt-0.5 inline-flex items-center justify-center rounded-pill",
                "size-9 font-mono text-[11px] font-semibold tabular-nums shrink-0",
                "border-2",
                isSelected
                  ? "border-accent bg-elevated text-accent"
                  : "border-line bg-elevated text-ink-secondary"
              )}
            >
              V{video.version}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-medium text-ink truncate">
                  {video.user.name}
                </p>
                <span
                  className={cn(
                    "rounded-xs px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider",
                    videoStatusColors[video.status as VideoStatus]
                  )}
                >
                  {t(`videoStatus.${video.status}`)}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-ink-muted">
                <span className="font-mono tabular-nums">
                  {new Date(video.submittedAt).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {video._count && video._count.comments > 0 && (
                  <span className="inline-flex items-center gap-0.5">
                    <MessageSquare className="size-2.5" />
                    <span className="tabular-nums">{video._count.comments}</span>
                  </span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

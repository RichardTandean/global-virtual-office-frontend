"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoSubmissionItem, VideoStatus, videoStatusLabels, videoStatusColors } from "@/types/video-submission"
import { Eye, MessageSquare } from "lucide-react"

interface VideoVersionListProps {
  taskId: string
  role: string
  onSelectVideo: (video: VideoSubmissionItem) => void
  selectedVideoId?: string
  compact?: boolean
}

export default function VideoVersionList({
  taskId,
  role,
  onSelectVideo,
  selectedVideoId,
  compact,
}: VideoVersionListProps) {
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

  useEffect(() => { fetchVideos() }, [fetchVideos])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className={`${compact ? "h-14" : "h-20"} w-full`} />
        ))}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Belum ada video yang diupload
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {videos.map((video) => (
        <Card
          key={video.id}
          className={`cursor-pointer transition-colors hover:border-primary/50 ${
            selectedVideoId === video.id ? "ring-2 ring-primary border-primary" : ""
          }`}
          onClick={() => onSelectVideo(video)}
        >
          <CardContent className={compact ? "p-2" : "p-3 md:p-4"}>
            <div className={`flex items-center justify-between ${compact ? "gap-1" : "gap-3"}`}>
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <Badge variant="secondary" className={`${compact ? "text-xs px-1.5" : "text-sm"} font-mono shrink-0`}>
                  V{video.version}
                </Badge>
                <div className="min-w-0">
                  <p className={`${compact ? "text-xs" : "text-sm"} font-medium truncate`}>
                    {video.user.name}
                  </p>
                  <p className={`${compact ? "text-[10px]" : "text-xs"} text-muted-foreground`}>
                    {new Date(video.submittedAt).toLocaleString("id-ID", compact ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" } : undefined)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Badge className={`${compact ? "text-[10px] px-1" : "text-xs px-1.5"} ${videoStatusColors[video.status as VideoStatus]}`}>
                  {videoStatusLabels[video.status as VideoStatus]}
                </Badge>

                {video._count && video._count.comments > 0 && (
                  <Badge variant="outline" className={`${compact ? "text-[10px] px-1" : "text-xs"} gap-0.5`}>
                    <MessageSquare className="h-3 w-3" />
                    {video._count.comments}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

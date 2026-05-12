"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface VideoPlayerProps {
  videoId?: string
  src?: string
  initialTime?: number
  onTimeUpdate?: (time: number) => void
}

export default function VideoPlayer({
  videoId,
  src,
  initialTime = 0,
  onTimeUpdate,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playUrl, setPlayUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (src && !videoId) {
      setPlayUrl(src)
      return
    }
    if (!videoId) return

    setError(false)
    setPlayUrl(null)

    fetch(`/api/video-submissions/${videoId}/view-url`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setPlayUrl(data.url)
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
  }, [videoId, src])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !playUrl) return
    video.currentTime = initialTime
  }, [initialTime, playUrl])

  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Gagal memuat video. Pastikan file sudah diupload dengan benar.
        </CardContent>
      </Card>
    )
  }

  if (!playUrl) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Memuat video...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <video
          ref={videoRef}
          src={playUrl}
          controls
          className="w-full max-h-[60vh] bg-black"
          onTimeUpdate={(e) => {
            if (onTimeUpdate) {
              onTimeUpdate(e.currentTarget.currentTime)
            }
          }}
        >
          Browser kamu tidak mendukung pemutaran video.
        </video>
      </CardContent>
    </Card>
  )
}

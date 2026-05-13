"use client"

import { useState, useEffect, useRef } from "react"

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
      <div className="rounded-md border border-line bg-surface p-8 text-center text-[12px] text-ink-muted">
        Gagal memuat video. Pastikan file sudah diupload dengan benar.
      </div>
    )
  }

  if (!playUrl) {
    return (
      <div className="rounded-md border border-line bg-surface aspect-video grid place-items-center text-[12px] text-ink-muted animate-pulse">
        Memuat video...
      </div>
    )
  }

  return (
    <div className="rounded-md overflow-hidden border border-line bg-black">
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
    </div>
  )
}

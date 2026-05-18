"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Upload, FileVideo, X } from "lucide-react"
import { VideoSubmissionItem } from "@/types/video-submission"
import { cn } from "@/lib/utils"

interface VideoUploaderProps {
  taskId: string
  onUploaded: (video: VideoSubmissionItem) => void
}

export default function VideoUploader({ taskId, onUploaded }: VideoUploaderProps) {
  const t = useTranslations()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setProgress(0)

    try {
      const presignedRes = await fetch("/api/video-submissions/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          taskId,
        }),
      })

      if (!presignedRes.ok) throw new Error(t("videoUploader.uploadUrlFailed"))
      const { signedUrl, key } = await presignedRes.json()

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        })
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(t("videoUploader.uploadFailed")))
        })
        xhr.addEventListener("error", () => reject(new Error(t("videoUploader.uploadFailed"))))
        xhr.open("PUT", signedUrl)
        xhr.setRequestHeader("Content-Type", file.type)
        xhr.send(file)
      })

      const confirmRes = await fetch("/api/video-submissions/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          key,
          fileSize: String(file.size),
        }),
      })

      if (!confirmRes.ok) throw new Error(t("videoUploader.confirmFailed"))
      const video = await confirmRes.json()

      toast.success(t("videoUploader.uploaded", { version: video.version }))
      onUploaded(video)
      setFile(null)
      setProgress(0)
    } catch (err: any) {
      toast.error(err.message || t("videoUploader.uploadFailed"))
    } finally {
      setUploading(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith("video/")) setFile(f)
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!file ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "w-full rounded-md border border-dashed p-8 flex flex-col items-center gap-2.5 text-center",
            "transition-colors duration-(--dur-fast)",
            "outline-none focus-visible:ring-2 focus-visible:ring-focus",
            dragActive
              ? "border-accent bg-accent-subtle text-accent"
              : "border-line bg-subtle/40 text-ink-secondary hover:bg-subtle hover:border-line-strong"
          )}
        >
          <Upload className="size-5" />
          <div className="space-y-1">
            <p className="text-[12px] font-medium text-ink">
              {t("videoUploader.prompt")}
            </p>
            <p className="text-[10px] text-ink-muted">
              {t("videoUploader.hint")}
            </p>
          </div>
        </button>
      ) : (
        <div className="space-y-3 rounded-md border border-line bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-sm bg-accent-subtle grid place-items-center text-accent shrink-0">
              <FileVideo className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-ink truncate">
                {file.name}
              </p>
              <p className="text-[10px] font-mono tabular-nums text-ink-muted">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              disabled={uploading}
              className="size-7 inline-flex items-center justify-center rounded-xs text-ink-muted hover:text-ink hover:bg-subtle transition-colors disabled:opacity-40"
              aria-label={t("common.removeFile")}
            >
              <X className="size-3.5" />
            </button>
          </div>

          {uploading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
                <span className="text-ink-secondary">{t("videoUploader.uploadLabel")}</span>
                <span className="text-ink">{progress}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-subtle overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-(--dur-fast)"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            <Upload />
            {uploading ? `${t("videoUploader.uploadLabel")} ${progress}%` : t("videoUploader.uploadBtn")}
          </Button>
        </div>
      )}
    </div>
  )
}

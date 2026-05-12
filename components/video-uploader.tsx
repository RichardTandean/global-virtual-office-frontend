"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Upload, FileVideo, X } from "lucide-react"
import { VideoSubmissionItem } from "@/types/video-submission"

interface VideoUploaderProps {
  taskId: string
  onUploaded: (video: VideoSubmissionItem) => void
}

export default function VideoUploader({ taskId, onUploaded }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
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

      if (!presignedRes.ok) throw new Error("Gagal mendapatkan upload URL")
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
          else reject(new Error("Upload gagal"))
        })
        xhr.addEventListener("error", () => reject(new Error("Upload gagal")))
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

      if (!confirmRes.ok) throw new Error("Gagal konfirmasi upload")
      const video = await confirmRes.json()

      toast.success(`Video V${video.version} berhasil diupload!`)
      onUploaded(video)
      setFile(null)
      setProgress(0)
    } catch (err: any) {
      toast.error(err.message || "Gagal upload video")
    } finally {
      setUploading(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Upload className="h-4 w-4" />
          Upload Video Baru
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!file ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <FileVideo className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Klik atau drag & drop file video di sini
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileVideo className="h-5 w-5 text-primary" />
              <span className="text-sm flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setFile(null)}
                disabled={uploading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {uploading && <Progress value={progress} className="h-2" />}

            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? `Uploading... ${progress}%` : "Upload Video"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

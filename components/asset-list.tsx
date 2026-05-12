"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Paperclip, Download, Trash2, FileText } from "lucide-react"
import { AssetItem, formatFileSize, getFileIcon } from "@/types/asset"

interface AssetListProps {
  taskId: string
  role: string
  userId: string
}

export default function AssetList({ taskId, role, userId }: AssetListProps) {
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/assets/${taskId}`)
      if (res.ok) {
        const data = await res.json()
        setAssets(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    try {
      const presignedRes = await fetch("/api/assets/upload-url", {
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

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
      if (!uploadRes.ok) throw new Error("Upload gagal")

      const confirmRes = await fetch("/api/assets/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          key,
          fileType: file.type,
          fileSize: String(file.size),
          label: file.name,
        }),
      })
      if (!confirmRes.ok) throw new Error("Gagal konfirmasi upload")

      const asset = await confirmRes.json()
      setAssets((prev) => [asset, ...prev])
      toast.success("Materi berhasil diupload!")
    } catch (err: any) {
      toast.error(err.message || "Gagal upload")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/assets/${id}`, { method: "DELETE" })
    if (res.ok) {
      setAssets((prev) => prev.filter((a) => a.id !== id))
      toast.success("Materi dihapus")
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Materi Referensi ({assets.length})
          </span>
        </div>

        <input
          ref={fileRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="gap-1"
        >
          <FileText className="h-3 w-3" />
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <p className="text-center py-6 text-sm text-muted-foreground">
          Belum ada materi referensi
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {assets.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getFileIcon(asset.fileType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {asset.label || "File"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatFileSize(asset.fileSize)} - {new Date(asset.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Download className="h-3 w-3" />
                      </Button>
                    </a>
                    {(role === "Admin" || role === "KoreaTeam" || asset.uploadedBy === userId) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-600"
                        onClick={() => handleDelete(asset.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

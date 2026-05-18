"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Paperclip, Download, Trash2, Upload } from "lucide-react"
import { AssetItem, formatFileSize, getFileIcon } from "@/types/asset"
import { cn } from "@/lib/utils"

interface AssetListProps {
  taskId: string
  role: string
  userId: string
}

export default function AssetList({ taskId, role, userId }: AssetListProps) {
  const t = useTranslations()
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
      /* ignore */
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
      if (!presignedRes.ok) throw new Error(t("assets.uploadUrlFailed"))
      const { signedUrl, key } = await presignedRes.json()

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
      if (!uploadRes.ok) throw new Error(t("assets.uploadFailed"))

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
      if (!confirmRes.ok) throw new Error(t("assets.uploadFailed"))

      const asset = await confirmRes.json()
      setAssets((prev) => [asset, ...prev])
      toast.success(t("assets.uploaded"))
    } catch (err: any) {
      toast.error(err.message || t("assets.uploadFailed"))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/assets/${id}`, { method: "DELETE" })
    if (res.ok) {
      setAssets((prev) => prev.filter((a) => a.id !== id))
      toast.success(t("assets.deleted"))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
          <Paperclip className="size-3.5" />
          <span>
            {t("assets.sectionTitle", { n: assets.length })}
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
          size="xs"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Upload />
          {uploading ? t("common.uploading") : t("common.upload")}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-subtle/30 px-4 py-6 text-center">
          <p className="text-[11px] text-ink-muted">{t("assets.noAssets")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="rounded-md border border-line bg-surface px-3 py-2.5 flex items-center gap-3"
            >
              <div className="size-9 rounded-sm bg-subtle grid place-items-center text-[15px] shrink-0">
                {getFileIcon(asset.fileType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-ink truncate">
                  {asset.label || t("assets.fileFallback")}
                </p>
                <p className="text-[10px] font-mono tabular-nums text-ink-muted">
                  {formatFileSize(asset.fileSize)} ·{" "}
                  {new Date(asset.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <a
                  href={asset.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-7 inline-flex items-center justify-center rounded-xs text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
                  aria-label={t("assets.downloadAria")}
                >
                  <Download className="size-3.5" />
                </a>
                {(role === "Admin" ||
                  role === "KoreaTeam" ||
                  asset.uploadedBy === userId) && (
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className={cn(
                      "size-7 inline-flex items-center justify-center rounded-xs transition-colors",
                      "text-ink-muted hover:text-status-danger hover:bg-status-danger/10"
                    )}
                    aria-label={t("common.delete")}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

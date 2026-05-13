"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error)
    }
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center gap-5 px-6">
      <span className="inline-flex items-center justify-center size-14 rounded-full bg-status-danger/10 text-status-danger">
        <AlertTriangle className="size-6" />
      </span>
      <div className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
          Error
        </p>
        <h1 className="font-display italic text-4xl text-ink">
          Ada yang tidak beres
        </h1>
        <p className="max-w-md text-[13px] text-ink-secondary leading-relaxed">
          Halaman ini gagal dimuat. Periksa koneksi atau coba lagi. Jika masih
          gagal, hubungi admin.
        </p>
        {error.digest && (
          <p className="font-mono text-[10px] text-ink-muted">
            ref: {error.digest}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={reset} className="gap-1.5">
          <RotateCw className="size-4" />
          Coba lagi
        </Button>
        <a
          href="/dashboard"
          className="text-[12px] text-ink-secondary hover:text-ink underline underline-offset-4"
        >
          Kembali ke dashboard
        </a>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { MetricNumber } from "@/components/ui/metric-number"

interface WeeklyReport {
  totalMinutes: number
  tasksCompleted: number
  weekStart: string
}

function formatHours(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return { value: h, suffix: m > 0 ? `${m}m` : "h" }
}

export function EditorWeeklyCard() {
  const [report, setReport] = useState<WeeklyReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/reports/weekly/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return
        if (data && typeof data.totalMinutes === "number") {
          setReport(data)
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="rounded-lg border border-line bg-surface p-5 h-[140px] animate-pulse" />
    )
  }
  if (!report) return null

  const hours = formatHours(report.totalMinutes)

  return (
    <div className="rounded-lg border border-line bg-surface p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
          Minggu ini
        </p>
        <TrendingUp className="size-3.5 text-ink-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-3">
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            Jam kerja
          </p>
          <div className="flex items-baseline gap-1">
            <MetricNumber value={hours.value} size="md" italic />
            <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
              {hours.suffix}
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            Task selesai
          </p>
          <MetricNumber value={report.tasksCompleted} size="md" italic />
        </div>
      </div>
    </div>
  )
}

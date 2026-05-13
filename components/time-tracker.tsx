"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, Square, AlertCircle, Coffee, PlayCircle } from "lucide-react"

interface TimeLog {
  id: string
  clockIn: string
  clockOut: string | null
  durationMinutes: number | null
  breakStartedAt?: string | null
  breakMinutesTotal?: number | null
}

function workSecondsFromLog(
  log: Pick<
    TimeLog,
    "clockIn" | "breakStartedAt" | "breakMinutesTotal"
  > | null,
  nowMs: number
): number {
  if (!log) return 0
  const clockInMs = new Date(log.clockIn).getTime()
  const grossSec = Math.floor((nowMs - clockInMs) / 1000)
  const completedBreakSec = (log.breakMinutesTotal ?? 0) * 60
  const currentBreakSec = log.breakStartedAt
    ? Math.floor(
        (nowMs - new Date(log.breakStartedAt).getTime()) / 1000
      )
    : 0
  return Math.max(0, grossSec - completedBreakSec - currentBreakSec)
}

export default function TimeTracker() {
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [activeLog, setActiveLog] = useState<TimeLog | null>(null)
  const [completedSeconds, setCompletedSeconds] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [loading, setLoading] = useState(false)
  const [breakLoading, setBreakLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/time-tracker")
    const data = await res.json()
    if (res.ok) {
      setIsClockedIn(data.isClockedIn)
      setIsOnBreak(!!data.isOnBreak)
      const logs: TimeLog[] = data.todayLogs || []
      const finished = logs
        .filter((l: TimeLog) => l.clockOut)
        .reduce(
          (sum: number, l: TimeLog) => sum + (l.durationMinutes || 0) * 60,
          0
        )
      setCompletedSeconds(finished)

      if (data.isClockedIn && data.todayLog) {
        setActiveLog(data.todayLog)
      } else {
        setActiveLog(null)
        setElapsedSeconds(0)
        setIsOnBreak(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (!isClockedIn || !activeLog) return
    const tick = () =>
      setElapsedSeconds(workSecondsFromLog(activeLog, Date.now()))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isClockedIn, activeLog])

  const totalSeconds = completedSeconds + elapsedSeconds

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const formatHuman = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    if (h > 0) return `${h}j ${m}m`
    return `${m}m`
  }

  async function handleClockIn() {
    setLoading(true)
    try {
      const res = await fetch("/api/time-tracker/clock-in", { method: "POST" })
      if (res.ok) await fetchStatus()
    } finally {
      setLoading(false)
    }
  }

  async function handleClockOut() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/time-tracker/clock-out", { method: "POST" })
      if (res.ok) await fetchStatus()
      else {
        const data = await res.json()
        setError(data.message || "Gagal clock-out")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleStartBreak() {
    setBreakLoading(true)
    setError("")
    try {
      const res = await fetch("/api/time-tracker/break-start", {
        method: "POST",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message || "Gagal mulai istirahat")
      }
      await fetchStatus()
    } finally {
      setBreakLoading(false)
    }
  }

  async function handleEndBreak() {
    setBreakLoading(true)
    setError("")
    try {
      const res = await fetch("/api/time-tracker/break-end", {
        method: "POST",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message || "Gagal akhiri istirahat")
      }
      await fetchStatus()
    } finally {
      setBreakLoading(false)
    }
  }

  const hasWorkedToday = completedSeconds > 0 || isClockedIn
  const displaySeconds =
    isClockedIn ? elapsedSeconds : completedSeconds
  const dateText = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <section className="relative overflow-hidden rounded-lg border border-line bg-surface">
      {isClockedIn && !isOnBreak && (
        <div
          aria-hidden
          className="absolute -top-24 -right-20 size-72 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--status-success) 0%, transparent 70%)",
          }}
        />
      )}
      {isOnBreak && (
        <div
          aria-hidden
          className="absolute -top-24 -right-20 size-72 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--status-on-hold) 0%, transparent 70%)",
          }}
        />
      )}

      <div className="relative p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-center">
        <div className="space-y-4 min-w-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
              <span
                className={
                  isOnBreak
                    ? "size-1.5 rounded-full bg-status-on-hold animate-pulse"
                    : isClockedIn
                      ? "size-1.5 rounded-full bg-status-success animate-pulse"
                      : "size-1.5 rounded-full bg-ink-muted/40"
                }
              />
              {isOnBreak
                ? "Istirahat"
                : isClockedIn
                  ? "Sedang bekerja"
                  : "Tidak aktif"}{" "}
              · {dateText}
            </div>
            <h2 className="font-display italic text-2xl text-ink leading-none">
              {isOnBreak
                ? "Waktu kerja dijeda"
                : isClockedIn
                  ? "Sesi berjalan"
                  : "Time tracker"}
            </h2>
          </div>

          <div className="flex items-baseline gap-3">
            <span
              className="font-mono text-5xl md:text-6xl font-medium leading-none text-ink tabular-nums"
              data-tabular
            >
              {formatTime(displaySeconds)}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
              {isClockedIn ? "Kerja aktif" : "Total hari ini"}
            </span>
          </div>

          {isClockedIn && completedSeconds > 0 && (
            <p className="text-[11px] text-ink-muted">
              <span className="font-mono tabular-nums">
                {formatHuman(completedSeconds)}
              </span>{" "}
              dari sesi sebelumnya · total{" "}
              <span className="font-mono tabular-nums">
                {formatHuman(totalSeconds)}
              </span>
            </p>
          )}
          {!isClockedIn && !hasWorkedToday && (
            <p className="text-[11px] text-ink-muted">
              Belum mulai kerja hari ini.
            </p>
          )}
          {!isClockedIn && hasWorkedToday && (
            <p className="text-[11px] text-ink-muted">
              Terakhir clock-out · total{" "}
              <span className="font-mono tabular-nums">
                {formatHuman(completedSeconds)}
              </span>{" "}
              tercatat.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-[160px]">
          {isClockedIn && (
            <Button
              onClick={isOnBreak ? handleEndBreak : handleStartBreak}
              disabled={loading || breakLoading}
              variant="secondary"
              size="lg"
              className="border-line"
            >
              {breakLoading ? (
                "Memproses..."
              ) : isOnBreak ? (
                <>
                  <PlayCircle className="size-4" />
                  Lanjut kerja
                </>
              ) : (
                <>
                  <Coffee className="size-4" />
                  Istirahat
                </>
              )}
            </Button>
          )}
          <Button
            onClick={isClockedIn ? handleClockOut : handleClockIn}
            disabled={loading}
            variant={isClockedIn ? "outline" : "default"}
            size="lg"
            className={
              isClockedIn
                ? "border-status-danger/40 text-status-danger hover:bg-status-danger/10 hover:border-status-danger/60"
                : ""
            }
          >
            {isClockedIn ? (
              <Square className="fill-current" />
            ) : (
              <Play className="fill-current" />
            )}
            {loading ? "Memproses..." : isClockedIn ? "Selesai" : "Mulai kerja"}
          </Button>
          {activeLog && isClockedIn && (
            <p className="text-center text-[10px] text-ink-muted">
              Mulai{" "}
              <span className="font-mono tabular-nums">
                {new Date(activeLog.clockIn).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {isOnBreak && activeLog.breakStartedAt && (
                <>
                  {" "}
                  · istirahat sejak{" "}
                  <span className="font-mono tabular-nums">
                    {new Date(activeLog.breakStartedAt).toLocaleTimeString(
                      "id-ID",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="border-t border-line bg-status-danger/10 px-6 py-2.5 flex items-center gap-2 text-[12px] text-status-danger">
          <AlertCircle className="size-3.5" /> {error}
        </div>
      )}
    </section>
  )
}

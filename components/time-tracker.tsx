"use client"

import { useState, useEffect, useCallback } from "react"

interface TimeLog {
  id: string
  clockIn: string
  clockOut: string | null
  durationMinutes: number | null
}

export default function TimeTracker() {
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [clockedInAt, setClockedInAt] = useState<string | null>(null)
  const [completedSeconds, setCompletedSeconds] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/time-tracker")
    const data = await res.json()
    if (res.ok) {
      setIsClockedIn(data.isClockedIn)

      // Compute completed seconds from finished sessions
      const logs: TimeLog[] = data.todayLogs || []
      const finished = logs
        .filter((l: TimeLog) => l.clockOut)
        .reduce((sum: number, l: TimeLog) => sum + (l.durationMinutes || 0) * 60, 0)
      setCompletedSeconds(finished)

      if (data.isClockedIn && data.todayLog) {
        setClockedInAt(data.todayLog.clockIn)
      } else {
        setClockedInAt(null)
        setElapsedSeconds(0)
      }
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Real-time stopwatch for current session
  useEffect(() => {
    if (!isClockedIn || !clockedInAt) return

    const startedAt = new Date(clockedInAt).getTime()
    const tick = () => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isClockedIn, clockedInAt])

  const totalSeconds = completedSeconds + elapsedSeconds

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
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
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleClockOut() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/time-tracker/clock-out", { method: "POST" })
      if (res.ok) {
        await fetchStatus()
      } else {
        const data = await res.json()
        setError(data.message || "Gagal clock-out")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const hasWorkedToday = completedSeconds > 0 || isClockedIn

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Time Tracker</h2>
          <p className="text-sm text-zinc-500">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={isClockedIn ? handleClockOut : handleClockIn}
          disabled={loading}
          className={`rounded-lg px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-50 ${
            isClockedIn
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {loading ? "Memproses..." : isClockedIn ? "Selesai Kerja" : "Mulai Kerja"}
        </button>
      </div>

      {/* Current session stopwatch */}
      {isClockedIn && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-800">Sedang bekerja</span>
            <span className="ml-auto font-mono text-2xl font-bold text-green-900 tabular-nums">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          <p className="mt-1 text-xs text-green-600">
            Clock-in sejak{" "}
            {clockedInAt
              ? new Date(clockedInAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
              : ""}
          </p>
        </div>
      )}

      {/* Total today */}
      <div className={`rounded-lg border p-5 ${hasWorkedToday ? "border-zinc-200 bg-white" : "border-zinc-200 bg-zinc-50"}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-600">Total hari ini</span>
          <span className="font-mono text-xl font-bold text-zinc-900 tabular-nums">
            {formatTime(totalSeconds)}
          </span>
        </div>
        {isClockedIn && completedSeconds > 0 && (
          <p className="mt-1 text-xs text-zinc-400">
            {formatHuman(completedSeconds)} dari sesi sebelumnya + {formatHuman(elapsedSeconds)} sesi ini
          </p>
        )}
        {!isClockedIn && !hasWorkedToday && (
          <p className="mt-1 text-xs text-zinc-400">Belum ada waktu kerja hari ini</p>
        )}
        {!isClockedIn && hasWorkedToday && (
          <p className="mt-1 text-xs text-zinc-400">
            Terakhir clock-out: {formatHuman(completedSeconds)} tercatat
          </p>
        )}
      </div>
    </div>
  )
}

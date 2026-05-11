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
  const [todayLogs, setTodayLogs] = useState<TimeLog[]>([])
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [loading, setLoading] = useState(false)

  const minutesToHours = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}j ${m}m`
  }

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/time-tracker")
    const data = await res.json()
    if (res.ok) {
      setIsClockedIn(data.isClockedIn)
      setTodayLogs(data.todayLogs || [])
      setTotalMinutes(data.totalDurationMinutes || 0)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

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
    try {
      const res = await fetch("/api/time-tracker/clock-out", { method: "POST" })
      if (res.ok) await fetchStatus()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Time Tracker
          </h2>
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
          {loading
            ? "Memproses..."
            : isClockedIn
            ? "Selesai Kerja"
            : "Mulai Kerja"}
        </button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              isClockedIn ? "bg-green-500 animate-pulse" : "bg-zinc-400"
            }`}
          />
          <span className="text-sm font-medium text-zinc-700">
            {isClockedIn ? "Sedang bekerja" : "Belum clock-in"}
          </span>
          <span className="ml-auto text-sm font-semibold text-zinc-900">
            {minutesToHours(totalMinutes)}
          </span>
        </div>
      </div>

      {todayLogs.length > 0 && (
        <div className="rounded-lg border border-zinc-200">
          <div className="border-b border-zinc-200 px-4 py-2">
            <h3 className="text-xs font-semibold uppercase text-zinc-500">
              Riwayat Hari Ini
            </h3>
          </div>
          <div className="divide-y divide-zinc-100">
            {todayLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-zinc-600">
                    {formatTime(log.clockIn)}
                  </span>
                  {log.clockOut ? (
                    <>
                      <span className="text-zinc-400">—</span>
                      <span className="text-zinc-600">
                        {formatTime(log.clockOut)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-zinc-400">sedang berjalan</span>
                  )}
                </div>
                {log.durationMinutes != null && (
                  <span className="font-medium text-zinc-700">
                    {minutesToHours(log.durationMinutes)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

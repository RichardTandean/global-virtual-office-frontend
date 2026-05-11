"use client"

import { useState, useEffect, useCallback } from "react"

interface TaskTimerProps {
  taskId: string
  onStatusChange?: () => void
}

export default function TaskTimer({ taskId, onStatusChange }: TaskTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [currentMinutes, setCurrentMinutes] = useState(0)
  const [loading, setLoading] = useState(false)

  const minutesToHours = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}j ${m}m`
  }

  const fetchStatus = useCallback(async () => {
    const res = await fetch(`/api/tasks/${taskId}/timer`)
    if (res.ok) {
      const data = await res.json()
      setIsRunning(data.isRunning)
      setTotalMinutes(data.totalDurationMinutes || 0)
      setCurrentMinutes(data.currentDurationMinutes || 0)
    }
  }, [taskId])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setCurrentMinutes((prev) => prev + 1)
      setTotalMinutes((prev) => prev + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [isRunning])

  async function handleStart() {
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}/timer/start`, {
        method: "POST",
      })
      if (res.ok) {
        await fetchStatus()
        onStatusChange?.()
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleStop() {
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}/timer/stop`, {
        method: "POST",
      })
      if (res.ok) {
        await fetchStatus()
        onStatusChange?.()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold uppercase text-zinc-500">
            Timer Task
          </h4>
          <p className="mt-1 text-sm font-semibold text-zinc-900">
            {minutesToHours(totalMinutes)}
          </p>
          {isRunning && (
            <p className="text-xs text-zinc-500">
              Sedang berjalan: {minutesToHours(currentMinutes)}
            </p>
          )}
        </div>
        <button
          onClick={isRunning ? handleStop : handleStart}
          disabled={loading}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
            isRunning
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading
            ? "Memproses..."
            : isRunning
            ? "Stop Timer"
            : "Start Timer"}
        </button>
      </div>
    </div>
  )
}

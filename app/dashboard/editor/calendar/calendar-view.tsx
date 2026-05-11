"use client"

import { useMemo } from "react"
import { statusLabels, statusColors } from "@/types/task"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns"
import { id } from "date-fns/locale"

interface TaskItem {
  id: string
  title: string
  deadline: string | null
  status: string
  assignee: { id: string; name: string }
}

interface TimeLog {
  id: string
  clockIn: string
  clockOut: string | null
  durationMinutes: number | null
  date: string
}

interface Props {
  tasks: TaskItem[]
  timeLogs: TimeLog[]
}

export default function CalendarView({ tasks, timeLogs }: Props) {
  const today = startOfDay(new Date())
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const tasksByDate = useMemo(() => {
    const map: Record<string, TaskItem[]> = {}
    for (const task of tasks) {
      if (!task.deadline) continue
      const key = new Date(task.deadline).toDateString()
      if (!map[key]) map[key] = []
      map[key].push(task)
    }
    return map
  }, [tasks])

  const logsByDate = useMemo(() => {
    const map: Record<string, TimeLog[]> = {}
    for (const log of timeLogs) {
      const key = new Date(log.date).toDateString()
      if (!map[key]) map[key] = []
      map[key].push(log)
    }
    return map
  }, [timeLogs])

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })

  const minToHM = (m: number) => `${Math.floor(m / 60)}j ${m % 60}m`

  return (
    <div className="space-y-8">
      {/* Calendar */}
      <div className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            {format(today, "MMMM yyyy", { locale: id })}
          </h2>
        </div>
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-zinc-500 border-b border-zinc-100">
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = day.toDateString()
            const dayTasks = tasksByDate[key] || []
            const current = isToday(day)
            const isCurrentMonth = day.getMonth() === today.getMonth()
            const isPast = isBefore(day, today) && !isSameDay(day, today)

            return (
              <div
                key={key}
                className={`min-h-[90px] border-b border-r border-zinc-100 p-1.5 ${
                  current ? "bg-blue-50" : "bg-white"
                } ${!isCurrentMonth ? "opacity-30" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      current
                        ? "flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white"
                        : isPast && isCurrentMonth
                        ? "text-zinc-900"
                        : "text-zinc-400"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="mt-0.5 space-y-0.5">
                  {dayTasks.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="truncate rounded px-1 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor:
                          t.status === "Completed"
                            ? "#dcfce7"
                            : new Date(t.deadline!) < today
                            ? "#fecaca"
                            : "#dbeafe",
                      }}
                    >
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-zinc-400">
                      +{dayTasks.length - 3} lagi
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming deadlines */}
      {tasks.filter((t) => t.deadline && t.status !== "Completed" && isAfter(new Date(t.deadline), today)).length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-zinc-900">
              Deadline Mendatang
            </h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {tasks
              .filter(
                (t) =>
                  t.deadline &&
                  t.status !== "Completed" &&
                  isAfter(new Date(t.deadline), today)
              )
              .sort(
                (a, b) =>
                  new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
              )
              .map((t) => (
                <div key={t.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {t.title}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Deadline:{" "}
                      {format(new Date(t.deadline!), "EEEE, d MMMM yyyy", {
                        locale: id,
                      })}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusColors[t.status] || ""
                    }`}
                  >
                    {statusLabels[t.status] || t.status}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Riwayat Hari Ini */}
      <div className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            Riwayat Kerja Hari Ini
          </h2>
        </div>
        {timeLogs.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-zinc-400">
            Belum ada riwayat clock-in hari ini
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {timeLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between px-6 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-zinc-600">{formatTime(log.clockIn)}</span>
                  {log.clockOut ? (
                    <>
                      <span className="text-zinc-400">—</span>
                      <span className="text-zinc-600">{formatTime(log.clockOut)}</span>
                    </>
                  ) : (
                    <span className="text-xs text-zinc-400">sedang berjalan</span>
                  )}
                </div>
                {log.durationMinutes != null && (
                  <span className="font-medium text-zinc-700">
                    {minToHM(log.durationMinutes)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

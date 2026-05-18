"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { StatusDot } from "@/components/ui/status-pill"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STATUS_LABEL_KEYS, type TaskStatus } from "@/types/task"

export interface CalendarTask {
  id: string
  title: string
  deadline: string | null
  status: string
  assignee: { id: string; name: string }
}

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  type: "holiday" | "event" | "meeting"
  date: string
  endDate: string | null
  isAllDay: boolean
  color: string | null
  createdBy: string
}

interface CalendarWeekProps {
  tasks: CalendarTask[]
  events?: CalendarEvent[]
  role: "Editor" | "KoreaTeam" | "Admin"
  onTaskClick?: (task: CalendarTask) => void
  onEventClick?: (event: CalendarEvent) => void
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

const EVENT_COLORS: Record<string, string> = {
  holiday: "bg-status-danger/10 border-status-danger/20 text-status-danger",
  event: "bg-accent/10 border-accent/30 text-accent",
  meeting: "bg-status-success/10 border-status-success/20 text-status-success",
}

function eventTypeKey(type: string): string {
  switch (type) {
    case "holiday": return "calendar.holiday"
    case "meeting": return "calendar.meeting"
    default: return "calendar.event"
  }
}

export function CalendarWeek({ tasks, events, role, onTaskClick, onEventClick }: CalendarWeekProps) {
  const t = useTranslations()
  const [view, setView] = useState<"week" | "month">("week")
  const [anchor, setAnchor] = useState<Date>(() => new Date())
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")

  const dayLabels = useMemo(() => t("calendar.dayLabels") as unknown as string[], [t])
  const monthLabels = useMemo(() => t("calendar.monthLabels") as unknown as string[], [t])

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const assignees = useMemo(() => {
    const seen = new Map<string, string>()
    for (const t of tasks) {
      if (t.assignee?.id) seen.set(t.assignee.id, t.assignee.name)
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.deadline) return false
      if (statusFilter === "active" && t.status === "Completed") return false
      if (
        statusFilter !== "active" &&
        statusFilter !== "all" &&
        t.status !== statusFilter
      )
        return false
      if (assigneeFilter !== "all" && t.assignee?.id !== assigneeFilter)
        return false
      return true
    })
  }, [tasks, statusFilter, assigneeFilter])

  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTask[]>()
    for (const t of filteredTasks) {
      if (!t.deadline) continue
      const d = new Date(t.deadline)
      const key = dayKey(d)
      const arr = map.get(key) || []
      arr.push(t)
      map.set(key, arr)
    }
    return map
  }, [filteredTasks])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    if (!events) return map
    for (const e of events) {
      const start = new Date(e.date)
      const end = e.endDate ? new Date(e.endDate) : start
      const cursor = new Date(start)
      while (cursor <= end) {
        const key = dayKey(cursor)
        const arr = map.get(key) || []
        arr.push(e)
        map.set(key, arr)
        cursor.setDate(cursor.getDate() + 1)
      }
    }
    return map
  }, [events])

  const weekDays = useMemo(() => {
    const start = startOfWeek(anchor)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [anchor])

  const monthDays = useMemo(() => {
    const start = startOfMonth(anchor)
    const weekStart = startOfWeek(start)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    })
  }, [anchor])

  function step(dir: -1 | 1) {
    setAnchor((cur) => {
      const next = new Date(cur)
      if (view === "week") next.setDate(next.getDate() + dir * 7)
      else next.setMonth(next.getMonth() + dir)
      return next
    })
  }

  const title =
    view === "week"
      ? `${weekDays[0].getDate()} ${monthLabels[weekDays[0].getMonth()]} \u2013 ${weekDays[6].getDate()} ${monthLabels[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`
      : `${monthLabels[anchor.getMonth()]} ${anchor.getFullYear()}`

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => step(-1)}
            aria-label={t("calendar.previous")}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="font-display italic text-2xl text-ink leading-none">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => step(1)}
            aria-label={t("calendar.next")}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="ml-2"
            onClick={() => setAnchor(new Date())}
          >
            {t("calendar.today")}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {role !== "Editor" && assignees.length > 0 && (
            <Select
              value={assigneeFilter}
              onValueChange={(v) => setAssigneeFilter(v ?? "all")}
            >
              <SelectTrigger size="sm" className="w-44">
                <SelectValue placeholder={t("calendar.allEditors")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("calendar.allEditors")}</SelectItem>
                {assignees.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v ?? "active")}
          >
            <SelectTrigger size="sm" className="w-40">
              <SelectValue placeholder={t("calendar.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t("calendar.activeFilter")}</SelectItem>
              <SelectItem value="all">{t("calendar.allStatuses")}</SelectItem>
              {Object.entries(STATUS_LABEL_KEYS).map(([statusValue, key]) => (
                <SelectItem key={statusValue} value={statusValue}>
                  {t(key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="inline-flex rounded-sm border border-line bg-surface p-0.5">
            <button
              onClick={() => setView("week")}
              className={cn(
                "px-3 h-7 text-[11px] font-medium rounded-xs transition-colors",
                view === "week"
                  ? "bg-accent text-accent-foreground"
                  : "text-ink-secondary hover:text-ink",
              )}
            >
              {t("calendar.week")}
            </button>
            <button
              onClick={() => setView("month")}
              className={cn(
                "px-3 h-7 text-[11px] font-medium rounded-xs transition-colors",
                view === "month"
                  ? "bg-accent text-accent-foreground"
                  : "text-ink-secondary hover:text-ink",
              )}
            >
              {t("calendar.month")}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-line bg-surface overflow-hidden">
        {view === "week" ? (
          <WeekGrid
            days={weekDays}
            today={today}
            tasksByDay={tasksByDay}
            eventsByDay={eventsByDay}
            onTaskClick={onTaskClick}
            onEventClick={onEventClick}
            dayLabels={dayLabels}
          />
        ) : (
          <MonthGrid
            days={monthDays}
            anchor={anchor}
            today={today}
            tasksByDay={tasksByDay}
            eventsByDay={eventsByDay}
            onTaskClick={onTaskClick}
            onEventClick={onEventClick}
            dayLabels={dayLabels}
          />
        )}
      </div>

      {filteredTasks.length === 0 && (
        <EmptyState
          icon={<CalendarDays />}
          title={t("calendar.noDeadlines")}
          description={t("calendar.noDeadlinesDesc")}
        />
      )}
    </div>
  )
}

function WeekGrid({
  days,
  today,
  tasksByDay,
  eventsByDay,
  onTaskClick,
  onEventClick,
  dayLabels,
}: {
  days: Date[]
  today: Date
  tasksByDay: Map<string, CalendarTask[]>
  eventsByDay: Map<string, CalendarEvent[]>
  onTaskClick?: (task: CalendarTask) => void
  onEventClick?: (event: CalendarEvent) => void
  dayLabels: string[]
}) {
  const t = useTranslations()

  return (
    <div className="grid grid-cols-7 divide-x divide-line">
      {days.map((d, i) => {
        const items = tasksByDay.get(dayKey(d)) || []
        const evts = eventsByDay.get(dayKey(d)) || []
        const isToday = isSameDay(d, today)
        const isWeekend = d.getDay() === 0 || d.getDay() === 6
        return (
          <div
            key={i}
            className={cn(
              "min-h-[180px] p-2.5 flex flex-col gap-2",
              isWeekend && "bg-subtle/30",
            )}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                {dayLabels[i]}
              </span>
              <span
                className={cn(
                  "inline-flex items-center justify-center size-7 rounded-pill text-[13px] font-mono tabular-nums",
                  isToday
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-ink-secondary",
                )}
              >
                {d.getDate()}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {evts.map((e) => (
                <button
                  key={e.id}
                  onClick={() => onEventClick?.(e)}
                  className={cn(
                    "rounded-xs border px-1.5 py-0.5 text-[10px] font-medium text-left truncate hover:opacity-80 transition-opacity",
                    EVENT_COLORS[e.type] || EVENT_COLORS.event,
                  )}
                  title={`${t(eventTypeKey(e.type))}: ${e.title}`}
                >
                  {e.title}
                </button>
              ))}
              {items.slice(0, 6).map((t) => (
                <button
                  key={t.id}
                  onClick={() => onTaskClick?.(t)}
                  className="group flex items-start gap-1.5 rounded-xs border border-line bg-canvas px-2 py-1.5 text-left hover:border-line-strong hover:bg-elevated transition-colors duration-(--dur-fast)"
                  title={`${t.title} \u2014 ${t.assignee?.name ?? ""}`}
                >
                  <StatusDot
                    status={t.status as TaskStatus}
                    className="mt-1 shrink-0"
                  />
                  <span className="text-[11px] leading-snug text-ink truncate group-hover:text-ink">
                    {t.title}
                  </span>
                </button>
              ))}
              {items.length > 6 && (
                <span className="text-[10px] text-ink-muted">
                  {t("calendar.moreItems", { n: items.length - 6 })}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MonthGrid({
  days,
  anchor,
  today,
  tasksByDay,
  eventsByDay,
  onTaskClick,
  onEventClick,
  dayLabels,
}: {
  days: Date[]
  anchor: Date
  today: Date
  tasksByDay: Map<string, CalendarTask[]>
  eventsByDay: Map<string, CalendarEvent[]>
  onTaskClick?: (task: CalendarTask) => void
  onEventClick?: (event: CalendarEvent) => void
  dayLabels: string[]
}) {
  const t = useTranslations()

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-line bg-subtle/30">
        {dayLabels.map((d) => (
          <div
            key={d}
            className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-ink-muted"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-line">
        {days.map((d, i) => {
          const items = tasksByDay.get(dayKey(d)) || []
          const evts = eventsByDay.get(dayKey(d)) || []
          const isToday = isSameDay(d, today)
          const inMonth = d.getMonth() === anchor.getMonth()
          return (
            <div
              key={i}
              className={cn(
                "min-h-[90px] p-1.5 flex flex-col gap-1",
                !inMonth && "bg-subtle/30 opacity-50",
              )}
            >
              <div
                className={cn(
                  "self-end inline-flex items-center justify-center size-6 rounded-pill text-[11px] font-mono tabular-nums",
                  isToday
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-ink-secondary",
                )}
              >
                {d.getDate()}
              </div>
              <div className="flex flex-col gap-0.5">
                {evts.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onEventClick?.(e)}
                    className={cn(
                      "rounded-xs px-1 py-0.5 text-[9px] font-medium text-left truncate hover:opacity-80 transition-opacity",
                      EVENT_COLORS[e.type] || EVENT_COLORS.event,
                    )}
                    title={`${t(eventTypeKey(e.type))}: ${e.title}`}
                  >
                    {e.title}
                  </button>
                ))}
                {items.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onTaskClick?.(t)}
                    className="flex items-center gap-1 rounded-xs px-1 py-0.5 hover:bg-subtle/60 transition-colors"
                    title={t.title}
                  >
                    <StatusDot
                      status={t.status as TaskStatus}
                      className="shrink-0"
                    />
                    <span className="text-[10px] text-ink truncate">
                      {t.title}
                    </span>
                  </button>
                ))}
                {items.length > 3 && (
                  <span className="text-[9px] text-ink-muted px-1">
                    {t("calendar.moreItems", { n: items.length - 3 })}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

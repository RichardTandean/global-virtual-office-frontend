"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { CalendarWeek, type CalendarTask, type CalendarEvent } from "./calendar-week"

interface CalendarPanelProps {
  tasks: CalendarTask[]
  events: CalendarEvent[]
  role: "Editor" | "KoreaTeam" | "Admin"
  onEventClick?: (event: CalendarEvent) => void
}

const ROLE_BASE: Record<CalendarPanelProps["role"], string> = {
  Editor: "/dashboard/editor",
  KoreaTeam: "/dashboard/korea",
  Admin: "/dashboard/admin",
}

export function CalendarPanel({ tasks, events, role, onEventClick }: CalendarPanelProps) {
  const router = useRouter()

  const handleClick = useCallback(
    (task: CalendarTask) => {
      router.push(`${ROLE_BASE[role]}?task=${task.id}`)
    },
    [router, role],
  )

  return (
    <CalendarWeek
      tasks={tasks}
      events={events}
      role={role}
      onTaskClick={handleClick}
      onEventClick={onEventClick}
    />
  )
}

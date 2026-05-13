"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { CalendarWeek, type CalendarTask } from "./calendar-week"

interface CalendarPanelProps {
  tasks: CalendarTask[]
  role: "Editor" | "KoreaTeam" | "Admin"
}

const ROLE_BASE: Record<CalendarPanelProps["role"], string> = {
  Editor: "/dashboard/editor",
  KoreaTeam: "/dashboard/korea",
  Admin: "/dashboard/admin",
}

export function CalendarPanel({ tasks, role }: CalendarPanelProps) {
  const router = useRouter()

  const handleClick = useCallback(
    (task: CalendarTask) => {
      router.push(`${ROLE_BASE[role]}?task=${task.id}`)
    },
    [router, role],
  )

  return <CalendarWeek tasks={tasks} role={role} onTaskClick={handleClick} />
}

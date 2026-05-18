import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import { AdminCalendarClient } from "./admin-calendar-client"
import type { CalendarTask, CalendarEvent } from "@/components/calendar/calendar-week"

export default async function AdminCalendarPage() {
  await requireRole("Admin")

  const month = new Date().toISOString().slice(0, 7)

  let tasks: CalendarTask[] = []
  try {
    const res = await fetchBackend("/tasks")
    if (res.ok) tasks = await res.json()
  } catch {}

  let events: CalendarEvent[] = []
  try {
    const res = await fetchBackend(`/events?month=${month}`)
    if (res.ok) events = await res.json()
  } catch {}

  return (
    <AdminCalendarClient
      initialTasks={tasks}
      initialEvents={events}
      month={month}
    />
  )
}

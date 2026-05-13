import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import { PageHeader } from "@/components/shell/page-header"
import { CalendarPanel } from "@/components/calendar/calendar-panel"
import type { CalendarTask } from "@/components/calendar/calendar-week"

export default async function AdminCalendarPage() {
  await requireRole("Admin")

  let tasks: CalendarTask[] = []
  try {
    const res = await fetchBackend("/tasks")
    if (res.ok) tasks = await res.json()
  } catch {}

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kalender"
        title="Operasi Tim"
        description="Tinjau deadline semua role dan tim secara keseluruhan."
      />
      <CalendarPanel tasks={tasks} role="Admin" />
    </div>
  )
}

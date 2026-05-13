import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import { PageHeader } from "@/components/shell/page-header"
import { CalendarPanel } from "@/components/calendar/calendar-panel"
import type { CalendarTask } from "@/components/calendar/calendar-week"

export default async function EditorCalendarPage() {
  await requireRole("Editor")

  let tasks: CalendarTask[] = []
  try {
    const res = await fetchBackend("/tasks")
    if (res.ok) tasks = await res.json()
  } catch {}

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kalender"
        title="Jadwal & Deadline"
        description="Lihat deadline task kamu dalam tampilan minggu atau bulan."
      />
      <CalendarPanel tasks={tasks} role="Editor" />
    </div>
  )
}

import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import SignOutButton from "@/components/sign-out-button"
import CalendarView from "../../editor/calendar/calendar-view"

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

export default async function AdminCalendarPage() {
  const session = await requireRole("Admin")

  let tasks: TaskItem[] = []
  let timeLogs: TimeLog[] = []

  try {
    const [tasksRes, logsRes] = await Promise.all([
      fetchBackend("/tasks"),
      fetchBackend("/time-tracker/today"),
    ])
    if (tasksRes.ok) tasks = await tasksRes.json()
    if (logsRes.ok) {
      const { todayLogs } = await logsRes.json()
      timeLogs = todayLogs || []
    }
  } catch {}

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Kalender</h1>
            <p className="text-xs text-zinc-500">Deadline Task & Aktivitas Tim</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard/admin" className="text-xs text-zinc-500 hover:text-zinc-700 underline">
              Dashboard
            </a>
            <span className="text-sm text-zinc-600">{session.user?.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <CalendarView tasks={tasks} timeLogs={timeLogs} />
      </main>
    </div>
  )
}

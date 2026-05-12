import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import { TaskItem } from "@/types/task"
import TimeTracker from "@/components/time-tracker"
import SignOutButton from "@/components/sign-out-button"
import EditorTaskView from "./task-view"
import OnlineEditors from "./online-editors"

interface UserItem {
  id: string
  name: string
  email: string
  role: string
}

interface TimeLogItem {
  id: string
  userId: string
  clockIn: string
  clockOut: string | null
  durationMinutes: number | null
  user: { id: string; name: string; email: string }
}

export default async function EditorDashboard() {
  const session = await requireRole("Editor")

  let tasks: TaskItem[] = []
  let onlineUsers: { id: string; name: string }[] = []
  let fetchError: string | null = null

  try {
    const [tasksRes, logsRes, usersRes] = await Promise.all([
      fetchBackend("/tasks"),
      fetchBackend("/time-tracker/today"),
      fetchBackend("/users"),
    ])

    if (tasksRes.ok) tasks = await tasksRes.json()

    if (logsRes.ok && usersRes.ok) {
      const { todayLogs }: { todayLogs: TimeLogItem[] } = await logsRes.json()
      const users: UserItem[] = await usersRes.json()
      const clockedInIds = new Set(
        todayLogs.filter((l) => !l.clockOut).map((l) => l.userId)
      )
      onlineUsers = users
        .filter((u) => clockedInIds.has(u.id) && u.role === "Editor")
        .map((u) => ({ id: u.id, name: u.name }))
    }
  } catch {
    fetchError = "Terjadi kesalahan koneksi"
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Lejel WFH</h1>
            <p className="text-xs text-zinc-500">Editor Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/dashboard/editor/tasks"
              className="text-xs text-zinc-500 hover:text-zinc-700 underline"
            >
              Task
            </a>
            <a
              href="/dashboard/editor/calendar"
              className="text-xs text-zinc-500 hover:text-zinc-700 underline"
            >
              Kalender
            </a>
            <span className="text-sm text-zinc-600">
              {session.user?.name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <TimeTracker />

        {onlineUsers.length > 0 && <OnlineEditors users={onlineUsers} />}

        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Task Saya
          </h2>
          {fetchError ? (
            <p className="text-sm text-red-500">{fetchError}</p>
          ) : (
            <EditorTaskView initialTasks={tasks} mode="preview" />
          )}
        </div>
      </main>
    </div>
  )
}

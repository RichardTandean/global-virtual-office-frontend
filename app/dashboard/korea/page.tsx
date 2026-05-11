import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import { TaskItem } from "@/types/task"
import SignOutButton from "@/components/sign-out-button"
import KoreaTaskView from "./task-view"

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

export default async function KoreaDashboard() {
  const session = await requireRole("KoreaTeam")

  let tasks: TaskItem[] = []
  let editors: UserItem[] = []
  let clockedInIds: Set<string> = new Set()
  let fetchError: string | null = null

  try {
    const [tasksRes, usersRes, logsRes] = await Promise.all([
      fetchBackend("/tasks"),
      fetchBackend("/users"),
      fetchBackend("/time-tracker/today"),
    ])

    if (tasksRes.ok) tasks = await tasksRes.json()
    if (usersRes.ok) {
      const users: UserItem[] = await usersRes.json()
      editors = users.filter((u) => u.role === "Editor")
    }
    if (logsRes.ok) {
      const { todayLogs }: { todayLogs: TimeLogItem[] } = await logsRes.json()
      clockedInIds = new Set(
        todayLogs.filter((l) => !l.clockOut).map((l) => l.userId)
      )
    }
  } catch {
    fetchError = "Terjadi kesalahan koneksi"
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Lejel WFH</h1>
            <p className="text-xs text-zinc-500">Korea Team Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/dashboard/korea/calendar"
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

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {fetchError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {fetchError}
          </div>
        )}

        {/* Editor status overview */}
        {editors.length > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Status Editor Hari Ini
              </h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {editors.map((ed) => {
                const inOffice = clockedInIds.has(ed.id)
                return (
                  <div
                    key={ed.id}
                    className="flex items-center justify-between px-6 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {ed.name}
                      </p>
                      <p className="text-xs text-zinc-500">{ed.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          inOffice ? "bg-green-500" : "bg-zinc-300"
                        }`}
                      />
                      <span className="text-xs text-zinc-500">
                        {inOffice ? "Sedang bekerja" : "Belum clock-in"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Task management */}
        <KoreaTaskView
          initialTasks={tasks}
          editors={editors}
        />
      </main>
    </div>
  )
}

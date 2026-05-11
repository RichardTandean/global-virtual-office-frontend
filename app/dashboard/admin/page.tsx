import { requireRole } from "@/lib/auth-helpers"
import SignOutButton from "@/components/sign-out-button"
import { fetchBackend } from "@/lib/session"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface TimeLog {
  id: string
  userId: string
  clockIn: string
  clockOut: string | null
  durationMinutes: number | null
  user: { id: string; name: string; email: string }
}

interface AdminTask {
  id: string
  title: string
  status: string
  assignedTo: string
  progressPercent: number
  deadline: string | null
  revisionNote: string | null
  youtubeUrl: string | null
}

export default async function AdminDashboard() {
  const session = await requireRole("Admin")

  const [usersRes, logsRes, tasksRes] = await Promise.all([
    fetchBackend("/users"),
    fetchBackend("/time-tracker/today"),
    fetchBackend("/tasks"),
  ])

  if (!usersRes.ok || !logsRes.ok) {
    throw new Error("Failed to fetch admin data")
  }

  const users: User[] = await usersRes.json()
  const { todayLogs }: { todayLogs: TimeLog[] } = await logsRes.json()

  let tasks: AdminTask[] = []
  if (tasksRes.ok) {
    tasks = await tasksRes.json()
  }

  const clockedInUserIds = new Set(
    todayLogs.filter((l) => !l.clockOut).map((l) => l.userId)
  )

  const usersWithStatus = users.map((u) => ({
    ...u,
    clockedIn: clockedInUserIds.has(u.id),
  }))

  const editors = users.filter((u) => u.role === "Editor")

  const taskCounts = {
    total: tasks.length,
    editing: tasks.filter((t) => t.status === "Editing").length,
    needReview: tasks.filter((t) => t.status === "NeedToBeReviewed").length,
    review: tasks.filter((t) => t.status === "Review").length,
    revise: tasks.filter((t) => t.status === "Revise").length,
    readyToUpload: tasks.filter((t) => t.status === "ReadyToUpload").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Lejel WFH</h1>
            <p className="text-xs text-zinc-500">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/dashboard/admin/calendar"
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
        {/* Stats overview */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">Total User</p>
            <p className="text-3xl font-bold text-zinc-900">{users.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">Clock-in Hari Ini</p>
            <p className="text-3xl font-bold text-green-600">
              {clockedInUserIds.size}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">Total Task</p>
            <p className="text-3xl font-bold text-zinc-900">
              {taskCounts.total}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">Task Selesai</p>
            <p className="text-3xl font-bold text-green-600">
              {taskCounts.completed}
            </p>
          </div>
        </div>

        {/* Task stats breakdown */}
        {taskCounts.total > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Status Task
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-px bg-zinc-200 sm:grid-cols-4">
              {[
                { label: "Dikerjakan", count: taskCounts.editing, color: "text-blue-600" },
                { label: "Perlu Review", count: taskCounts.needReview, color: "text-purple-600" },
                { label: "Direview", count: taskCounts.review, color: "text-yellow-600" },
                { label: "Revisi", count: taskCounts.revise, color: "text-orange-600" },
                { label: "Siap Upload", count: taskCounts.readyToUpload, color: "text-teal-600" },
                { label: "Selesai", count: taskCounts.completed, color: "text-green-600" },
                {
                  label: "Ditugaskan",
                  count: taskCounts.total - taskCounts.editing - taskCounts.needReview - taskCounts.review - taskCounts.revise - taskCounts.readyToUpload - taskCounts.completed,
                  color: "text-zinc-600",
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.count}
                  </p>
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor status list */}
        <div className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-zinc-900">
              Status Tim Hari Ini
            </h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {usersWithStatus.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                    {user.role === "Admin"
                      ? "Admin"
                      : user.role === "KoreaTeam"
                      ? "Korea Team"
                      : "Editor"}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      user.clockedIn ? "bg-green-500" : "bg-zinc-300"
                    }`}
                  />
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="px-6 py-4 text-sm text-zinc-400">
                Belum ada user terdaftar.
              </p>
            )}
          </div>
        </div>

        {/* Editor list with task context */}
        {editors.length > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Editor & Task
              </h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {editors.map((ed) => {
                const editorTasks = tasks.filter(
                  (t) => t.assignedTo === ed.id
                )
                const doneTasks = editorTasks.filter(
                  (t) => t.status === "Completed"
                )
                const activeTasks = editorTasks.filter(
                  (t) => t.status !== "Completed"
                )
                return (
                  <div
                    key={ed.id}
                    className="flex items-center justify-between px-6 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {ed.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {activeTasks.length} task aktif
                        {doneTasks.length > 0 &&
                          ` · ${doneTasks.length} selesai`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          clockedInUserIds.has(ed.id)
                            ? "bg-green-500"
                            : "bg-zinc-300"
                        }`}
                      />
                      <span className="text-xs text-zinc-500">
                        {clockedInUserIds.has(ed.id)
                          ? "Online"
                          : "Offline"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

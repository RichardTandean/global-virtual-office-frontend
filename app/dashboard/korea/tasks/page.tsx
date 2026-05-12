import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import { TaskItem } from "@/types/task"
import SignOutButton from "@/components/sign-out-button"
import KoreaTaskView from "../task-view"
import { ArrowLeft } from "lucide-react"

interface UserItem {
  id: string
  name: string
  email: string
  role: string
}

export default async function KoreaTasksPage() {
  const session = await requireRole("KoreaTeam")

  let tasks: TaskItem[] = []
  let editors: UserItem[] = []
  let fetchError: string | null = null

  try {
    const [tasksRes, usersRes] = await Promise.all([
      fetchBackend("/tasks"),
      fetchBackend("/users"),
    ])

    if (tasksRes.ok) tasks = await tasksRes.json()
    if (usersRes.ok) {
      const users: UserItem[] = await usersRes.json()
      editors = users.filter((u) => u.role === "Editor")
    }
  } catch {
    fetchError = "Terjadi kesalahan koneksi"
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <a
              href="/dashboard/korea"
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
            >
              <ArrowLeft className="h-3 w-3" />
              Dashboard
            </a>
            <div>
              <h1 className="text-lg font-bold text-zinc-900">Task Management</h1>
              <p className="text-xs text-zinc-500">Semua task tim editor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">{session.user?.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        {fetchError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {fetchError}
          </div>
        )}

        <KoreaTaskView initialTasks={tasks} editors={editors} mode="full" />
      </main>
    </div>
  )
}

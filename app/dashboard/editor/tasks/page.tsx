import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import { TaskItem } from "@/types/task"
import SignOutButton from "@/components/sign-out-button"
import EditorTaskView from "../task-view"
import { ArrowLeft } from "lucide-react"

export default async function EditorTasksPage() {
  const session = await requireRole("Editor")

  let tasks: TaskItem[] = []
  let fetchError: string | null = null

  try {
    const tasksRes = await fetchBackend("/tasks")
    if (tasksRes.ok) tasks = await tasksRes.json()
  } catch {
    fetchError = "Terjadi kesalahan koneksi"
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <a
              href="/dashboard/editor"
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700"
            >
              <ArrowLeft className="h-3 w-3" />
              Dashboard
            </a>
            <div>
              <h1 className="text-lg font-bold text-zinc-900">Task Saya</h1>
              <p className="text-xs text-zinc-500">Semua task yang ditugaskan untukmu</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">{session.user?.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          {fetchError ? (
            <p className="text-sm text-red-500">{fetchError}</p>
          ) : (
            <EditorTaskView initialTasks={tasks} mode="full" />
          )}
        </div>
      </main>
    </div>
  )
}

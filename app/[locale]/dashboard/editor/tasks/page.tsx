import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import { TaskItem } from "@/types/task"
import EditorTaskView from "../task-view"
import { PageHeader } from "@/components/shell/page-header"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditorTasksPage() {
  await requireRole("Editor")

  let tasks: TaskItem[] = []
  let fetchError: string | null = null

  try {
    const tasksRes = await fetchBackend("/tasks")
    if (tasksRes.ok) tasks = await tasksRes.json()
  } catch {
    fetchError = "Terjadi kesalahan koneksi"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          eyebrow="Editor"
          title="Task saya"
          description="Semua task yang ditugaskan untukmu."
        />
        <Link
          href="/dashboard/editor"
          className="inline-flex items-center gap-1.5 text-[12px] text-ink-secondary hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Dashboard
        </Link>
      </div>

      <div className="rounded-lg border border-line bg-surface p-5 md:p-6">
        {fetchError ? (
          <p className="text-sm text-status-danger">{fetchError}</p>
        ) : (
          <EditorTaskView initialTasks={tasks} mode="full" />
        )}
      </div>
    </div>
  )
}

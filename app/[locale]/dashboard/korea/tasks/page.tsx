import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import { getTranslations } from "next-intl/server"
import { TaskItem } from "@/types/task"
import KoreaTaskView from "../task-view"
import { PageHeader } from "@/components/shell/page-header"
import { Link } from "@/i18n/navigation"
import { ArrowLeft } from "lucide-react"

interface UserItem {
  id: string
  name: string
  email: string
  role: string
}

export default async function KoreaTasksPage() {
  await requireRole("KoreaTeam")
  const t = await getTranslations()

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
    fetchError = t("error.connectionError")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          eyebrow={t("roles.KoreaTeam")}
          title={t("korea.taskPageTitle")}
          description={t("korea.taskPageDesc")}
        />
        <Link
          href="/dashboard/korea"
          className="inline-flex items-center gap-1.5 text-[12px] text-ink-secondary hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          {t("nav.dashboard")}
        </Link>
      </div>

      {fetchError && (
        <div className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-3 text-[13px] text-status-danger">
          {fetchError}
        </div>
      )}

      <div className="rounded-lg border border-line bg-surface p-5 md:p-6">
        <KoreaTaskView initialTasks={tasks} editors={editors} mode="full" />
      </div>
    </div>
  )
}

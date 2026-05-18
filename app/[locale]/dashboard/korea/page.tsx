import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import { getTranslations } from "next-intl/server"
import { TaskItem } from "@/types/task"
import KoreaTaskView from "./task-view"
import { PageHeader } from "@/components/shell/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Eye, Video, Activity, Calendar } from "lucide-react"
import { MiniBar } from "@/components/charts/mini-bar"
import { StatusPill } from "@/components/ui/status-pill"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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

function startOfWeek() {
  const d = new Date()
  const day = d.getDay() || 7
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day + 1)
  return d
}

export default async function KoreaDashboard() {
  const session = await requireRole("KoreaTeam")
  const t = await getTranslations()

  let tasks: TaskItem[] = []
  let editors: UserItem[] = []
  let clockedInIds: Set<string> = new Set()
  let fetchError: string | null = null
  let pendingVideoTotal = 0

  try {
    const [tasksRes, usersRes, logsRes] = await Promise.all([
      fetchBackend("/tasks"),
      fetchBackend("/users"),
      fetchBackend("/time-tracker/today"),
    ])

    if (tasksRes.ok) {
      tasks = await tasksRes.json()
      pendingVideoTotal = tasks.reduce((sum: number, t: any) => {
        const videos = t.videoSubmissions || []
        return sum + videos.filter((v: any) => v.status === "Pending").length
      }, 0)
    }
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
    fetchError = t("error.connectionError")
  }

  const pendingReviewTotal = tasks.filter(
    (t) => t.status === "NeedToBeReviewed" || t.status === "Review"
  ).length

  const onlineEditorCount = editors.filter((e) => clockedInIds.has(e.id)).length

  const thisWeek = startOfWeek()
  const thisWeekDeadlines = tasks.filter(
    (t) => t.deadline && new Date(t.deadline) >= thisWeek && t.status !== "Completed"
  ).length

  const reviewQueue = tasks
    .filter((t) => t.status === "NeedToBeReviewed" || t.status === "Review")
    .slice(0, 5)

  const editorCompletions = editors.map((e) => {
    const cnt = tasks.filter(
      (t) => t.assignedTo === e.id && t.status === "Completed"
    ).length
    return { label: e.name.split(" ")[0], value: cnt }
  })

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow={t("roles.KoreaTeam")}
        title={t("korea.title")}
        description={t("korea.desc")}
      />

      {fetchError && (
        <div className="rounded-md border border-status-danger/30 bg-status-danger/10 p-4 text-[12px] text-status-danger">
          {fetchError}
        </div>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t("korea.pendingReview")}
          value={pendingReviewTotal}
          icon={<Eye />}
          tone={pendingReviewTotal > 0 ? "accent" : "default"}
        />
        <StatCard
          label={t("korea.newVideos")}
          value={pendingVideoTotal}
          icon={<Video />}
        />
        <StatCard
          label={t("korea.editorsOnline")}
          value={onlineEditorCount}
          suffix={`/ ${editors.length}`}
          icon={<Activity />}
          tone="success"
        />
        <StatCard
          label={t("korea.deadlinesThisWeek")}
          value={thisWeekDeadlines}
          icon={<Calendar />}
        />
      </section>

      {reviewQueue.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
              {t("korea.reviewQueue")}
            </h2>
            <p className="font-mono text-[11px] tabular-nums text-ink-muted">
              {pendingReviewTotal} total
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface divide-y divide-line">
            {reviewQueue.map((task) => {
              const initials = task.assignee.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase())
                .join("")
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <Avatar size="sm">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink truncate">
                      {task.title}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      {t("korea.submittedBy", { name: task.assignee.name })}
                    </p>
                  </div>
                  <StatusPill status={task.status} size="sm" />
                </div>
              )
            })}
          </div>
        </section>
      )}

      {editorCompletions.some((e) => e.value > 0) && (
        <section className="space-y-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
            {t("korea.completedThisWeek")}
          </h2>
          <div className="rounded-md border border-line bg-surface p-5">
            <MiniBar data={editorCompletions} height={140} showAxis />
          </div>
        </section>
      )}

      {editors.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
            {t("korea.editorStatus")}
          </h2>
          <div className="rounded-md border border-line bg-surface divide-y divide-line">
            {editors.map((ed) => {
              const inOffice = clockedInIds.has(ed.id)
              const editorTasks = tasks.filter(
                (t) => t.assignedTo === ed.id && t.status !== "Completed"
              )
              return (
                <div
                  key={ed.id}
                  className="flex items-center justify-between px-5 py-3.5 gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink">
                      {ed.name}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      <span className="font-mono tabular-nums">
                        {editorTasks.length}
                      </span>{" "}
                      {t("korea.activeTasks")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-ink-secondary">
                    <span
                      className={
                        inOffice
                          ? "size-2 rounded-full bg-status-success animate-pulse"
                          : "size-2 rounded-full bg-ink-muted/40"
                      }
                    />
                    {inOffice ? t("admin.online") : t("admin.offline")}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <KoreaTaskView initialTasks={tasks} editors={editors} mode="preview" />
    </div>
  )
}

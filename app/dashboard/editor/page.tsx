import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import { TaskItem } from "@/types/task"
import TimeTracker from "@/components/time-tracker"
import EditorTaskView from "./task-view"
import OnlineEditors from "./online-editors"
import { PageHeader } from "@/components/shell/page-header"
import { MetricNumber } from "@/components/ui/metric-number"
import { EditorWeeklyCard } from "@/components/reports/editor-weekly-card"
import { Clock, AlertTriangle, CheckSquare } from "lucide-react"

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

function isToday(d: Date) {
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export default async function EditorDashboard() {
  const session = await requireRole("Editor")

  let tasks: TaskItem[] = []
  let onlineUsers: { id: string; name: string }[] = []
  let myMinutesToday = 0
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
        .filter(
          (u) =>
            clockedInIds.has(u.id) &&
            u.role === "Editor" &&
            u.id !== session.user?.id
        )
        .map((u) => ({ id: u.id, name: u.name }))

      myMinutesToday = todayLogs
        .filter((l) => l.userId === session.user?.id && l.clockOut)
        .reduce((sum, l) => sum + (l.durationMinutes || 0), 0)
    }
  } catch {
    fetchError = "Terjadi kesalahan koneksi"
  }

  // Stats
  const myTasks = tasks
  const dueTodayCount = myTasks.filter(
    (t) =>
      t.deadline &&
      isToday(new Date(t.deadline)) &&
      t.status !== "Completed"
  ).length
  const reviseCount = myTasks.filter((t) => t.status === "Revise").length

  const recentRevisions = myTasks
    .filter((t) => t.status === "Revise" && t.revisionNote)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3)

  const hoursLabel = (mins: number) => {
    if (mins < 60) return { value: mins, suffix: "m" }
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return { value: `${h}.${Math.round((m / 60) * 10)}`, suffix: "h" }
  }
  const hoursStat = hoursLabel(myMinutesToday)

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow={`Halo, ${session.user?.name.split(" ")[0] || "editor"}`}
        title="Studio hari ini"
        description="Sesi waktu, task aktif, dan revisi yang perlu kamu sentuh."
      />

      {/* Hero row: time tracker + glance */}
      <section className="grid lg:grid-cols-[2fr_1fr] gap-4">
        <TimeTracker />
        <div className="rounded-lg border border-line bg-surface p-5 flex flex-col justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
            Hari ini
          </p>
          <div className="flex-1 grid grid-cols-3 gap-3 mt-3">
            <GlanceTile
              icon={<Clock />}
              label="Jam tercatat"
              value={hoursStat.value}
              suffix={hoursStat.suffix}
            />
            <GlanceTile
              icon={<CheckSquare />}
              label="Due today"
              value={dueTodayCount}
              tone={dueTodayCount > 0 ? "warn" : "default"}
            />
            <GlanceTile
              icon={<AlertTriangle />}
              label="Revisi"
              value={reviseCount}
              tone={reviseCount > 0 ? "danger" : "default"}
            />
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <EditorWeeklyCard />
        {onlineUsers.length > 0 && <OnlineEditors users={onlineUsers} />}
      </section>

      {/* Recent revisions panel */}
      {recentRevisions.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
            Revisi terbaru
          </h2>
          <div className="rounded-md border border-line bg-surface divide-y divide-line">
            {recentRevisions.map((t) => (
              <div key={t.id} className="px-5 py-4 flex items-start gap-3">
                <span className="mt-1 size-1.5 rounded-full bg-status-revise shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink truncate">
                    {t.title}
                  </p>
                  <p className="mt-1 text-[12px] text-ink-secondary line-clamp-2 leading-relaxed">
                    {t.revisionNote}
                  </p>
                </div>
                <span className="font-mono text-[10px] tabular-nums text-ink-muted shrink-0">
                  {new Date(t.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
            My tasks
          </h2>
          <p className="font-mono text-[11px] tabular-nums text-ink-muted">
            {myTasks.length} total
          </p>
        </div>
        {fetchError ? (
          <p className="text-sm text-status-danger">{fetchError}</p>
        ) : (
          <EditorTaskView initialTasks={tasks} mode="preview" />
        )}
      </section>
    </div>
  )
}

function GlanceTile({
  icon,
  label,
  value,
  suffix,
  tone = "default",
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  suffix?: string
  tone?: "default" | "warn" | "danger"
}) {
  const toneClass =
    tone === "danger"
      ? "text-status-revise"
      : tone === "warn"
      ? "text-status-on-hold"
      : "text-ink"
  return (
    <div className="space-y-2">
      <span className="text-ink-muted [&_svg]:size-3.5">{icon}</span>
      <div className="flex items-baseline gap-1">
        <MetricNumber value={value} size="sm" tone="default" italic />
        {suffix && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            {suffix}
          </span>
        )}
      </div>
      <p className={`text-[10px] font-medium uppercase tracking-wider ${toneClass}/80`}>
        {label}
      </p>
    </div>
  )
}

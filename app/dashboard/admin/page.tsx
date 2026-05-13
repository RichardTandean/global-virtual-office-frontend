import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import { PageHeader } from "@/components/shell/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { StatusPill } from "@/components/ui/status-pill"
import {
  Activity,
  AlertTriangle,
  ListChecks,
  Video,
  TrendingUp,
} from "lucide-react"
import { MiniBar } from "@/components/charts/mini-bar"

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
  createdAt: string
  assignee?: { id: string; name: string }
  videoSubmissions?: Array<{ id: string; status: string }>
}

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / (24 * 3600 * 1000))
}

export default async function AdminDashboard() {
  const session = await requireRole("Admin")

  const [usersRes, logsRes, tasksRes] = await Promise.all([
    fetchBackend("/users"),
    fetchBackend("/time-tracker/today"),
    fetchBackend("/tasks"),
  ])

  let users: User[] = []
  let todayLogs: TimeLog[] = []
  let tasks: AdminTask[] = []

  if (usersRes.ok) users = await usersRes.json()
  if (logsRes.ok) ({ todayLogs } = await logsRes.json())
  if (tasksRes.ok) tasks = await tasksRes.json()

  const clockedInUserIds = new Set(
    todayLogs.filter((l) => !l.clockOut).map((l) => l.userId)
  )

  // Today's totals
  const totalMinutesToday = todayLogs.reduce(
    (s, l) => s + (l.durationMinutes || 0),
    0
  )
  const teamHoursToday = Math.round((totalMinutesToday / 60) * 10) / 10

  const editors = users.filter((u) => u.role === "Editor")

  const taskCounts = {
    total: tasks.length,
    editing: tasks.filter((t) => t.status === "Editing").length,
    onHold: tasks.filter((t) => t.status === "OnHold").length,
    needReview: tasks.filter((t) => t.status === "NeedToBeReviewed").length,
    review: tasks.filter((t) => t.status === "Review").length,
    revise: tasks.filter((t) => t.status === "Revise").length,
    readyToUpload: tasks.filter((t) => t.status === "ReadyToUpload").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    assigned: tasks.filter((t) => t.status === "Assigned").length,
  }
  const activeTasks = taskCounts.total - taskCounts.completed

  const pendingVideoTotal = tasks.reduce((sum, t) => {
    const videos = t.videoSubmissions || []
    return sum + videos.filter((v) => v.status === "Pending").length
  }, 0)

  // Bottleneck: tasks not completed and stale > 3 days since createdAt (proxy for last-change)
  const atRiskTasks = tasks
    .filter((t) => t.status !== "Completed")
    .map((t) => ({ ...t, _days: daysSince(t.createdAt) }))
    .filter((t) => t._days >= 3)
    .sort((a, b) => b._days - a._days)
    .slice(0, 6)

  // Distribution data
  const distribution = [
    { label: "Assigned", value: taskCounts.assigned, status: "Assigned" },
    { label: "Editing", value: taskCounts.editing, status: "Editing" },
    { label: "On Hold", value: taskCounts.onHold, status: "OnHold" },
    { label: "Need Rev.", value: taskCounts.needReview, status: "NeedToBeReviewed" },
    { label: "Review", value: taskCounts.review, status: "Review" },
    { label: "Revise", value: taskCounts.revise, status: "Revise" },
    { label: "Ready", value: taskCounts.readyToUpload, status: "ReadyToUpload" },
    { label: "Done", value: taskCounts.completed, status: "Completed" },
  ]

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Admin"
        title="Overview"
        description="Visibilitas penuh untuk status tim, pipeline task, dan bottleneck."
      />

      {/* KPI tiles */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active tasks"
          value={activeTasks}
          icon={<ListChecks />}
        />
        <StatCard
          label="Team online"
          value={clockedInUserIds.size}
          suffix={`/ ${users.length}`}
          icon={<Activity />}
          tone={clockedInUserIds.size > 0 ? "success" : "default"}
        />
        <StatCard
          label="Jam tim hari ini"
          value={teamHoursToday}
          suffix="hrs"
          icon={<TrendingUp />}
        />
        <StatCard
          label="At-risk tasks"
          value={atRiskTasks.length}
          icon={<AlertTriangle />}
          tone={atRiskTasks.length > 0 ? "danger" : "default"}
        />
      </section>

      {/* Pipeline distribution + mini chart */}
      {taskCounts.total > 0 && (
        <section className="space-y-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
            Pipeline
          </h2>
          <div className="rounded-md border border-line bg-surface p-5 space-y-5">
            <MiniBar data={distribution} height={140} showAxis />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-line">
              {distribution.map((s) => (
                <div key={s.status} className="space-y-1.5">
                  <StatusPill status={s.status} size="sm" />
                  <p className="font-display italic text-2xl tabular-nums leading-none text-ink">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottlenecks */}
      {atRiskTasks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
              Bottleneck tasks
            </h2>
            <p className="font-mono text-[11px] tabular-nums text-ink-muted">
              {atRiskTasks.length} tasks
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface divide-y divide-line">
            {atRiskTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <span
                  className={
                    t._days >= 7
                      ? "size-1.5 rounded-full bg-status-danger shrink-0"
                      : "size-1.5 rounded-full bg-status-on-hold shrink-0"
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink truncate">
                    {t.title}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {t.assignee?.name || "—"}
                  </p>
                </div>
                <StatusPill status={t.status} size="sm" />
                <span className="font-mono text-[11px] tabular-nums text-ink-secondary shrink-0 w-16 text-right">
                  {t._days}h diam
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Team */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
          Team
        </h2>
        <div className="rounded-md border border-line bg-surface overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-subtle/40 border-b border-line">
              <tr className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                <th className="text-left px-5 py-2.5 font-medium">Name</th>
                <th className="text-left px-5 py-2.5 font-medium">Role</th>
                <th className="text-right px-5 py-2.5 font-medium">Active</th>
                <th className="text-right px-5 py-2.5 font-medium">Hrs today</th>
                <th className="text-right px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => {
                const editorTasks = tasks.filter(
                  (t) => t.assignedTo === u.id && t.status !== "Completed"
                )
                const userMins = todayLogs
                  .filter((l) => l.userId === u.id && l.clockOut)
                  .reduce((s, l) => s + (l.durationMinutes || 0), 0)
                const hours = Math.round((userMins / 60) * 10) / 10
                const online = clockedInUserIds.has(u.id)
                return (
                  <tr key={u.id} className="hover:bg-subtle/30 transition-colors">
                    <td className="px-5 py-3 text-ink font-medium">
                      <div className="space-y-0.5">
                        <p>{u.name}</p>
                        <p className="text-[10px] text-ink-muted">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-secondary">
                      <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-xs border border-line">
                        {u.role === "Admin"
                          ? "Admin"
                          : u.role === "KoreaTeam"
                          ? "Korea"
                          : "Editor"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-ink">
                      {u.role === "Editor" ? editorTasks.length : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-mono tabular-nums text-ink-secondary">
                      {hours > 0 ? `${hours}h` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-secondary">
                        <span
                          className={
                            online
                              ? "size-1.5 rounded-full bg-status-success animate-pulse"
                              : "size-1.5 rounded-full bg-ink-muted/40"
                          }
                        />
                        {online ? "Online" : "Offline"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="px-5 py-6 text-[12px] text-ink-muted text-center">
              Belum ada user terdaftar.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

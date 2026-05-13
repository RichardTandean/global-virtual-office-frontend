"use client"

import { useState, useCallback } from "react"
import { TaskItem } from "@/types/task"
import TaskCreateForm from "@/components/task-create-form"
import TaskList from "@/components/task-list"
import TaskCard from "@/components/task-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Eye, Video, ArrowRight, ListChecks, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface UserOption {
  id: string
  name: string
}

interface Props {
  initialTasks: TaskItem[]
  editors: UserOption[]
  mode?: "preview" | "full"
}

function MiniStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon: React.ReactNode
  tone: "default" | "warn" | "accent"
}) {
  const toneClass =
    tone === "warn"
      ? "text-status-need-review border-status-need-review/30 bg-status-need-review/8"
      : tone === "accent"
      ? "text-status-editing border-status-editing/30 bg-status-editing/8"
      : "text-ink-secondary border-line bg-surface"
  return (
    <div className={`rounded-md border px-4 py-3 flex items-center gap-3 ${toneClass}`}>
      <span className="[&_svg]:size-4 shrink-0">{icon}</span>
      <div>
        <p className="font-display italic text-2xl leading-none tabular-nums">{value}</p>
        <p className="text-[10px] font-medium uppercase tracking-wider opacity-80 mt-1">
          {label}
        </p>
      </div>
    </div>
  )
}

export default function KoreaTaskView({
  initialTasks,
  editors,
  mode = "full",
}: Props) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks)
  const [showCreate, setShowCreate] = useState(false)

  const refreshTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks")
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch {
      /* silent */
    }
  }, [])

  const needReviewCount = tasks.filter(
    (t) => t.status === "NeedToBeReviewed" || t.status === "Review"
  ).length

  const pendingVideoCount = tasks.reduce((sum, t) => {
    const videos = (t as any).videoSubmissions || []
    return sum + videos.filter((v: any) => v.status === "Pending").length
  }, 0)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <MiniStat
          label="Perlu Review"
          value={needReviewCount}
          icon={<Eye />}
          tone={needReviewCount > 0 ? "warn" : "default"}
        />
        <MiniStat
          label="Video Baru"
          value={pendingVideoCount}
          icon={<Video />}
          tone={pendingVideoCount > 0 ? "accent" : "default"}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
          Task Management
        </h2>
        {mode === "full" && !showCreate && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus />
            Buat Task
          </Button>
        )}
      </div>

      {mode === "full" && showCreate && (
        <TaskCreateForm
          editors={editors}
          onCreated={() => {
            refreshTasks()
            setShowCreate(false)
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {mode === "preview" ? (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <EmptyState
              icon={<ListChecks />}
              title="Belum ada task"
              description="Buat task pertama untuk memulai workflow studio."
              size="sm"
              action={
                <Link
                  href="/dashboard/korea/tasks"
                  className="text-[12px] text-accent hover:text-accent-hover underline-offset-4 hover:underline"
                >
                  Buat task →
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[...tasks]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice(0, 4)
                .map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onUpdated={refreshTasks}
                    canCreate
                    userRole="KoreaTeam"
                  />
                ))}
            </div>
          )}
          {tasks.length > 0 && (
            <div className="flex justify-end">
              <Link
                href="/dashboard/korea/tasks"
                className="inline-flex items-center gap-1 rounded-xs px-2 py-1 text-[12px] text-ink-secondary hover:text-ink hover:bg-subtle transition-colors"
              >
                Lihat semua task
                <ArrowRight className="size-3" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          onUpdated={refreshTasks}
          canCreate
          userRole="KoreaTeam"
        />
      )}
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"
import { TaskItem } from "@/types/task"
import TaskList from "@/components/task-list"
import TaskCard from "@/components/task-card"
import { EmptyState } from "@/components/ui/empty-state"
import { AlertTriangle, Edit, Clock, CheckCircle, ArrowRight, ListChecks } from "lucide-react"
import Link from "next/link"

interface Props {
  initialTasks: TaskItem[]
  mode?: "preview" | "full"
}

interface MiniStatProps {
  label: string
  value: number
  icon: React.ReactNode
  tone: "default" | "danger" | "warn" | "success" | "accent"
}

function MiniStat({ label, value, icon, tone }: MiniStatProps) {
  const toneClass =
    tone === "danger"
      ? "text-status-revise border-status-revise/30 bg-status-revise/8"
      : tone === "warn"
      ? "text-status-editing border-status-editing/30 bg-status-editing/8"
      : tone === "success"
      ? "text-status-completed border-status-completed/30 bg-status-completed/8"
      : tone === "accent"
      ? "text-accent border-accent/30 bg-accent-subtle"
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

export default function EditorTaskView({ initialTasks, mode = "full" }: Props) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks)

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

  const reviseCount = tasks.filter((t) => t.status === "Revise").length
  const editingCount = tasks.filter((t) => t.status === "Editing").length
  const assignedCount = tasks.filter((t) => t.status === "Assigned").length
  const completedCount = tasks.filter((t) => t.status === "Completed").length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat
          label="Perlu Revisi"
          value={reviseCount}
          icon={<AlertTriangle />}
          tone={reviseCount > 0 ? "danger" : "default"}
        />
        <MiniStat
          label="Dikerjakan"
          value={editingCount}
          icon={<Edit />}
          tone={editingCount > 0 ? "warn" : "default"}
        />
        <MiniStat
          label="Menunggu"
          value={assignedCount}
          icon={<Clock />}
          tone={assignedCount > 0 ? "accent" : "default"}
        />
        <MiniStat
          label="Selesai"
          value={completedCount}
          icon={<CheckCircle />}
          tone={completedCount > 0 ? "success" : "default"}
        />
      </div>

      {mode === "preview" ? (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <EmptyState
              icon={<ListChecks />}
              title="Tidak ada task hari ini"
              description="Saat tim memberikan task, akan muncul di sini."
              size="sm"
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
                    userRole="Editor"
                  />
                ))}
            </div>
          )}
          {tasks.length > 0 && (
            <div className="flex justify-end">
              <Link
                href="/dashboard/editor/tasks"
                className="inline-flex items-center gap-1 rounded-xs px-2 py-1 text-[12px] text-ink-secondary hover:text-ink hover:bg-subtle transition-colors"
              >
                Lihat semua task
                <ArrowRight className="size-3" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <TaskList tasks={tasks} onUpdated={refreshTasks} userRole="Editor" />
      )}
    </div>
  )
}

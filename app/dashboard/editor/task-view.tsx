"use client"

import { useState, useCallback } from "react"
import { TaskItem } from "@/types/task"
import TaskList from "@/components/task-list"
import TaskCard from "@/components/task-card"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Edit, Clock, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Props {
  initialTasks: TaskItem[]
  mode?: "preview" | "full"
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
    } catch { /* silent */ }
  }, [])

  const reviseCount = tasks.filter((t) => t.status === "Revise").length
  const editingCount = tasks.filter((t) => t.status === "Editing").length
  const assignedCount = tasks.filter((t) => t.status === "Assigned").length
  const completedCount = tasks.filter((t) => t.status === "Completed").length

  const taksWithoutVideo = tasks.filter(
    (t) => (t.status === "Editing" || t.status === "Assigned") && !(t as any).videoSubmissions?.length
  ).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {reviseCount > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
            <CardContent className="p-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
              <div>
                <p className="text-lg font-bold text-orange-700">{reviseCount}</p>
                <p className="text-[10px] text-orange-600">Perlu Revisi</p>
              </div>
            </CardContent>
          </Card>
        )}
        {editingCount > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
            <CardContent className="p-3 flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-lg font-bold text-blue-700">{editingCount}</p>
                <p className="text-[10px] text-blue-600">Dikerjakan</p>
              </div>
            </CardContent>
          </Card>
        )}
        {assignedCount > 0 && (
          <Card className="border-zinc-200 bg-zinc-50 dark:bg-zinc-900">
            <CardContent className="p-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-zinc-500 shrink-0" />
              <div>
                <p className="text-lg font-bold text-zinc-700">{assignedCount}</p>
                <p className="text-[10px] text-zinc-500">Menunggu</p>
              </div>
            </CardContent>
          </Card>
        )}
        {completedCount > 0 && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardContent className="p-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-lg font-bold text-green-700">{completedCount}</p>
                <p className="text-[10px] text-green-600">Selesai</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {mode === "preview" ? (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">Belum ada task</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[...tasks]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
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
          <div className="flex justify-end">
            <Link
              href="/dashboard/editor/tasks"
              className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 underline"
            >
              Lihat semua task
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ) : (
        <TaskList tasks={tasks} onUpdated={refreshTasks} userRole="Editor" />
      )}
    </div>
  )
}

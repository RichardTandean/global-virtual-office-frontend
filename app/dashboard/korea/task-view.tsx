"use client"

import { useState, useCallback } from "react"
import { TaskItem } from "@/types/task"
import TaskCreateForm from "@/components/task-create-form"
import TaskList from "@/components/task-list"
import TaskCard from "@/components/task-card"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Video, ArrowRight } from "lucide-react"
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

export default function KoreaTaskView({ initialTasks, editors, mode = "full" }: Props) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks)
  const [showCreate, setShowCreate] = useState(false)

  const refreshTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks")
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch { /* silent */ }
  }, [])

  const needReviewCount = tasks.filter(
    (t) => t.status === "NeedToBeReviewed" || t.status === "Review"
  ).length

  const pendingVideoCount = tasks.reduce((sum, t) => {
    const videos = (t as any).videoSubmissions || []
    return sum + videos.filter((v: any) => v.status === "Pending").length
  }, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {needReviewCount > 0 && (
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950">
            <CardContent className="p-3 flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600 shrink-0" />
              <div>
                <p className="text-lg font-bold text-purple-700">{needReviewCount}</p>
                <p className="text-[10px] text-purple-600">Perlu Review</p>
              </div>
            </CardContent>
          </Card>
        )}
        {pendingVideoCount > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
            <CardContent className="p-3 flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-lg font-bold text-blue-700">{pendingVideoCount}</p>
                <p className="text-[10px] text-blue-600">Video Baru</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Task Management</h2>
        {mode === "full" && !showCreate && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            + Buat Task
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
                    canCreate
                    userRole="KoreaTeam"
                  />
                ))}
            </div>
          )}
          <div className="flex justify-end">
            <Link
              href="/dashboard/korea/tasks"
              className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 underline"
            >
              Lihat semua task
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
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

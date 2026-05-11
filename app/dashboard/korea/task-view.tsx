"use client"

import { useState, useCallback } from "react"
import { TaskItem } from "@/types/task"
import TaskCreateForm from "@/components/task-create-form"
import TaskList from "@/components/task-list"

interface UserOption {
  id: string
  name: string
}

interface Props {
  initialTasks: TaskItem[]
  editors: UserOption[]
}

export default function KoreaTaskView({ initialTasks, editors }: Props) {
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
      // silent refresh
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">
          Task Management
        </h2>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            + Buat Task
          </button>
        )}
      </div>

      {showCreate && (
        <TaskCreateForm
          editors={editors}
          onCreated={() => {
            refreshTasks()
            setShowCreate(false)
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <TaskList
        tasks={tasks}
        onUpdated={refreshTasks}
        canCreate
        userRole="KoreaTeam"
      />
    </div>
  )
}

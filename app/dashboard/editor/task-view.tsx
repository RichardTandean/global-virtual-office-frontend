"use client"

import { useState, useCallback } from "react"
import { TaskItem } from "@/types/task"
import TaskList from "@/components/task-list"

interface Props {
  initialTasks: TaskItem[]
}

export default function EditorTaskView({ initialTasks }: Props) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks)

  const refreshTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks")
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch {
      // silent refresh failure
    }
  }, [])

  return <TaskList tasks={tasks} onUpdated={refreshTasks} userRole="Editor" />
}

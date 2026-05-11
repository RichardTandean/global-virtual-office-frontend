"use client"

import { useState } from "react"
import { TaskItem } from "@/types/task"
import TaskCard from "./task-card"

interface TaskListProps {
  tasks: TaskItem[]
  onUpdated: () => void
  canCreate?: boolean
}

const filters = ["Semua", "Assigned", "InProgress", "Review", "Revision", "Done"]

export default function TaskList({ tasks, onUpdated, canCreate }: TaskListProps) {
  const [activeFilter, setActiveFilter] = useState("Semua")

  const filtered =
    activeFilter === "Semua"
      ? tasks
      : tasks.filter((t) => t.status === activeFilter)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeFilter === f
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            {f === "Semua" ? "Semua" : f}
            {f !== "Semua" && (
              <span className="ml-1 text-zinc-400">
                ({tasks.filter((t) => t.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-400">Tidak ada task</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdated={onUpdated}
              canCreate={canCreate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { TaskItem } from "@/types/task"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import TaskCard from "./task-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Search, ArrowUpDown, ListChecks } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskListProps {
  tasks: TaskItem[]
  onUpdated: () => void
  canCreate?: boolean
  userRole?: string
}

const filterOptions = [
  { value: "Semua", label: "All" },
  { value: "Assigned", label: "Assigned" },
  { value: "Editing", label: "Editing" },
  { value: "OnHold", label: "On Hold" },
  { value: "NeedToBeReviewed", label: "Need Review" },
  { value: "Review", label: "Review" },
  { value: "Revise", label: "Revise" },
  { value: "ReadyToUpload", label: "Ready" },
  { value: "Completed", label: "Done" },
]

type SortKey = "created" | "deadline" | "progress" | "title"

export default function TaskList({
  tasks,
  onUpdated,
  canCreate,
  userRole,
}: TaskListProps) {
  const [activeFilter, setActiveFilter] = useState("Semua")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("created")

  const { filtered, counts } = useMemo(() => {
    const counts: Record<string, number> = {}
    filterOptions.forEach((f) => {
      counts[f.value] =
        f.value === "Semua"
          ? tasks.length
          : tasks.filter((t) => t.status === f.value).length
    })

    let result =
      activeFilter === "Semua"
        ? tasks
        : tasks.filter((t) => t.status === activeFilter)

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.assignee.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      )
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          if (!a.deadline && !b.deadline) return 0
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          )
        case "progress":
          return b.progressPercent - a.progressPercent
        case "title":
          return a.title.localeCompare(b.title, "id")
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      }
    })

    return { filtered: result, counts }
  }, [tasks, activeFilter, search, sortBy])

  return (
    <div className="space-y-5">
      {/* Top bar: search + sort */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-muted pointer-events-none" />
          <Input
            placeholder="Cari task atau editor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger size="default" className="w-[160px]">
            <ArrowUpDown className="size-3" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Terbaru</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="title">Judul</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status filter chips (segmented-ish) */}
      <div className="flex flex-wrap gap-1 border-b border-line pb-2">
        {filterOptions.map((f) => {
          const active = activeFilter === f.value
          const count = counts[f.value]
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11px] font-medium",
                "transition-all duration-(--dur-fast)",
                active
                  ? "bg-accent-subtle text-accent border border-accent/20"
                  : "text-ink-secondary hover:bg-subtle hover:text-ink border border-transparent",
                count === 0 && !active && "opacity-50"
              )}
            >
              {f.label}
              {count > 0 && (
                <span
                  className={cn(
                    "tabular-nums text-[10px] font-mono",
                    active ? "text-accent" : "text-ink-muted"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ListChecks />}
          title={search ? "Tidak ada hasil" : "Belum ada task"}
          description={
            search
              ? "Coba kata kunci lain atau ganti filter."
              : canCreate
              ? "Buat task pertama untuk memulai."
              : "Task akan muncul di sini ketika diberikan oleh tim."
          }
          size="sm"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdated={onUpdated}
              canCreate={canCreate}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  )
}

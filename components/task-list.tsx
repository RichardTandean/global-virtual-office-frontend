"use client"

import { useState, useMemo } from "react"
import { TaskItem, statusLabels } from "@/types/task"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TaskCard from "./task-card"
import { Search, ArrowUpDown } from "lucide-react"

interface TaskListProps {
  tasks: TaskItem[]
  onUpdated: () => void
  canCreate?: boolean
  userRole?: string
}

const filterOptions = [
  { value: "Semua", label: "Semua" },
  { value: "Assigned", label: "Ditugaskan" },
  { value: "Editing", label: "Dikerjakan" },
  { value: "OnHold", label: "On Hold" },
  { value: "NeedToBeReviewed", label: "Perlu Review" },
  { value: "Review", label: "Direview" },
  { value: "Revise", label: "Revisi" },
  { value: "ReadyToUpload", label: "Siap Upload" },
  { value: "Completed", label: "Selesai" },
]

type SortKey = "created" | "deadline" | "progress" | "title"

export default function TaskList({ tasks, onUpdated, canCreate, userRole }: TaskListProps) {
  const [activeFilter, setActiveFilter] = useState("Semua")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("created")

  const { filtered, counts } = useMemo(() => {
    const counts: Record<string, number> = {}
    filterOptions.forEach((f) => {
      counts[f.value] = f.value === "Semua" ? tasks.length : tasks.filter((t) => t.status === f.value).length
    })

    let result = activeFilter === "Semua" ? tasks : tasks.filter((t) => t.status === activeFilter)

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.assignee.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)),
      )
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          if (!a.deadline && !b.deadline) return 0
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "progress":
          return b.progressPercent - a.progressPercent
        case "title":
          return a.title.localeCompare(b.title, "id")
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return { filtered: result, counts }
  }, [tasks, activeFilter, search, sortBy])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari task atau editor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <ArrowUpDown className="h-3 w-3 mr-1" />
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

      <div className="flex flex-wrap gap-1.5">
        {filterOptions.map((f) => (
          <Button
            key={f.value}
            variant={activeFilter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(f.value)}
            className="rounded-full text-[11px] h-7"
          >
            {f.label}
            {counts[f.value] > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0 h-4">{counts[f.value]}</Badge>
            )}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? "Tidak ada task yang cocok" : "Tidak ada task"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} onUpdated={onUpdated} canCreate={canCreate} userRole={userRole} />
          ))}
        </div>
      )}
    </div>
  )
}

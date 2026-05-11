export interface TaskItem {
  id: string
  title: string
  description: string | null
  briefUrl: string | null
  assignedTo: string
  assignedBy: string
  status: "Assigned" | "InProgress" | "Review" | "Revision" | "Done"
  deadline: string | null
  progressPercent: number
  createdAt: string
  assignee: { id: string; name: string; email: string }
  assigner: { id: string; name: string; email: string }
  timeLogs?: Array<{
    id: string
    startedAt: string
    endedAt: string | null
    durationMinutes: number | null
  }>
  progressUpdates?: Array<{
    id: string
    fileUrl: string | null
    percent: number
    note: string | null
    createdAt: string
    user: { id: string; name: string }
  }>
}

export interface ProgressUpdateItem {
  id: string
  fileUrl: string | null
  percent: number
  note: string | null
  createdAt: string
  user: { id: string; name: string }
}

export const statusLabels: Record<string, string> = {
  Assigned: "Ditugaskan",
  InProgress: "Dikerjakan",
  Review: "Direview",
  Revision: "Revisi",
  Done: "Selesai",
}

export const statusColors: Record<string, string> = {
  Assigned: "bg-zinc-100 text-zinc-700",
  InProgress: "bg-blue-100 text-blue-700",
  Review: "bg-yellow-100 text-yellow-700",
  Revision: "bg-orange-100 text-orange-700",
  Done: "bg-green-100 text-green-700",
}

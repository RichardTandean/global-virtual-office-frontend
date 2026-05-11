export type TaskStatus =
  | "Assigned"
  | "Editing"
  | "NeedToBeReviewed"
  | "Review"
  | "Revise"
  | "ReadyToUpload"
  | "Completed"

export interface TaskItem {
  id: string
  title: string
  description: string | null
  briefUrl: string | null
  assignedTo: string
  assignedBy: string
  status: TaskStatus
  deadline: string | null
  progressPercent: number
  revisionNote: string | null
  revisionAttachment: string | null
  youtubeUrl: string | null
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
  Editing: "Dikerjakan",
  NeedToBeReviewed: "Perlu Direview",
  Review: "Direview",
  Revise: "Revisi",
  ReadyToUpload: "Siap Upload",
  Completed: "Selesai",
}

export const statusColors: Record<string, string> = {
  Assigned: "bg-zinc-100 text-zinc-700",
  Editing: "bg-blue-100 text-blue-700",
  NeedToBeReviewed: "bg-purple-100 text-purple-700",
  Review: "bg-yellow-100 text-yellow-700",
  Revise: "bg-orange-100 text-orange-700",
  ReadyToUpload: "bg-teal-100 text-teal-700",
  Completed: "bg-green-100 text-green-700",
}

export const FLOW: TaskStatus[] = [
  "Assigned",
  "Editing",
  "NeedToBeReviewed",
  "Review",
  "Revise",
  "ReadyToUpload",
  "Completed",
]

export const EDITOR_CAN_CHANGE: Record<TaskStatus, TaskStatus[]> = {
  Assigned: ["Editing"],
  Editing: ["NeedToBeReviewed"],
  NeedToBeReviewed: [],
  Review: [],
  Revise: ["NeedToBeReviewed"],
  ReadyToUpload: ["Completed"],
  Completed: [],
}

export const KOREA_CAN_CHANGE: Record<TaskStatus, TaskStatus[]> = {
  Assigned: ["Editing"],
  Editing: ["NeedToBeReviewed"],
  NeedToBeReviewed: ["Review"],
  Review: ["Revise", "ReadyToUpload"],
  Revise: ["NeedToBeReviewed"],
  ReadyToUpload: ["Completed"],
  Completed: [],
}

export type TaskStatus =
  | "Assigned"
  | "Editing"
  | "OnHold"
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
  OnHold: "On Hold",
  NeedToBeReviewed: "Perlu Direview",
  Review: "Direview",
  Revise: "Revisi",
  ReadyToUpload: "Siap Upload",
  Completed: "Selesai",
}

export const statusColors: Record<string, string> = {
  Assigned: "bg-status-assigned/10 text-status-assigned",
  Editing: "bg-status-editing/10 text-status-editing",
  OnHold: "bg-status-on-hold/10 text-status-on-hold",
  NeedToBeReviewed: "bg-status-need-review/10 text-status-need-review",
  Review: "bg-status-review/10 text-status-review",
  Revise: "bg-status-revise/10 text-status-revise",
  ReadyToUpload: "bg-status-ready-upload/10 text-status-ready-upload",
  Completed: "bg-status-completed/10 text-status-completed",
}

export const FLOW: TaskStatus[] = [
  "Assigned",
  "Editing",
  "OnHold",
  "NeedToBeReviewed",
  "Review",
  "Revise",
  "ReadyToUpload",
  "Completed",
]

export const EDITOR_CAN_CHANGE: Record<TaskStatus, TaskStatus[]> = {
  Assigned: ["Editing"],
  Editing: ["OnHold", "NeedToBeReviewed"],
  OnHold: ["Editing"],
  NeedToBeReviewed: [],
  Review: [],
  Revise: ["OnHold", "NeedToBeReviewed"],
  ReadyToUpload: ["Completed"],
  Completed: [],
}

export const KOREA_CAN_CHANGE: Record<TaskStatus, TaskStatus[]> = {
  Assigned: ["Editing"],
  Editing: ["OnHold", "NeedToBeReviewed"],
  OnHold: ["Editing"],
  NeedToBeReviewed: ["Review"],
  Review: ["Revise", "ReadyToUpload"],
  Revise: ["OnHold", "NeedToBeReviewed"],
  ReadyToUpload: ["Completed"],
  Completed: [],
}

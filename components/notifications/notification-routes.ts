import type { NotificationItem } from "./use-notifications"

type Role = "Editor" | "KoreaTeam" | "Admin"

const ROLE_BASE: Record<Role, string> = {
  Editor: "/dashboard/editor",
  KoreaTeam: "/dashboard/korea",
  Admin: "/dashboard/admin",
}

const TASK_TYPES = new Set([
  "task_assigned", "task_status", "task_progress", "task_deleted",
  "task_reassigned", "task_on_hold", "task_started", "revision",
  "video_uploaded", "video_reviewed", "comment", "asset_uploaded",
  "deadline_warning",
])

const CALL_TYPES = new Set(["call_invited", "meeting_reminder"])

export function getNotificationRoute(n: NotificationItem, role: Role): string | null {
  // Task-related → task detail
  if (TASK_TYPES.has(n.type) && n.taskId) {
    return `${ROLE_BASE[role]}?task=${n.taskId}`
  }

  // Call-related → calls page with optional room
  if (CALL_TYPES.has(n.type)) {
    const roomId = n.bodyParams?.roomId as string | undefined
    if (roomId) return `/dashboard/calls?room=${roomId}`
    return "/dashboard/calls"
  }

  // User admin actions
  if (n.type === "user_created" || n.type === "user_deleted") {
    if (role === "Admin") return "/dashboard/admin/users"
  }

  // Weekly reports
  if (n.type === "weekly_report") {
    if (role === "Admin") return "/dashboard/admin/reports"
  }

  // Clock in/out — no specific page
  return null
}

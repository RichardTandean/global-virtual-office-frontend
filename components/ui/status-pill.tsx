import { cn } from "@/lib/utils"
import { TaskStatus, statusLabels } from "@/types/task"

const statusToColor: Record<TaskStatus, { dot: string; text: string; bg: string }> = {
  Assigned: {
    dot: "bg-status-assigned",
    text: "text-status-assigned",
    bg: "bg-status-assigned/10",
  },
  Editing: {
    dot: "bg-status-editing",
    text: "text-status-editing",
    bg: "bg-status-editing/10",
  },
  OnHold: {
    dot: "bg-status-on-hold",
    text: "text-status-on-hold",
    bg: "bg-status-on-hold/10",
  },
  NeedToBeReviewed: {
    dot: "bg-status-need-review",
    text: "text-status-need-review",
    bg: "bg-status-need-review/10",
  },
  Review: {
    dot: "bg-status-review",
    text: "text-status-review",
    bg: "bg-status-review/10",
  },
  Revise: {
    dot: "bg-status-revise",
    text: "text-status-revise",
    bg: "bg-status-revise/10",
  },
  ReadyToUpload: {
    dot: "bg-status-ready-upload",
    text: "text-status-ready-upload",
    bg: "bg-status-ready-upload/10",
  },
  Completed: {
    dot: "bg-status-completed",
    text: "text-status-completed",
    bg: "bg-status-completed/10",
  },
}

interface StatusPillProps {
  status: TaskStatus | string
  size?: "sm" | "md"
  variant?: "solid" | "subtle" | "ghost"
  className?: string
}

export function StatusPill({
  status,
  size = "md",
  variant = "subtle",
  className,
}: StatusPillProps) {
  const colors = statusToColor[status as TaskStatus] || statusToColor.Assigned
  const label = statusLabels[status] || status

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-xs font-medium tracking-wide",
        size === "sm" ? "h-5 px-2 text-[10px]" : "h-6 px-2.5 text-[11px]",
        variant === "subtle" && cn(colors.bg, colors.text, "uppercase"),
        variant === "solid" &&
          cn(colors.dot, "text-white uppercase"),
        variant === "ghost" && cn("text-ink-secondary uppercase"),
        className
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full shrink-0",
          colors.dot
        )}
      />
      {label}
    </span>
  )
}

export function StatusDot({
  status,
  className,
}: {
  status: TaskStatus | string
  className?: string
}) {
  const colors = statusToColor[status as TaskStatus] || statusToColor.Assigned
  return (
    <span
      className={cn("inline-block size-2 rounded-full", colors.dot, className)}
    />
  )
}

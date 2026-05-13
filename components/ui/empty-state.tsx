import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg"
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-line bg-subtle/30",
        size === "sm" ? "px-6 py-8" : size === "lg" ? "px-10 py-16" : "px-8 py-12",
        className
      )}
    >
      {icon && (
        <div className="flex items-center justify-center size-12 rounded-full bg-elevated text-ink-muted [&_svg]:size-5">
          {icon}
        </div>
      )}
      <h3
        className={cn(
          "font-display italic tracking-tight text-ink",
          size === "sm" ? "text-xl" : size === "lg" ? "text-3xl" : "text-2xl"
        )}
      >
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-center text-[12px] text-ink-secondary leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

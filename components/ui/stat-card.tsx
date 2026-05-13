import * as React from "react"
import { cn } from "@/lib/utils"
import { MetricNumber } from "./metric-number"

interface StatCardProps {
  label: string
  value: string | number
  suffix?: string
  hint?: React.ReactNode
  icon?: React.ReactNode
  tone?: "default" | "accent" | "success" | "danger" | "muted"
  trend?: { value: number; label?: string } | null
  size?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
}

export function StatCard({
  label,
  value,
  suffix,
  hint,
  icon,
  tone = "default",
  trend,
  size = "md",
  className,
  onClick,
}: StatCardProps) {
  const interactive = Boolean(onClick)
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className={cn(
        "group relative flex flex-col gap-3 rounded-md border border-line bg-surface p-5",
        "transition-all duration-(--dur-base) ease-(--ease-out)",
        interactive && "cursor-pointer hover:border-line-strong hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
          {label}
        </p>
        {icon && (
          <span className="text-ink-muted [&_svg]:size-4 [&_svg]:shrink-0">
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <MetricNumber
          value={value}
          suffix={suffix}
          size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
          tone={tone === "default" ? "default" : tone}
        />
      </div>

      {(hint || trend) && (
        <div className="flex items-center gap-2 text-[11px] text-ink-muted">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium tabular-nums",
                trend.value > 0 && "text-status-success",
                trend.value < 0 && "text-status-danger",
                trend.value === 0 && "text-ink-muted"
              )}
            >
              {trend.value > 0 ? "↑" : trend.value < 0 ? "↓" : "·"}
              {Math.abs(trend.value)}
              {trend.label && <span className="ml-1 text-ink-muted">{trend.label}</span>}
            </span>
          )}
          {hint}
        </div>
      )}
    </div>
  )
}

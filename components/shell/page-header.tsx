import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 border-b border-line md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="space-y-1.5 min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display italic text-3xl md:text-4xl leading-none tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="text-[13px] text-ink-secondary leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
}

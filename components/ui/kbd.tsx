import * as React from "react"
import { cn } from "@/lib/utils"

export function Kbd({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-line bg-subtle px-1.5 font-mono text-[10px] font-medium text-ink-secondary",
        "shadow-[inset_0_-1px_0_0_var(--border-subtle)]",
        className
      )}
    >
      {children}
    </kbd>
  )
}

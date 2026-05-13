import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-sm border border-line bg-elevated px-3 py-2",
        "text-[13px] text-ink placeholder:text-ink-muted",
        "transition-[border-color,box-shadow,background] duration-(--dur-fast) ease-(--ease-out)",
        "outline-none resize-none",
        "hover:border-line-strong",
        "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-status-danger aria-invalid:ring-2 aria-invalid:ring-status-danger/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

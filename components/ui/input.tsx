import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-sm border border-line bg-elevated px-3 py-1.5",
        "text-[13px] text-ink placeholder:text-ink-muted",
        "transition-[border-color,box-shadow,background] duration-(--dur-fast) ease-(--ease-out)",
        "outline-none",
        "hover:border-line-strong",
        "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-[13px] file:font-medium file:text-ink",
        "aria-invalid:border-status-danger aria-invalid:ring-2 aria-invalid:ring-status-danger/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }

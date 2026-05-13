import { cn } from "@/lib/utils"

interface MetricNumberProps {
  value: string | number
  suffix?: string
  size?: "sm" | "md" | "lg" | "xl"
  tone?: "default" | "muted" | "accent" | "success" | "danger"
  italic?: boolean
  className?: string
}

const sizeMap = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-5xl",
  xl: "text-6xl",
}

const toneMap = {
  default: "text-ink",
  muted: "text-ink-secondary",
  accent: "text-accent",
  success: "text-status-success",
  danger: "text-status-danger",
}

export function MetricNumber({
  value,
  suffix,
  size = "md",
  tone = "default",
  italic = true,
  className,
}: MetricNumberProps) {
  return (
    <span
      className={cn(
        "font-display tabular-nums leading-none tracking-tight",
        sizeMap[size],
        toneMap[tone],
        italic && "italic",
        className
      )}
    >
      {value}
      {suffix && (
        <span className="ml-1 font-sans text-[0.45em] not-italic font-medium text-ink-muted uppercase tracking-wider align-baseline">
          {suffix}
        </span>
      )}
    </span>
  )
}

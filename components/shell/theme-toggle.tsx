"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  variant?: "icon" | "row"
  className?: string
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = theme !== "light"
  const next = isDark ? "light" : "dark"

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-[12px] text-ink-secondary",
          "hover:bg-subtle hover:text-ink transition-colors duration-(--dur-fast)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          className
        )}
        aria-label={`Switch to ${next} mode`}
      >
        <span className="inline-flex items-center gap-2">
          {mounted && isDark ? (
            <Moon className="size-3.5" />
          ) : (
            <Sun className="size-3.5" />
          )}
          {mounted ? (isDark ? "Dark mode" : "Light mode") : "Theme"}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          {mounted ? (isDark ? "Dark" : "Light") : "—"}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-sm text-ink-secondary",
        "hover:bg-subtle hover:text-ink transition-colors duration-(--dur-fast)",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        className
      )}
      aria-label={`Switch to ${next} mode`}
    >
      {mounted && isDark ? (
        <Moon className="size-4" />
      ) : (
        <Sun className="size-4" />
      )}
    </button>
  )
}

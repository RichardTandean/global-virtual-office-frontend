"use client"

import { useEffect, useState, useCallback } from "react"
import { Command } from "cmdk"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  ListChecks,
  CalendarDays,
  Bell,
  BarChart3,
  Sun,
  Moon,
  LogOut,
  Search,
} from "lucide-react"
import { Role, homeFor } from "./nav-config"
import { Kbd } from "@/components/ui/kbd"
import { logout } from "@/auth"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { id: string; name: string; email: string; role: string }
}

interface TaskHit {
  id: string
  title: string
  status: string
  assignee?: { name: string }
}

export function CommandPalette({ open, onOpenChange, user }: CommandPaletteProps) {
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const [search, setSearch] = useState("")
  const [tasks, setTasks] = useState<TaskHit[]>([])
  const role = (user.role as Role) || "Editor"

  // Hotkey: ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === "Escape" && open) onOpenChange(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  // Fetch tasks once when opened
  useEffect(() => {
    if (!open) return
    let cancelled = false
    fetch("/api/tasks")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setTasks(data.slice(0, 50))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [open])

  const go = useCallback(
    (href: string) => {
      onOpenChange(false)
      router.push(href)
    },
    [onOpenChange, router]
  )

  const tasksHref =
    role === "Editor"
      ? "/dashboard/editor/tasks"
      : role === "KoreaTeam"
      ? "/dashboard/korea/tasks"
      : "/dashboard/korea/tasks"
  const calendarHref =
    role === "Editor"
      ? "/dashboard/editor/calendar"
      : role === "KoreaTeam"
      ? "/dashboard/korea/calendar"
      : "/dashboard/admin/calendar"

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-(--dur-fast)"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div className="relative w-full max-w-xl rounded-md border border-line bg-elevated shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-(--dur-base)">
        <Command label="Command palette" shouldFilter className="flex flex-col max-h-[480px]">
          <div className="flex items-center gap-2 px-4 border-b border-line h-12">
            <Search className="size-4 text-ink-muted" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search tasks, navigate, change theme…"
              className="flex-1 bg-transparent outline-none text-[13px] text-ink placeholder:text-ink-muted h-full"
              autoFocus
            />
            <Kbd>ESC</Kbd>
          </div>

          <Command.List className="overflow-y-auto p-2">
            <Command.Empty className="py-10 text-center text-[12px] text-ink-muted">
              No matches.
            </Command.Empty>

            <Command.Group
              heading="Navigation"
              className="text-[9px] uppercase tracking-[0.2em] text-ink-muted px-2 pb-1 pt-2"
            >
              <CommandRow
                onSelect={() => go(homeFor(role))}
                icon={<LayoutDashboard className="size-3.5" />}
                label="Go to Dashboard"
              />
              <CommandRow
                onSelect={() => go(tasksHref)}
                icon={<ListChecks className="size-3.5" />}
                label="View all Tasks"
              />
              <CommandRow
                onSelect={() => go(calendarHref)}
                icon={<CalendarDays className="size-3.5" />}
                label="Open Calendar"
              />
              <CommandRow
                onSelect={() => go("/dashboard/notifications")}
                icon={<Bell className="size-3.5" />}
                label="Notifications"
              />
              {role === "Admin" && (
                <CommandRow
                  onSelect={() => go("/dashboard/admin/reports")}
                  icon={<BarChart3 className="size-3.5" />}
                  label="Reports"
                />
              )}
            </Command.Group>

            {tasks.length > 0 && (
              <Command.Group
                heading="Tasks"
                className="text-[9px] uppercase tracking-[0.2em] text-ink-muted px-2 pb-1 pt-3"
              >
                {tasks.map((t) => (
                  <CommandRow
                    key={t.id}
                    value={`task ${t.title} ${t.assignee?.name || ""}`}
                    onSelect={() => {
                      const base =
                        role === "Editor"
                          ? "/dashboard/editor/tasks"
                          : role === "KoreaTeam"
                          ? "/dashboard/korea/tasks"
                          : "/dashboard/korea/tasks"
                      go(`${base}?task=${t.id}`)
                    }}
                    icon={<ListChecks className="size-3.5" />}
                    label={t.title}
                    hint={t.assignee?.name}
                  />
                ))}
              </Command.Group>
            )}

            <Command.Group
              heading="Settings"
              className="text-[9px] uppercase tracking-[0.2em] text-ink-muted px-2 pb-1 pt-3"
            >
              <CommandRow
                onSelect={() => {
                  setTheme(theme === "light" ? "dark" : "light")
                }}
                icon={
                  theme === "light" ? (
                    <Moon className="size-3.5" />
                  ) : (
                    <Sun className="size-3.5" />
                  )
                }
                label={
                  theme === "light" ? "Switch to Dark mode" : "Switch to Light mode"
                }
              />
              <CommandRow
                onSelect={() => logout()}
                icon={<LogOut className="size-3.5" />}
                label="Sign out"
                tone="danger"
              />
            </Command.Group>
          </Command.List>

          <div className="px-3 py-2 border-t border-line flex items-center justify-between text-[10px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              navigate
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Kbd>↵</Kbd>
              select
            </span>
          </div>
        </Command>
      </div>
    </div>
  )
}

function CommandRow({
  icon,
  label,
  hint,
  value,
  onSelect,
  tone = "default",
}: {
  icon: React.ReactNode
  label: string
  hint?: string
  value?: string
  onSelect: () => void
  tone?: "default" | "danger"
}) {
  return (
    <Command.Item
      value={value || label}
      onSelect={onSelect}
      className={`group flex items-center gap-2.5 rounded-xs px-2 py-2 text-[12px] cursor-pointer
        data-[selected=true]:bg-accent-subtle data-[selected=true]:text-ink
        ${tone === "danger" ? "text-status-danger" : "text-ink-secondary"}`}
    >
      <span className="text-ink-muted group-data-[selected=true]:text-ink">
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {hint && (
        <span className="text-[10px] text-ink-muted truncate max-w-[120px]">
          {hint}
        </span>
      )}
    </Command.Item>
  )
}

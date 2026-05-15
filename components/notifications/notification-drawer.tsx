"use client"

import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { X, CheckCheck, Inbox } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useNotifications, NotificationItem } from "./use-notifications"
import { EmptyState } from "@/components/ui/empty-state"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
}

const TYPE_LABEL: Record<string, string> = {
  task_assigned: "Task baru",
  task_status: "Status",
  task_progress: "Progress",
  task_deleted: "Task dihapus",
  task_reassigned: "Reassign",
  task_on_hold: "On Hold",
  task_started: "Mulai dikerjakan",
  revision: "Revisi",
  video_uploaded: "Video baru",
  video_reviewed: "Video direview",
  comment: "Komentar",
  asset_uploaded: "Aset baru",
  call_invited: "Panggilan",
  user_created: "Akun baru",
  user_deleted: "Akun dihapus",
  clock_in: "Clock In",
  clock_out: "Clock Out",
  deadline_warning: "Deadline",
  weekly_report: "Laporan",
}

const TYPE_COLOR: Record<string, string> = {
  task_assigned: "bg-status-editing",
  task_status: "bg-status-need-review",
  task_progress: "bg-status-assigned",
  task_deleted: "bg-status-danger",
  task_reassigned: "bg-status-assigned",
  task_on_hold: "bg-status-revise",
  task_started: "bg-status-editing",
  revision: "bg-status-revise",
  video_uploaded: "bg-status-ready-upload",
  video_reviewed: "bg-status-completed",
  comment: "bg-status-assigned",
  asset_uploaded: "bg-status-ready-upload",
  call_invited: "bg-status-need-review",
  user_created: "bg-status-completed",
  user_deleted: "bg-status-danger",
  clock_in: "bg-status-completed",
  clock_out: "bg-status-danger",
  deadline_warning: "bg-status-danger",
  weekly_report: "bg-status-completed",
}

function timeAgo(iso: string) {
  const t = new Date(iso).getTime()
  const diff = Date.now() - t
  const m = Math.floor(diff / 60000)
  if (m < 1) return "baru saja"
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}j`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}h`
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
}

function groupByDay(notifs: NotificationItem[]) {
  const groups: { label: string; items: NotificationItem[] }[] = []
  const todayKey = new Date().toDateString()
  const yKey = new Date(Date.now() - 86400000).toDateString()
  const map = new Map<string, NotificationItem[]>()

  for (const n of notifs) {
    const d = new Date(n.createdAt)
    const key = d.toDateString()
    const arr = map.get(key) || []
    arr.push(n)
    map.set(key, arr)
  }

  for (const [key, items] of map) {
    let label: string
    if (key === todayKey) label = "Hari ini"
    else if (key === yKey) label = "Kemarin"
    else
      label = new Date(key).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    groups.push({ label, items })
  }
  return groups
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const { notifications, unreadCount, loading, markRead, markAllRead } =
    useNotifications()
  const [tab, setTab] = useState<"unread" | "all">(unreadCount > 0 ? "unread" : "all")
  const router = useRouter()

  const visible = useMemo(() => {
    if (tab === "unread") return notifications.filter((n) => !n.isRead)
    return notifications
  }, [notifications, tab])

  const groups = useMemo(() => groupByDay(visible), [visible])

  function handleClick(n: NotificationItem) {
    if (!n.isRead) markRead(n.id)
    if (n.taskId) {
      // navigate to a tasks page with selected task. Editor-specific path is fine for now.
      router.push(`/dashboard/notifications?task=${n.taskId}`)
    }
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-(--dur-fast)"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Notifications"
        className={cn(
          "absolute inset-y-0 right-0 w-full max-w-md bg-surface border-l border-line",
          "flex flex-col shadow-lg",
          "animate-in slide-in-from-right duration-(--dur-modal-enter) ease-(--ease-out)"
        )}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted">
              Inbox
            </p>
            <h2 className="mt-1.5 font-display italic text-3xl text-ink leading-[1.05]">
              Notifications
            </h2>
            <p className="mt-1 text-[11px] text-ink-secondary">
              {unreadCount > 0
                ? `${unreadCount} belum dibaca`
                : "Semua sudah dibaca"}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 rounded-xs px-2 py-1 text-[11px] text-ink-secondary hover:text-ink hover:bg-subtle transition-colors"
                aria-label="Mark all as read"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="size-8 inline-flex items-center justify-center rounded-sm text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "unread" | "all")}>
            <TabsList variant="line">
              <TabsTrigger value="unread" className="text-[12px]">
                Unread
                {unreadCount > 0 && (
                  <span
                    className={cn(
                      "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-pill px-1 text-[9px] font-mono tabular-nums font-semibold",
                      tab === "unread"
                        ? "bg-accent-subtle text-accent"
                        : "bg-subtle text-ink-secondary"
                    )}
                  >
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="text-[12px]">
                All
              </TabsTrigger>
            </TabsList>
            <TabsContent value="unread" />
            <TabsContent value="all" />
          </Tabs>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-md bg-subtle animate-pulse" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={<Inbox />}
                title={tab === "unread" ? "Inbox bersih" : "Belum ada notifikasi"}
                description={
                  tab === "unread"
                    ? "Tidak ada notifikasi yang belum dibaca."
                    : "Notifikasi akan muncul di sini ketika ada aktivitas."
                }
                size="sm"
              />
            </div>
          ) : (
            <div className="divide-y divide-line">
              {groups.map((g) => (
                <div key={g.label}>
                  <div className="px-5 py-2 bg-subtle/40 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted sticky top-0">
                    {g.label}
                  </div>
                  <div className="divide-y divide-line">
                    {g.items.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleClick(n)}
                        className={cn(
                          "w-full text-left px-5 py-3.5 flex items-start gap-3",
                          "hover:bg-subtle/50 transition-colors duration-(--dur-fast)",
                          "focus-visible:outline-none focus-visible:bg-subtle/50"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-1 size-2 rounded-full shrink-0",
                            TYPE_COLOR[n.type] || "bg-status-assigned",
                            n.isRead && "opacity-30"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <p
                              className={cn(
                                "text-[12px] leading-snug truncate",
                                n.isRead
                                  ? "text-ink-secondary"
                                  : "text-ink font-medium"
                              )}
                            >
                              {n.title}
                            </p>
                            <span className="ml-auto text-[10px] font-mono text-ink-muted shrink-0">
                              {timeAgo(n.createdAt)}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "mt-0.5 text-[11px] leading-relaxed line-clamp-2",
                              n.isRead ? "text-ink-muted" : "text-ink-secondary"
                            )}
                          >
                            {n.body}
                          </p>
                          {TYPE_LABEL[n.type] && (
                            <span className="mt-1.5 inline-block text-[9px] font-medium uppercase tracking-wider text-ink-muted">
                              {TYPE_LABEL[n.type]}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body
  )
}

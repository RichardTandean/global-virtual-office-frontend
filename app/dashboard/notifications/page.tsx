"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Inbox, CheckCheck, Filter } from "lucide-react"
import { PageHeader } from "@/components/shell/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  useNotifications,
  type NotificationItem,
} from "@/components/notifications/use-notifications"
import { cn } from "@/lib/utils"

const TYPE_LABEL: Record<string, string> = {
  task_assigned: "Task baru",
  task_status: "Perubahan status",
  revision: "Revisi",
  video_uploaded: "Video diupload",
  video_reviewed: "Video direview",
  comment: "Komentar",
  deadline_warning: "Deadline",
  weekly_report: "Laporan",
}

const TYPE_COLOR: Record<string, string> = {
  task_assigned: "bg-status-editing",
  task_status: "bg-status-need-review",
  revision: "bg-status-revise",
  video_uploaded: "bg-status-ready-upload",
  video_reviewed: "bg-status-completed",
  comment: "bg-status-assigned",
  deadline_warning: "bg-status-danger",
  weekly_report: "bg-status-completed",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function NotificationsArchivePage() {
  const router = useRouter()
  const { notifications, unreadCount, loading, markRead, markAllRead } =
    useNotifications()
  const [tab, setTab] = useState<"unread" | "all">(
    unreadCount > 0 ? "unread" : "all",
  )
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (tab === "unread" && n.isRead) return false
      if (typeFilter !== "all" && n.type !== typeFilter) return false
      return true
    })
  }, [notifications, tab, typeFilter])

  function handleClick(n: NotificationItem) {
    if (!n.isRead) markRead(n.id)
    if (n.taskId) {
      router.push(`/dashboard?task=${n.taskId}`)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inbox"
        title="Notifikasi"
        description="Semua aktivitas dan pemberitahuan dari sistem."
        actions={
          unreadCount > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={markAllRead}
              className="gap-1.5"
            >
              <CheckCheck className="size-4" />
              Tandai semua dibaca
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "unread" | "all")}>
          <TabsList variant="ghost">
            <TabsTrigger value="unread">
              Belum dibaca
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">Semua</TabsTrigger>
          </TabsList>
          <TabsContent value="unread" />
          <TabsContent value="all" />
        </Tabs>

        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-ink-muted" />
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
            <SelectTrigger size="sm" className="w-44">
              <SelectValue placeholder="Semua tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua tipe</SelectItem>
              {Object.entries(TYPE_LABEL).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-line bg-surface overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-sm bg-subtle/60 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={<Inbox />}
              title="Tidak ada notifikasi"
              description={
                tab === "unread"
                  ? "Tidak ada notifikasi yang belum dibaca."
                  : "Belum ada aktivitas yang tercatat."
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => handleClick(n)}
                  className={cn(
                    "w-full text-left px-5 py-4 flex items-start gap-4",
                    "hover:bg-subtle/50 transition-colors duration-(--dur-fast)",
                    "focus-visible:outline-none focus-visible:bg-subtle/50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 rounded-full shrink-0",
                      TYPE_COLOR[n.type] || "bg-status-assigned",
                      n.isRead && "opacity-30",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                      <p
                        className={cn(
                          "text-[13px] leading-snug truncate",
                          n.isRead
                            ? "text-ink-secondary"
                            : "text-ink font-medium",
                        )}
                      >
                        {n.title}
                      </p>
                      <span className="ml-auto text-[10px] font-mono text-ink-muted shrink-0">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-[12px] leading-relaxed",
                        n.isRead ? "text-ink-muted" : "text-ink-secondary",
                      )}
                    >
                      {n.body}
                    </p>
                    {TYPE_LABEL[n.type] && (
                      <span className="mt-2 inline-block text-[9px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                        {TYPE_LABEL[n.type]}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

"use client"

import { useTranslations } from "next-intl"
import { Bell } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useNotifications } from "./use-notifications"
import { NotificationDrawer } from "./notification-drawer"

export function NotificationBell() {
  const t = useTranslations()
  const { unreadCount } = useNotifications()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "relative inline-flex size-8 items-center justify-center rounded-sm",
          "text-ink-secondary hover:text-ink hover:bg-subtle",
          "transition-colors duration-(--dur-fast)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        )}
        aria-label={unreadCount > 0 ? t("notifications.unreadBadge") : t("notifications.ariaNotifications")}
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-3.5 h-3.5 rounded-pill bg-accent px-1">
            <span className="text-[9px] font-semibold text-accent-foreground leading-none tabular-nums">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      <NotificationDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}

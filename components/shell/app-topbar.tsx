"use client"

import { Menu, Search } from "lucide-react"
import { Kbd } from "@/components/ui/kbd"
import { BreadcrumbTrail } from "./breadcrumb-trail"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface AppTopbarProps {
  onOpenMobileNav: () => void
  onOpenCommand: () => void
}

export function AppTopbar({ onOpenMobileNav, onOpenCommand }: AppTopbarProps) {
  const t = useTranslations()
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform)

  return (
    <header className="sticky top-0 z-30 h-[57px] bg-canvas/85 backdrop-blur supports-backdrop-filter:bg-canvas/70 border-b border-line">
      <div className="h-full px-3 md:px-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="md:hidden inline-flex size-8 items-center justify-center rounded-sm text-ink-secondary hover:bg-subtle hover:text-ink transition-colors"
          aria-label={t("nav.openNav")}
        >
          <Menu className="size-4" />
        </button>

        <BreadcrumbTrail />

        <button
          type="button"
          onClick={onOpenCommand}
          className={cn(
            "ml-auto inline-flex items-center gap-2 h-8 px-3",
            "rounded-sm bg-subtle border border-line text-ink-muted",
            "hover:border-line-strong hover:text-ink transition-colors duration-(--dur-fast)",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
            "min-w-[180px] md:min-w-[240px] justify-between"
          )}
          aria-label={t("nav.openCommand")}
        >
          <span className="inline-flex items-center gap-2 text-[12px]">
            <Search className="size-3.5" />
            <span className="hidden sm:inline">{t("nav.searchPlaceholder")}</span>
          </span>
          <Kbd>{isMac ? "⌘K" : "Ctrl K"}</Kbd>
        </button>

        <NotificationBell />
      </div>
    </header>
  )
}

"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"

const SEGMENT_KEY_MAP: Record<string, string> = {
  dashboard: "dashboard",
  editor: "editor",
  korea: "koreaTeam",
  admin: "admin",
  tasks: "tasks",
  calendar: "calendar",
  notifications: "notifications",
  reports: "reports",
}

export function BreadcrumbTrail() {
  const t = useTranslations()
  const pathname = usePathname() || ""
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 2) return null

  function labelFor(seg: string) {
    const mapped = SEGMENT_KEY_MAP[seg]
    if (mapped) return t(`breadcrumb.${mapped}`)
    return seg.charAt(0).toUpperCase() + seg.slice(1)
  }

  const crumbs = segments.map((seg, i) => ({
    label: labelFor(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
    last: i === segments.length - 1,
  }))

  return (
    <nav
      aria-label={t("breadcrumb.label")}
      className="hidden md:flex items-center gap-1 text-[12px] text-ink-muted"
    >
      {crumbs.map((c, i) => (
        <span key={c.href} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3 text-ink-muted/60" />}
          {c.last ? (
            <span className="text-ink">{c.label}</span>
          ) : (
            <Link
              href={c.href}
              className="hover:text-ink transition-colors duration-(--dur-fast)"
            >
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

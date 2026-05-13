"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  editor: "Editor",
  korea: "Korea Team",
  admin: "Admin",
  tasks: "Tasks",
  calendar: "Calendar",
  notifications: "Notifications",
  reports: "Reports",
}

function labelFor(seg: string) {
  return SEGMENT_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)
}

export function BreadcrumbTrail() {
  const pathname = usePathname() || ""
  const segments = pathname.split("/").filter(Boolean)

  // Hide breadcrumb for top-level dashboard root pages (just title is enough)
  if (segments.length <= 2) return null

  const crumbs = segments.map((seg, i) => ({
    label: labelFor(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
    last: i === segments.length - 1,
  }))

  return (
    <nav
      aria-label="Breadcrumb"
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

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Role, navFor, roleLabel, homeFor } from "./nav-config"
import { ThemeToggle } from "./theme-toggle"
import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown, KeyRound, LogOut, PanelLeft } from "lucide-react"
import { logout } from "@/auth"
import { useNotifications } from "@/components/notifications/use-notifications"
import { ChangePasswordDialog } from "./change-password-dialog"

interface AppSidebarProps {
  user: { id: string; name: string; email: string; role: string }
  collapsed: boolean
  onToggleCollapse: () => void
}

export function AppSidebar({ user, collapsed, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname()
  const role = (user.role as Role) || "Editor"
  const sections = navFor(role)
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")

  const [pwDialogOpen, setPwDialogOpen] = useState(false)

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "group/sidebar relative hidden md:flex flex-col shrink-0",
        "sticky top-0 h-screen",
        "bg-subtle border-r border-line",
        "transition-[width] duration-(--dur-base) ease-(--ease-out)",
        collapsed ? "w-[64px]" : "w-[240px]"
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-4 border-b border-line h-[57px]",
          collapsed && "justify-center px-2"
        )}
      >
        <Link
          href={homeFor(role)}
          className="flex items-center gap-2 min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
        >
          <div className="size-7 rounded-sm bg-accent grid place-items-center shrink-0">
            <span className="font-display italic text-[15px] text-accent-foreground leading-none">
              L
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display italic text-[16px] leading-none text-ink truncate">
                Lejel
              </div>
              <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-ink-muted mt-0.5">
                WFH Studio
              </div>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="ml-auto inline-flex size-6 items-center justify-center rounded-xs text-ink-muted hover:text-ink hover:bg-elevated transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelLeft className="size-3.5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.label && !collapsed && (
              <div className="px-3 mb-1 text-[9px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href + "/"))
              const Icon = item.icon
              return (
                <SidebarNavLink
                  key={item.href}
                  href={item.href}
                  active={Boolean(active)}
                  collapsed={collapsed}
                  badge={item.badge}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </SidebarNavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer: user + theme */}
      <div className="border-t border-line p-2 space-y-1">
        {!collapsed && <ThemeToggle variant="row" />}

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-2",
              "hover:bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              collapsed && "justify-center px-1"
            )}
          >
            <Avatar size="sm">
              <AvatarFallback>{initials || "—"}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[12px] font-medium text-ink truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-ink-muted truncate">
                    {roleLabel[role]}
                  </div>
                </div>
                <ChevronsUpDown className="size-3 text-ink-muted shrink-0" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setPwDialogOpen(true)}>
                <KeyRound className="size-3.5" />
                Ganti Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => logout()}>
                <LogOut className="size-3.5" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full inline-flex h-8 items-center justify-center rounded-xs text-ink-muted hover:text-ink hover:bg-elevated transition-colors"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="size-3.5 rotate-180" />
          </button>
        )}
      </div>
      {pwDialogOpen && (
        <ChangePasswordDialog open={pwDialogOpen} onOpenChange={setPwDialogOpen} />
      )}
    </aside>
  )
}

function SidebarNavLink({
  href,
  active,
  collapsed,
  badge,
  children,
}: {
  href: string
  active: boolean
  collapsed: boolean
  badge?: "notif" | null
  children: React.ReactNode
}) {
  const { unreadCount } = useNotifications()
  const showBadge = badge === "notif" && unreadCount > 0

  return (
    <Link
      href={href}
      className={cn(
        "group/link relative flex items-center gap-2.5 rounded-sm px-3 py-2",
        "text-[12px] font-medium transition-all duration-(--dur-fast) ease-(--ease-out)",
        "outline-none focus-visible:ring-2 focus-visible:ring-focus",
        collapsed && "justify-center px-2",
        active
          ? "bg-elevated text-ink shadow-sm"
          : "text-ink-secondary hover:bg-elevated hover:text-ink"
      )}
    >
      {/* active indicator bar */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-accent" />
      )}
      {children}
      {showBadge && !collapsed && (
        <span className="ml-auto inline-flex items-center justify-center min-w-4 h-4 rounded-pill bg-accent text-accent-foreground text-[9px] font-semibold px-1">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
      {showBadge && collapsed && (
        <span className="absolute top-1 right-1 size-1.5 rounded-full bg-accent" />
      )}
    </Link>
  )
}

interface MobileSidebarProps {
  user: { id: string; name: string; email: string; role: string }
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ user, open, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const role = (user.role as Role) || "Editor"
  const sections = navFor(role)
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")

  // Close on route change
  const lastPath = useRef(pathname)
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname
      onClose()
    }
  }, [pathname, onClose])

  if (!open) return null

  const [pwDialogOpen, setPwDialogOpen] = useState(false)

  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="absolute inset-y-0 left-0 w-[280px] bg-subtle border-r border-line flex flex-col animate-in slide-in-from-left duration-(--dur-modal-enter)">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-line h-[57px]">
          <div className="size-7 rounded-sm bg-accent grid place-items-center">
            <span className="font-display italic text-[15px] text-accent-foreground leading-none">
              L
            </span>
          </div>
          <div>
            <div className="font-display italic text-[16px] leading-none text-ink">
              Lejel
            </div>
            <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-ink-muted mt-0.5">
              WFH Studio
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.label && (
                <div className="px-3 mb-1 text-[9px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                  {section.label}
                </div>
              )}
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href + "/"))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] font-medium",
                      active
                        ? "bg-elevated text-ink"
                        : "text-ink-secondary hover:bg-elevated hover:text-ink"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-line p-3 space-y-2">
          <ThemeToggle variant="row" />
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-2",
                "hover:bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              )}
            >
              <Avatar size="sm">
                <AvatarFallback>{initials || "—"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <div className="text-[12px] font-medium text-ink truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-ink-muted truncate">
                  {user.email}
                </div>
              </div>
              <ChevronsUpDown className="size-3 text-ink-muted shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setPwDialogOpen(true)}>
                  <KeyRound className="size-3.5" />
                  Ganti Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => logout()}>
                  <LogOut className="size-3.5" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      {pwDialogOpen && (
        <ChangePasswordDialog open={pwDialogOpen} onOpenChange={setPwDialogOpen} />
      )}
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import { AppSidebar, MobileSidebar } from "./app-sidebar"
import { AppTopbar } from "./app-topbar"
import { CommandPalette } from "./command-palette"
import { NotificationsProvider } from "@/components/notifications/use-notifications"

interface AppShellProps {
  user: { id: string; name: string; email: string; role: string }
  children: React.ReactNode
}

const COLLAPSED_KEY = "lejel:sidebar:collapsed"

export function AppShell({ user, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem(COLLAPSED_KEY)
      if (v === "1") setCollapsed(true)
    } catch {}
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0")
      } catch {}
      return next
    })
  }

  return (
    <NotificationsProvider>
      <div className="bg-canvas text-ink flex">
        <AppSidebar
          user={user}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
        <MobileSidebar
          user={user}
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <AppTopbar
            onOpenMobileNav={() => setMobileOpen(true)}
            onOpenCommand={() => setCmdOpen(true)}
          />
          <main className="flex-1 min-w-0">
            <div className="mx-auto w-full max-w-6xl px-4 md:px-8 py-6 md:py-10">
              {children}
            </div>
          </main>
        </div>
      </div>

      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        user={user}
      />
    </NotificationsProvider>
  )
}

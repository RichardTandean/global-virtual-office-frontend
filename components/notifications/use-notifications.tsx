"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"

export interface NotificationItem {
  id: string
  type: string
  title: string
  body: string
  taskId: string | null
  isRead: boolean
  createdAt: string
}

interface NotificationsContextValue {
  notifications: NotificationItem[]
  unreadCount: number
  loading: boolean
  refresh: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const seenIdsRef = useRef<Set<string>>(new Set())

  const refresh = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        fetch("/api/notifications?limit=50"),
        fetch("/api/notifications/unread-count"),
      ])
      if (listRes.ok) {
        const data: NotificationItem[] = await listRes.json()
        setNotifications(data)
        data.forEach((n) => seenIdsRef.current.add(n.id))
      }
      if (countRes.ok) {
        const data = await countRes.json()
        setUnreadCount(typeof data.count === "number" ? data.count : 0)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
    } catch {
      // silent
    }
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" })
    } catch {
      // silent
    }
  }, [])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // SSE stream
  useEffect(() => {
    let es: EventSource | null = null
    let retry: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    function connect() {
      if (cancelled) return
      try {
        es = new EventSource("/api/notifications/stream")
      } catch {
        retry = setTimeout(connect, 5000)
        return
      }

      es.onopen = () => {
        // connection established, no action needed
      }

      es.onmessage = (e) => {
        if (!e.data) return
        if (e.data === "connected") return

        // handle legacy ping format from older backends
        if (e.data === '{"ping":true}') return

        try {
          const data = JSON.parse(e.data)
          // ignore ping/connected JSON objects
          if (data && data.ping) return
          if (data && data.connected) return

          const items: NotificationItem[] = Array.isArray(data) ? data : [data]
          let newCount = 0
          setNotifications((prev) => {
            const map = new Map(prev.map((n) => [n.id, n]))
            for (const it of items) {
              if (!it.id) continue
              if (!seenIdsRef.current.has(it.id)) {
                seenIdsRef.current.add(it.id)
                if (!it.isRead) newCount += 1
                toast.message(it.title, {
                  description: it.body,
                })
              }
              map.set(it.id, it)
            }
            return Array.from(map.values()).sort((a, b) =>
              b.createdAt.localeCompare(a.createdAt)
            )
          })
          if (newCount > 0) setUnreadCount((c) => c + newCount)
        } catch {
          // ignore parse errors
        }
      }

      es.onerror = () => {
        es?.close()
        es = null
        retry = setTimeout(connect, 5000)
      }
    }

    connect()

    return () => {
      cancelled = true
      if (retry) clearTimeout(retry)
      es?.close()
    }
  }, [])

  const value = useMemo(
    () => ({ notifications, unreadCount, loading, refresh, markRead, markAllRead }),
    [notifications, unreadCount, loading, refresh, markRead, markAllRead]
  )

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    // graceful fallback when used outside provider (e.g. during static rendering)
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      refresh: async () => {},
      markRead: async () => {},
      markAllRead: async () => {},
    }
  }
  return ctx
}

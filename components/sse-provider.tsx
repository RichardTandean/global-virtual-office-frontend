"use client"

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react"

interface SSEContextType {
  subscribe: (taskId: string, onEvent: (event: string, data: any) => void) => () => void
}

const SSEContext = createContext<SSEContextType | null>(null)

export function useSSE() {
  const ctx = useContext(SSEContext)
  if (!ctx) throw new Error("useSSE must be used within SSEProvider")
  return ctx
}

export function SSEProvider({
  taskId,
  children,
}: {
  taskId: string | null
  children: React.ReactNode
}) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const listenersRef = useRef<Map<string, Array<(event: string, data: any) => void>>>(new Map())
  const [ready, setReady] = useState(false)

  const subscribe = useCallback(
    (id: string, onEvent: (event: string, data: any) => void) => {
      const existing = listenersRef.current.get(id) || []
      existing.push(onEvent)
      listenersRef.current.set(id, existing)
      return () => {
        const list = listenersRef.current.get(id) || []
        listenersRef.current.set(
          id,
          list.filter((cb) => cb !== onEvent),
        )
      }
    },
    [],
  )

  useEffect(() => {
    if (!taskId) return

    const es = new EventSource(`/api/tasks/${taskId}/progress-stream`)
    eventSourceRef.current = es

    es.onopen = () => setReady(true)
    es.onerror = () => {
      setReady(false)
      setTimeout(() => {
        es.close()
      }, 5000)
    }

    es.onmessage = (e) => {
      if (!e.data || e.data === "{}") return
      try {
        const parsed = JSON.parse(e.data)
        const eventType = (e as any).type || ""
        listenersRef.current.forEach((callbacks) => {
          callbacks.forEach((cb) => cb(eventType, parsed))
        })
      } catch {
        // ignore parse errors
      }
    }

    return () => {
      es.close()
      eventSourceRef.current = null
      setReady(false)
    }
  }, [taskId])

  return (
    <SSEContext.Provider value={{ subscribe }}>
      {children}
    </SSEContext.Provider>
  )
}

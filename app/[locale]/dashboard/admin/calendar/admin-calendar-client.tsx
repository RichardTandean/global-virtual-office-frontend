"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { CalendarPanel } from "@/components/calendar/calendar-panel"
import { EventDialog } from "@/components/calendar/event-dialog"
import type { CalendarTask, CalendarEvent } from "@/components/calendar/calendar-week"
import { Plus } from "lucide-react"

interface Props {
  initialTasks: CalendarTask[]
  initialEvents: CalendarEvent[]
  month: string
}

export function AdminCalendarClient({ initialTasks, initialEvents, month }: Props) {
  const t = useTranslations()
  const [tasks] = useState<CalendarTask[]>(initialTasks)
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/events?month=${month}`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch {}
  }, [month])

  useEffect(() => {
    if (initialEvents.length === 0) fetchEvents()
  }, [])

  function handleEventClick(event: CalendarEvent) {
    setEditEvent(event)
    setDialogOpen(true)
  }

  function handleAddClick() {
    setEditEvent(null)
    setDialogOpen(true)
  }

  function handleSaved() {
    fetchEvents()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink-muted font-medium">
            {t("adminCalendar.eyebrow")}
          </p>
          <h1 className="font-display italic text-2xl text-ink">{t("adminCalendar.title")}</h1>
          <p className="text-[12px] text-ink-secondary">
            {t("adminCalendar.desc")}
          </p>
        </div>
        <Button size="sm" onClick={handleAddClick} className="gap-1.5">
          <Plus className="size-3.5" />
          {t("calendar.addEvent")}
        </Button>
      </div>

      <CalendarPanel
        tasks={tasks}
        events={events}
        role="Admin"
        onEventClick={handleEventClick}
      />

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
        editEvent={editEvent}
      />
    </div>
  )
}

"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Phone } from "lucide-react"
import type { CalendarEvent } from "./calendar-week"
import { useRouter } from "@/i18n/navigation"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editEvent?: CalendarEvent | null
}

const EVENT_TYPE_KEYS = [
  { value: "holiday", key: "calendar.holiday" },
  { value: "event", key: "calendar.event" },
  { value: "meeting", key: "calendar.meeting" },
]

export function EventDialog({ open, onOpenChange, onSaved, editEvent }: EventDialogProps) {
  const t = useTranslations()
  const router = useRouter()
  const isEdit = !!editEvent

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"holiday" | "event" | "meeting">("event")
  const [date, setDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useState(() => {
    if (editEvent) {
      setTitle(editEvent.title)
      setDescription(editEvent.description || "")
      setType(editEvent.type)
      setDate(editEvent.date)
      setEndDate(editEvent.endDate || "")
    } else {
      setTitle("")
      setDescription("")
      setType("event")
      setDate(new Date().toISOString().slice(0, 10))
      setEndDate("")
    }
  })

  function reset() {
    setTitle("")
    setDescription("")
    setType("event")
    setDate(new Date().toISOString().slice(0, 10))
    setEndDate("")
  }

  async function handleSubmit() {
    if (!title.trim() || !date) {
      toast.error(t("calendar.titleRequired"))
      return
    }

    setSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        date,
        endDate: endDate || undefined,
      }

      const url = isEdit
        ? `/api/events/${editEvent!.id}`
        : "/api/events"

      const method = isEdit ? "PATCH" : "POST"

      if (isEdit) {
        body.endDate = endDate || null
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(isEdit ? t("calendar.eventSaved") : t("calendar.eventAdded"))
        onOpenChange(false)
        reset()
        onSaved()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message || t("calendar.saveFailed"))
      }
    } catch {
      toast.error(t("calendar.saveFailed"))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!editEvent) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/events/${editEvent.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success(t("calendar.eventDeleted"))
        onOpenChange(false)
        reset()
        onSaved()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message || t("calendar.deleteFailed"))
      }
    } catch {
      toast.error(t("calendar.deleteFailed"))
    } finally {
      setSubmitting(false)
    }
  }

  const linkedCallRoom = editEvent?.callRoom

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) reset()
        onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            {isEdit ? t("calendar.editEvent") : t("calendar.addEvent")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("calendar.editOrDelete")
              : t("calendar.createNew")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {linkedCallRoom && (
            <div className="rounded-lg bg-purple-50 dark:bg-purple-950 p-3 border border-purple-200 dark:border-purple-800">
              <p className="text-xs font-medium text-purple-800 dark:text-purple-200">
                {t("calls.scheduledFor")}: {linkedCallRoom.name}
              </p>
              <Button
                size="sm"
                className="mt-2 gap-1 w-full"
                onClick={() => {
                  onOpenChange(false)
                  router.push("/dashboard/calls")
                }}
              >
                <Phone className="h-3 w-3" /> {t("calls.join")}
              </Button>
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs">{t("calendar.type")}</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPE_KEYS.map((et) => (
                  <SelectItem key={et.value} value={et.value}>
                    {t(et.key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("calendar.title")}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("calendar.titlePlaceholder")}
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("calendar.descriptionOptional")}</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("calendar.descriptionPlaceholder")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t("calendar.startDate")}</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("calendar.endDate")}</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder={t("common.optional")}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="flex-1 gap-1.5"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? t("common.saving")
                : isEdit
                  ? t("common.update")
                  : t("common.submit")}
            </Button>
          </div>
          {isEdit && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? t("common.deleting") : t("calendar.deleteEvent")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

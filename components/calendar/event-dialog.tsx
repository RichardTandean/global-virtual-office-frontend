"use client"

import { useState } from "react"
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
import type { CalendarEvent } from "./calendar-week"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editEvent?: CalendarEvent | null
}

const EVENT_TYPES = [
  { value: "holiday", label: "Holiday" },
  { value: "event", label: "Event" },
  { value: "meeting", label: "Meeting" },
]

export function EventDialog({ open, onOpenChange, onSaved, editEvent }: EventDialogProps) {
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
      toast.error("Judul dan tanggal wajib diisi")
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
        toast.success(isEdit ? "Event berhasil diupdate" : "Event berhasil ditambahkan")
        onOpenChange(false)
        reset()
        onSaved()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message || "Gagal menyimpan event")
      }
    } catch {
      toast.error("Gagal menyimpan event")
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
        toast.success("Event berhasil dihapus")
        onOpenChange(false)
        reset()
        onSaved()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message || "Gagal menghapus event")
      }
    } catch {
      toast.error("Gagal menghapus event")
    } finally {
      setSubmitting(false)
    }
  }

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
            {isEdit ? "Edit Event" : "Tambah Event"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Edit atau hapus event yang sudah ada."
              : "Buat event, holiday, atau meeting baru."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Tipe</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Judul</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nama event atau holiday"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Deskripsi (opsional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail event"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Tanggal Mulai</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tanggal Selesai</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Opsional"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              className="flex-1 gap-1.5"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Menyimpan..." : isEdit ? "Update" : "Tambah"}
            </Button>
          </div>
          {isEdit && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "Menghapus..." : "Hapus Event"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

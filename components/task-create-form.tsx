"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UserOption {
  id: string
  name: string
}

interface TaskCreateFormProps {
  editors: UserOption[]
  onCreated: () => void
  onCancel: () => void
}

export default function TaskCreateForm({
  editors,
  onCreated,
  onCancel,
}: TaskCreateFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [briefUrl, setBriefUrl] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [deadline, setDeadline] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!assignedTo) return
    setLoading(true)
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          briefUrl: briefUrl || undefined,
          assignedTo,
          deadline: deadline || undefined,
        }),
      })
      if (res.ok) {
        setTitle("")
        setDescription("")
        setBriefUrl("")
        setAssignedTo("")
        setDeadline("")
        onCreated()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-md border border-line bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display italic text-xl text-ink leading-none">
          Buat task baru
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Judul task</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Misal: Edit promo flash sale Senin"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Deskripsi</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Detail brief, referensi, atau catatan khusus..."
          />
        </div>

        <div className="space-y-1.5">
          <Label>Brief / Script URL</Label>
          <Input
            type="url"
            value={briefUrl}
            onChange={(e) => setBriefUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Assign ke editor</Label>
            <Select
              value={assignedTo}
              onValueChange={(v) => setAssignedTo(v ?? "")}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih editor..." />
              </SelectTrigger>
              <SelectContent>
                {editors.map((ed) => (
                  <SelectItem key={ed.id} value={ed.id}>
                    {ed.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Deadline</Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
          <Button type="button" variant="ghost" onClick={onCancel} size="sm">
            Batal
          </Button>
          <Button type="submit" disabled={loading} size="sm">
            {loading ? "Membuat..." : "Buat task"}
          </Button>
        </div>
      </form>
    </div>
  )
}

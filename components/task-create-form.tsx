"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserOption {
  id: string
  name: string
}

interface TaskCreateFormProps {
  editors: UserOption[]
  onCreated: () => void
  onCancel: () => void
}

export default function TaskCreateForm({ editors, onCreated, onCancel }: TaskCreateFormProps) {
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
        body: JSON.stringify({ title, description: description || undefined, briefUrl: briefUrl || undefined, assignedTo, deadline: deadline || undefined }),
      })
      if (res.ok) {
        setTitle(""); setDescription(""); setBriefUrl(""); setAssignedTo(""); setDeadline("")
        onCreated()
      }
    } finally { setLoading(false) }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Buat Task Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Judul Task</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Deskripsi</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1">
            <Label>Brief / Script URL</Label>
            <Input type="url" value={briefUrl} onChange={(e) => setBriefUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Assign ke Editor</Label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Pilih editor...</option>
                {editors.map((ed) => (
                  <option key={ed.id} value={ed.id}>{ed.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Deadline</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} size="sm">Batal</Button>
            <Button type="submit" disabled={loading} size="sm">
              {loading ? "Membuat..." : "Buat Task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

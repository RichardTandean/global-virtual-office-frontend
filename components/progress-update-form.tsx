"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ProgressUpdateFormProps {
  taskId: string
  onSubmitted: () => void
}

export default function ProgressUpdateForm({
  taskId,
  onSubmitted,
}: ProgressUpdateFormProps) {
  const [percent, setPercent] = useState(0)
  const [note, setNote] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/tasks/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          percent,
          note: note || undefined,
          fileUrl: fileUrl || undefined,
        }),
      })
      if (res.ok) {
        setPercent(0)
        setNote("")
        setFileUrl("")
        onSubmitted()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
        Update progress
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Persentase (0-100)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>File URL (opsional)</Label>
          <Input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Catatan</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Apa yang sudah dikerjakan, kendala, dst..."
        />
      </div>
      <Button type="submit" disabled={loading} size="sm">
        {loading ? "Mengirim..." : "Kirim progress"}
      </Button>
    </form>
  )
}

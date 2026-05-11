"use client"

import { useState } from "react"

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
      <h4 className="text-xs font-semibold uppercase text-zinc-500">
        Update Progress
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-zinc-600">
            Persentase (0–100)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600">
            File URL (opsional)
          </label>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600">
          Catatan
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Mengirim..." : "Kirim Progress"}
      </button>
    </form>
  )
}

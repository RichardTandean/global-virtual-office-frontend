"use client"

import { useState } from "react"

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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-base font-semibold text-zinc-900">Buat Task Baru</h3>

      <div>
        <label className="block text-xs font-medium text-zinc-600">
          Judul Task
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-600">
          Deskripsi
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-600">
          Brief / Script URL
        </label>
        <input
          type="url"
          value={briefUrl}
          onChange={(e) => setBriefUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-zinc-600">
            Assign ke Editor
          </label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
            required
          >
            <option value="">Pilih editor...</option>
            {editors.map((ed) => (
              <option key={ed.id} value={ed.id}>
                {ed.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600">
            Deadline
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Membuat..." : "Buat Task"}
        </button>
      </div>
    </form>
  )
}

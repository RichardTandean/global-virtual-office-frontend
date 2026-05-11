"use client"

interface OnlineEditor {
  id: string
  name: string
}

interface Props {
  users: OnlineEditor[]
}

export default function OnlineEditors({ users }: Props) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <h3 className="text-sm font-semibold text-green-800">
          {users.length} Editor Sedang Bekerja
        </h3>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {users.map((u) => (
          <span
            key={u.id}
            className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
          >
            {u.name}
          </span>
        ))}
      </div>
    </div>
  )
}

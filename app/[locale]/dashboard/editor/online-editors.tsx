"use client"

import { useTranslations } from "next-intl"

interface OnlineEditor {
  id: string
  name: string
}

interface Props {
  users: OnlineEditor[]
}

export default function OnlineEditors({ users }: Props) {
  const t = useTranslations()

  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-status-success animate-pulse" />
        <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
          <span className="text-ink">{t("editor.onlineEditors", { n: users.length })}</span>
        </h3>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {users.map((u) => (
          <span
            key={u.id}
            className="inline-flex items-center gap-1.5 rounded-pill bg-status-success/10 px-2.5 py-1 text-[11px] font-medium text-status-success"
          >
            <span className="size-1 rounded-full bg-status-success" />
            {u.name}
          </span>
        ))}
      </div>
    </div>
  )
}

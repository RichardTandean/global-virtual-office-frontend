"use client"

import { logout } from "@/auth"

export default function SignOutButton() {
  return (
    <button
      onClick={() => logout()}
      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
    >
      Keluar
    </button>
  )
}

import { NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function GET() {
  const res = await fetchBackend("/auth/me", { method: "GET" })

  if (!res.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await res.json()
  return NextResponse.json(user)
}

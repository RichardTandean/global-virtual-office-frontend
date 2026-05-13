import { NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function GET() {
  const res = await fetchBackend("/notifications/unread-count", { method: "GET" })
  if (!res.ok) return NextResponse.json({ count: 0 }, { status: 200 })
  const data = await res.json()
  return NextResponse.json(data)
}

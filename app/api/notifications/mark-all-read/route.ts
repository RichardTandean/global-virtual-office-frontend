import { NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function POST() {
  const res = await fetchBackend("/notifications/mark-all-read", { method: "POST" })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}

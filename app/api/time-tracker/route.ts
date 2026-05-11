import { NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function GET() {
  const res = await fetchBackend("/time-tracker", { method: "GET" })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}

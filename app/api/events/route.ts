import { NextRequest, NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month") || ""

  const url = month ? `/events?month=${month}` : "/events"
  const res = await fetchBackend(url, { method: "GET" })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = await fetchBackend("/events", {
    method: "POST",
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json(data)
}

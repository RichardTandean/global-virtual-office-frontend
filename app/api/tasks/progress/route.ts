import { NextRequest, NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = await fetchBackend("/tasks/progress", {
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

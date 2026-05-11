import { NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const res = await fetchBackend(`/tasks/${id}/timer/stop`, { method: "POST" })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json(data)
}

import { NextRequest, NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const res = await fetchBackend(`/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json(data)
}

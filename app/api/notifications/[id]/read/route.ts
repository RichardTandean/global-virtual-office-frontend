import { NextRequest, NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const res = await fetchBackend(`/notifications/${id}/read`, { method: "PATCH" })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}

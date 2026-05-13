import { NextRequest, NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search
  const res = await fetchBackend(`/notifications${search}`, { method: "GET" })
  if (!res.ok) {
    return NextResponse.json([], { status: res.status })
  }
  const data = await res.json()
  if (data && Array.isArray(data.items)) {
    return NextResponse.json(data.items)
  }
  return NextResponse.json(data)
}

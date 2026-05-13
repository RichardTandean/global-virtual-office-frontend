import { NextRequest, NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search
  const res = await fetchBackend(`/reports/weekly${search}`, { method: "GET" })
  if (!res.ok) {
    return NextResponse.json(
      { weekStart: null, rows: [] },
      { status: res.status },
    )
  }
  const data = await res.json()
  return NextResponse.json(data)
}

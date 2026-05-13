import { NextRequest, NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search
  const res = await fetchBackend(`/reports/weekly.csv${search}`, {
    method: "GET",
  })
  if (!res.ok) {
    return NextResponse.json({ error: "failed" }, { status: res.status })
  }
  const text = await res.text()
  const disposition =
    res.headers.get("content-disposition") ?? 'attachment; filename="weekly.csv"'
  return new NextResponse(text, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": disposition,
    },
  })
}

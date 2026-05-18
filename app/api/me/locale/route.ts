import { NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function PATCH(req: Request) {
  const body = await req.json()
  const res = await fetchBackend("/auth/me/locale", {
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

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { fetchBackend } from "@/lib/session"

export async function POST(req: NextRequest) {
  const body = await req.json()

  const res = await fetchBackend("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Gagal mengubah password" },
      { status: res.status },
    )
  }

  const cookieStore = await cookies()
  cookieStore.delete("token")
  cookieStore.delete("user")

  return NextResponse.json({ ok: true })
}

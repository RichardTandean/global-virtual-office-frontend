import { NextResponse } from "next/server"
import { fetchBackend } from "@/lib/session"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let action: string
  try {
    const body = await req.json()
    action = body.action
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 })
  }

  if (action !== "deactivate" && action !== "reactivate") {
    return NextResponse.json({ message: "Action must be 'deactivate' or 'reactivate'" }, { status: 400 })
  }

  const res = await fetchBackend(`/users/${id}/${action}`, { method: "PATCH" })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json(data)
}

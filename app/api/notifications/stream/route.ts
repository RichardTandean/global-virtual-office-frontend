import { NextRequest } from "next/server"
import { BACKEND_URL, getToken } from "@/lib/session"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const token = await getToken()
  if (!token) return new Response("Unauthorized", { status: 401 })

  const upstream = await fetch(`${BACKEND_URL}/notifications/stream`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
    },
    signal: req.signal,
  }).catch(() => null)

  if (!upstream || !upstream.ok || !upstream.body) {
    return new Response("data: connect-failed\n\n", {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}

import { fetchBackend } from "@/lib/session"

export async function GET() {
  const res = await fetchBackend("/call-rooms/office")
  return new Response(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } })
}

import { fetchBackend } from "@/lib/session"

export async function POST(req: Request) {
  const body = await req.json()
  const res = await fetchBackend("/call-rooms", { method: "POST", body: JSON.stringify(body) })
  return new Response(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } })
}

export async function GET() {
  const res = await fetchBackend("/call-rooms")
  return new Response(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } })
}

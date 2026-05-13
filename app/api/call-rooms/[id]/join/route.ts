import { fetchBackend } from "@/lib/session"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const res = await fetchBackend(`/call-rooms/${id}/join`, { method: "POST" })
  return new Response(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } })
}

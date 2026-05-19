import { fetchBackend } from "@/lib/session"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const res = await fetchBackend(`/call-rooms/${id}/invite`, {
    method: "POST",
    body: JSON.stringify(body),
  })
  return new Response(await res.text(), { status: res.status, headers: { "Content-Type": "application/json" } })
}

import { fetchBackend } from "@/lib/session"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const res = await fetchBackend(`/video-submissions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  })
}

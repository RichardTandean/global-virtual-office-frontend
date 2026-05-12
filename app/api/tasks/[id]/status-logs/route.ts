import { fetchBackend } from "@/lib/session"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const res = await fetchBackend(`/tasks/${id}/status-logs`)
  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  })
}

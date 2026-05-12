import { fetchBackend } from "@/lib/session"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params
  const res = await fetchBackend(`/assets/task/${taskId}`)
  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  })
}

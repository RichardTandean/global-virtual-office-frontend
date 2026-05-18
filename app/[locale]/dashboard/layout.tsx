import { requireAuth } from "@/lib/auth-helpers"
import { AppShell } from "@/components/shell/app-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()
  return <AppShell user={session.user}>{children}</AppShell>
}

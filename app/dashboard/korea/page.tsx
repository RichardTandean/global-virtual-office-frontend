import { requireRole } from "@/lib/auth-helpers"
import SignOutButton from "@/components/sign-out-button"

export default async function KoreaDashboard() {
  const session = await requireRole("KoreaTeam")

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Lejel WFH</h1>
            <p className="text-xs text-zinc-500">Korea Team Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">
              {session.user?.name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Overview Editor
          </h2>
          <p className="text-sm text-zinc-400">
            Fitur monitoring editor tersedia di Phase 2 & 4.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            Task Management
          </h2>
          <p className="text-sm text-zinc-400">
            Fitur task assignment tersedia di Phase 2.
          </p>
        </div>
      </main>
    </div>
  )
}

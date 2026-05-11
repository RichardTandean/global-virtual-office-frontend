import { requireRole } from "@/lib/auth-helpers"
import SignOutButton from "@/components/sign-out-button"
import { fetchBackend } from "@/lib/session"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface TimeLog {
  id: string
  userId: string
  clockIn: string
  clockOut: string | null
  durationMinutes: number | null
  user: { id: string; name: string; email: string }
}

export default async function AdminDashboard() {
  const session = await requireRole("Admin")

  const [usersRes, logsRes] = await Promise.all([
    fetchBackend("/users"),
    fetchBackend("/time-tracker/today"),
  ])

  if (!usersRes.ok || !logsRes.ok) {
    throw new Error("Failed to fetch admin data")
  }

  const users: User[] = await usersRes.json()
  const { todayLogs }: { todayLogs: TimeLog[] } = await logsRes.json()

  const clockedInUserIds = new Set(
    todayLogs.filter((l) => !l.clockOut).map((l) => l.userId)
  )

  const usersWithStatus = users.map((u) => ({
    ...u,
    clockedIn: clockedInUserIds.has(u.id),
  }))

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Lejel WFH</h1>
            <p className="text-xs text-zinc-500">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">
              {session.user?.name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">Total User</p>
            <p className="text-3xl font-bold text-zinc-900">{users.length}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">Clock-in Hari Ini</p>
            <p className="text-3xl font-bold text-green-600">
              {clockedInUserIds.size}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">Belum Clock-in</p>
            <p className="text-3xl font-bold text-red-500">
              {users.length - clockedInUserIds.size}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-zinc-900">
              Status Tim Hari Ini
            </h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {usersWithStatus.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                    {user.role === "Admin"
                      ? "Admin"
                      : user.role === "KoreaTeam"
                      ? "Korea Team"
                      : "Editor"}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      user.clockedIn ? "bg-green-500" : "bg-zinc-300"
                    }`}
                  />
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="px-6 py-4 text-sm text-zinc-400">
                Belum ada user terdaftar.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

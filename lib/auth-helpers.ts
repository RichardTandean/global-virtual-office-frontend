import { fetchBackend, getUserCookie } from "@/lib/session"
import { redirect } from "next/navigation"

export interface User {
  id: string
  name: string
  email: string
  role: string
}

export async function auth(): Promise<{ user: User } | null> {
  const userCookie = await getUserCookie()
  if (!userCookie) return null

  // Validate token with backend
  const res = await fetchBackend("/auth/me", { method: "GET" })
  if (!res.ok) return null

  const user = (await res.json()) as User
  return { user }
}

export async function getSession() {
  return auth()
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return session
}

export async function requireRole(...roles: string[]) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userRole = session.user.role
  if (userRole === "Admin") return session
  if (!roles.includes(userRole)) {
    const defaultPaths: Record<string, string> = {
      Admin: "/dashboard/admin",
      KoreaTeam: "/dashboard/korea",
      Editor: "/dashboard/editor",
    }
    redirect(defaultPaths[userRole] || "/login")
  }
  return session
}

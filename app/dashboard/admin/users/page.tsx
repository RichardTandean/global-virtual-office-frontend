import { requireRole } from "@/lib/auth-helpers"
import { fetchBackend } from "@/lib/session"
import { UserManagementClient } from "./user-management-client"

interface UserItem {
  id: string
  name: string
  email: string
  role: string
}

export default async function AdminUsersPage() {
  const session = await requireRole("Admin")

  let users: UserItem[] = []
  try {
    const res = await fetchBackend("/users")
    if (res.ok) users = await res.json()
  } catch {}

  return (
    <UserManagementClient
      initialUsers={users}
      currentUserId={session.user.id}
    />
  )
}

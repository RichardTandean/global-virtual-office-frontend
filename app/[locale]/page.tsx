import { auth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()

  if (!session?.user) redirect("/login")

  const role = (session.user as any).role as string
  const rolePaths: Record<string, string> = {
    Admin: "/dashboard/admin",
    KoreaTeam: "/dashboard/korea",
    Editor: "/dashboard/editor",
  }

  redirect(rolePaths[role] || "/login")
}

import { NextRequest, NextResponse } from "next/server"

const publicPaths = ["/login", "/register"]
const rolePathMap: Record<string, string[]> = {
  Admin: ["/dashboard/admin", "/dashboard/editor", "/dashboard/korea"],
  KoreaTeam: ["/dashboard/korea", "/dashboard/editor"],
  Editor: ["/dashboard/editor"],
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (isPublic) return NextResponse.next()

  const userCookie = req.cookies.get("user")?.value
  const user = userCookie ? JSON.parse(userCookie) : null

  if (!user) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = user.role as string | undefined
  if (role && rolePathMap[role]) {
    const allowed = rolePathMap[role].some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
    if (!allowed) {
      const defaultPath = rolePathMap[role][0]
      return NextResponse.redirect(new URL(defaultPath, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|next.svg|vercel.svg).*)"],
}

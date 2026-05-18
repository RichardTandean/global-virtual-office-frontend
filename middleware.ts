import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

const handleI18n = createMiddleware(routing)

const publicPaths = ["/login"]
const rolePathMap: Record<string, string[]> = {
  Admin: [
    "/dashboard/admin",
    "/dashboard/editor",
    "/dashboard/korea",
    "/dashboard/calls",
    "/dashboard/notifications",
    "/dashboard/admin/reports",
  ],
  KoreaTeam: [
    "/dashboard/korea",
    "/dashboard/editor",
    "/dashboard/calls",
    "/dashboard/notifications",
  ],
  Editor: [
    "/dashboard/editor",
    "/dashboard/calls",
    "/dashboard/notifications",
  ],
}

function applyAuth(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )

  if (isPublic) return NextResponse.next()

  const userCookie = request.cookies.get("user")?.value
  const user = userCookie ? JSON.parse(userCookie) : null

  if (!user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = user.role as string | undefined
  if (role && rolePathMap[role]) {
    const allowed = rolePathMap[role].some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
    if (!allowed) {
      const defaultPath = rolePathMap[role][0]
      return NextResponse.redirect(new URL(defaultPath, request.url))
    }
  }

  return NextResponse.next()
}

export default function middleware(request: NextRequest) {
  const i18nResponse = handleI18n(request)
  if (i18nResponse) return i18nResponse

  return applyAuth(request)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|next.svg|vercel.svg).*)",
  ],
}

import { cookies } from "next/headers"

export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001/api"

export async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get("token")?.value
}

export async function getUserCookie() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("user")?.value
  if (!userCookie) return null
  try {
    return JSON.parse(userCookie)
  } catch {
    return null
  }
}

export async function fetchBackend(path: string, options: RequestInit = {}) {
  const token = await getToken()
  const url = `${BACKEND_URL}${path}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  return res
}

// Client-side auth helpers (thin wrapper around local API routes)

export async function login(email: string, password: string) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || "Login failed")
  }

  return res.json()
}

export async function logout() {
  await fetch("/api/logout", { method: "POST" })
  window.location.href = "/login"
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const res = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldPassword, newPassword, confirmNewPassword: newPassword }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || "Gagal mengubah password")
  }

  return res.json()
}

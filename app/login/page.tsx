"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { login } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      await login(email, password)
      router.push(callbackUrl)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Email atau password salah")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">Lejel WFH</CardTitle>
        <CardDescription>Masuk ke akun kamu</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="kamu@lejel.com"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Masuk..." : "Masuk"}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Hanya admin yang dapat menambahkan akun baru
        </p>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

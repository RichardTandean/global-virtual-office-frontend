"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { login } from "@/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

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
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2">
          <div className="size-7 rounded-sm bg-accent grid place-items-center">
            <span className="font-display italic text-[15px] text-accent-foreground leading-none">
              L
            </span>
          </div>
          <span className="font-display italic text-[18px] text-ink leading-none">
            Lejel
          </span>
        </div>
        <h1 className="font-display italic text-4xl text-ink leading-none tracking-tight">
          Welcome back.
        </h1>
        <p className="text-[13px] text-ink-secondary leading-relaxed">
          Masuk untuk lihat task, jam kerja, dan revisi terbaru.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-sm border border-status-danger/30 bg-status-danger/10 px-3 py-2.5 text-[12px] text-status-danger">
          <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="kamu@lejel.com"
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-10"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-10"
        >
          {loading ? "Masuk..." : "Masuk"}
        </Button>
      </form>

      <p className="text-center text-[11px] text-ink-muted">
        Akun dikelola admin · Hubungi tim untuk akses.
      </p>
    </div>
  )
}

function HeroPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between h-full p-12 grain overflow-hidden bg-subtle">
      {/* Decorative gradient blobs */}
      <div
        aria-hidden
        className="absolute -top-32 -left-20 size-96 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -right-20 size-96 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #14B8A6 0%, transparent 70%)",
        }}
      />

      <div className="relative space-y-4">
        <div className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] text-ink-muted">
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
          Studio Coordination
        </div>
        <h2 className="font-display italic text-7xl leading-[0.9] tracking-tight text-ink">
          One studio,<br />
          one rhythm.
        </h2>
        <p className="text-[13px] text-ink-secondary leading-relaxed max-w-sm">
          Time tracking, video review, revisions, deadlines — all in one place.
          Built for editors and the Korea Team.
        </p>
      </div>

      <div className="relative space-y-3">
        <div className="grid grid-cols-3 gap-3 max-w-md">
          {[
            { label: "Clock-in", value: "08:00" },
            { label: "Review", value: "Live" },
            { label: "Deadlines", value: "Tracked" },
          ].map((it) => (
            <div
              key={it.label}
              className="rounded-sm border border-line bg-elevated/60 p-3"
            >
              <p className="text-[9px] font-medium uppercase tracking-wider text-ink-muted">
                {it.label}
              </p>
              <p className="mt-1.5 font-display italic text-xl text-ink leading-none">
                {it.value}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-ink-muted font-mono">
          v0.1 · Lejel Internal Tooling
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-canvas">
      <HeroPanel />
      <div className="flex items-center justify-center px-6 py-10 min-h-screen">
        <Suspense
          fallback={
            <div className="text-[12px] text-ink-muted">Memuat...</div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

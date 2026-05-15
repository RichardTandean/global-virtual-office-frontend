"use client"

import { useState } from "react"
import { KeyRound, AlertCircle, Loader2 } from "lucide-react"
import { changePassword } from "@/auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const oldPassword = formData.get("oldPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmNewPassword = formData.get("confirmNewPassword") as string

    if (newPassword !== confirmNewPassword) {
      setError("Password baru dan konfirmasi tidak cocok")
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter")
      setLoading(false)
      return
    }

    try {
      await changePassword(oldPassword, newPassword)
      toast.success("Password berhasil diubah", {
        description: "Silakan login kembali dengan password baru",
      })
      onOpenChange(false)
      setTimeout(() => {
        window.location.href = "/login"
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Gagal mengubah password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle>Ganti Password</DialogTitle>
          <DialogDescription>
            Masukkan password saat ini dan password baru Anda.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-sm border border-status-danger/30 bg-status-danger/10 px-3 py-2.5 text-[12px] text-status-danger">
            <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="oldPassword">Password saat ini</Label>
            <Input
              id="oldPassword"
              name="oldPassword"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">Password baru</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmNewPassword">Konfirmasi password baru</Label>
            <Input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5">
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

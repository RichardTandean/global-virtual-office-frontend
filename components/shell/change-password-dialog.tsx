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
import { useTranslations } from "next-intl"

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const t = useTranslations()
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
      setError(t("auth.passwordMismatch"))
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError(t("auth.passwordMinLength"))
      setLoading(false)
      return
    }

    try {
      await changePassword(oldPassword, newPassword)
      toast.success(t("auth.passwordChanged"), {
        description: t("auth.pleaseRelogin"),
      })
      onOpenChange(false)
      setTimeout(() => {
        window.location.href = "/login"
      }, 1500)
    } catch (err: any) {
      setError(err.message || t("auth.changePasswordFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle>{t("changePassword.title")}</DialogTitle>
          <DialogDescription>
            {t("changePassword.desc")}
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
            <Label htmlFor="oldPassword">{t("changePassword.currentPassword")}</Label>
            <Input
              id="oldPassword"
              name="oldPassword"
              type="password"
              required
              autoComplete="current-password"
              placeholder={t("changePassword.passwordPlaceholder")}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">{t("changePassword.newPassword")}</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder={t("changePassword.newPasswordPlaceholder")}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmNewPassword">{t("changePassword.confirmPassword")}</Label>
            <Input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder={t("changePassword.passwordPlaceholder")}
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
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5">
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              {loading ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

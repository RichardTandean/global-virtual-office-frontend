"use client"

import { logout } from "@/auth"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

export default function SignOutButton() {
  const t = useTranslations()

  return (
    <Button variant="outline" size="sm" onClick={() => logout()}>
      {t("nav.signOut")}
    </Button>
  )
}

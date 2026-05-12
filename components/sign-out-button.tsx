"use client"

import { logout } from "@/auth"
import { Button } from "@/components/ui/button"

export default function SignOutButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => logout()}>
      Keluar
    </Button>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { PageHeader } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { UserCog, Plus, Power, PowerOff, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { ROLE_LABEL_KEYS, type Role } from "@/components/shell/nav-config"

interface UserItem {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
}

interface Props {
  initialUsers: UserItem[]
  currentUserId: string
}

export function UserManagementClient({ initialUsers, currentUserId }: Props) {
  const t = useTranslations()
  const [users, setUsers] = useState<UserItem[]>(initialUsers)
  const [loading, setLoading] = useState(initialUsers.length === 0)
  const [addOpen, setAddOpen] = useState(false)
  const [toggleTarget, setToggleTarget] = useState<UserItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("Editor")

  useEffect(() => {
    if (initialUsers.length === 0) fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch {
      toast.error(t("userManagement.loadFailed"))
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error(t("userManagement.allFieldsRequired"))
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      })

      if (res.ok) {
        toast.success(t("userManagement.userAdded", { name: name.trim() }))
        setAddOpen(false)
        resetForm()
        await fetchUsers()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message || data.error || t("userManagement.addFailed"))
      }
    } catch {
      toast.error(t("userManagement.addFailed"))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle() {
    if (!toggleTarget) return

    const action = toggleTarget.isActive ? "deactivate" : "reactivate"

    setSubmitting(true)
    try {
      const res = await fetch(`/api/users/${toggleTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        const label = action === "deactivate"
          ? t("userManagement.deactivated", { name: toggleTarget.name })
          : t("userManagement.activated", { name: toggleTarget.name })
        toast.success(label)
        setToggleTarget(null)
        await fetchUsers()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message || data.error || t("userManagement.toggleFailed"))
      }
    } catch {
      toast.error(t("userManagement.toggleFailed"))
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setName("")
    setEmail("")
    setPassword("")
    setRole("Editor")
  }

  const roles: Role[] = ["Editor", "KoreaTeam", "Admin"]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("roles.Admin")}
        title={t("userManagement.title")}
        description={t("userManagement.description")}
        actions={
          <Button
            size="sm"
            onClick={() => {
              resetForm()
              setAddOpen(true)
            }}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            {t("userManagement.addUser")}
          </Button>
        }
      />

      <div className="rounded-md border border-line bg-surface overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={<UserCog />}
              title={t("userManagement.noUsers")}
              description={t("userManagement.noUsersDesc")}
            />
          </div>
        ) : (
          <table className="w-full text-[12px]">
            <thead className="bg-subtle/40 border-b border-line">
              <tr className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                <th className="text-left px-5 py-2.5 font-medium">{t("userManagement.name")}</th>
                <th className="text-left px-5 py-2.5 font-medium">{t("userManagement.email")}</th>
                <th className="text-left px-5 py-2.5 font-medium">{t("userManagement.role")}</th>
                <th className="text-left px-5 py-2.5 font-medium">{t("userManagement.status")}</th>
                <th className="text-right px-5 py-2.5 font-medium w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-subtle/30 transition-colors"
                >
                  <td className="px-5 py-3 text-ink font-medium">
                    <div className="space-y-0.5">
                      <p>{u.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-secondary font-mono text-[11px]">
                    {u.email}
                  </td>
                  <td className="px-5 py-3 text-ink-secondary">
                    <span className="inline-flex text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-xs border border-line">
                      {t(ROLE_LABEL_KEYS[u.role as Role] || u.role)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        u.isActive
                          ? "inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-xs bg-status-success/10 text-status-success border border-status-success/20"
                          : "inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-xs bg-status-danger/10 text-status-danger border border-status-danger/20"
                      }
                    >
                      {u.isActive ? t("userManagement.active") : t("userManagement.inactive")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.id === currentUserId ? (
                      <span className="text-[10px] text-ink-muted italic">
                        {t("common.you")}
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={
                          u.isActive
                            ? "h-7 w-7 text-ink-muted hover:text-status-danger hover:bg-status-danger/10"
                            : "h-7 w-7 text-ink-muted hover:text-status-success hover:bg-status-success/10"
                        }
                        onClick={() => setToggleTarget(u)}
                        aria-label={
                          u.isActive
                            ? t("userManagement.deactivate")
                            : t("userManagement.activate")
                        }
                      >
                        {u.isActive ? (
                          <PowerOff className="size-3.5" />
                        ) : (
                          <Power className="size-3.5" />
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <UserCog className="size-4" />
              {t("userManagement.addDialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("userManagement.addDialogDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">{t("userManagement.nameLabel")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("userManagement.namePlaceholder")}
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("userManagement.emailLabel")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("userManagement.emailPlaceholder")}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("userManagement.passwordLabel")}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("userManagement.passwordPlaceholder")}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("userManagement.roleLabel")}</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as Role)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(ROLE_LABEL_KEYS[r])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreate}
              disabled={submitting}
              className="w-full gap-1.5"
            >
              <Plus className="size-3.5" />
              {submitting ? t("common.saving") : t("userManagement.addUser")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={toggleTarget !== null}
        onOpenChange={(open) => {
          if (!open) setToggleTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <AlertCircle className="size-4 text-ink-muted" />
              {toggleTarget?.isActive
                ? t("userManagement.deactivateTitle")
                : t("userManagement.activateTitle")}
            </DialogTitle>
            <DialogDescription>
              {toggleTarget?.isActive
                ? t("userManagement.deactivateDesc", { name: toggleTarget?.name ?? "" })
                : t("userManagement.activateDesc", { name: toggleTarget?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setToggleTarget(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant={toggleTarget?.isActive ? "destructive" : "default"}
              className="flex-1 gap-1.5"
              onClick={handleToggle}
              disabled={submitting}
            >
              {toggleTarget?.isActive ? (
                <PowerOff className="size-3.5" />
              ) : (
                <Power className="size-3.5" />
              )}
              {submitting
                ? toggleTarget?.isActive
                  ? t("userManagement.deactivating")
                  : t("userManagement.activating")
                : toggleTarget?.isActive
                  ? t("userManagement.deactivate")
                  : t("userManagement.activate")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

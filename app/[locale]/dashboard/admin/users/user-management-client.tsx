"use client"

import { useState, useEffect } from "react"
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
import { roleLabel, type Role } from "@/components/shell/nav-config"

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
  const [users, setUsers] = useState<UserItem[]>(initialUsers)
  const [loading, setLoading] = useState(initialUsers.length === 0)
  const [addOpen, setAddOpen] = useState(false)
  const [toggleTarget, setToggleTarget] = useState<UserItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Add form state
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
      toast.error("Gagal memuat data user")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Semua field wajib diisi")
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
        toast.success(`User "${name.trim()}" berhasil ditambahkan`)
        setAddOpen(false)
        resetForm()
        await fetchUsers()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message || data.error || "Gagal menambahkan user")
      }
    } catch {
      toast.error("Gagal menambahkan user")
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
        const label = action === "deactivate" ? "dinonaktifkan" : "diaktifkan kembali"
        toast.success(`User "${toggleTarget.name}" berhasil ${label}`)
        setToggleTarget(null)
        await fetchUsers()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message || data.error || "Gagal mengubah status user")
      }
    } catch {
      toast.error("Gagal mengubah status user")
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
        eyebrow="Admin"
        title="User Management"
        description="Tambah, lihat, dan kelola user platform."
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
            Tambah User
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
              title="Belum ada user"
              description="Tambah user pertama untuk memulai."
            />
          </div>
        ) : (
          <table className="w-full text-[12px]">
            <thead className="bg-subtle/40 border-b border-line">
              <tr className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                <th className="text-left px-5 py-2.5 font-medium">Name</th>
                <th className="text-left px-5 py-2.5 font-medium">Email</th>
                <th className="text-left px-5 py-2.5 font-medium">Role</th>
                <th className="text-left px-5 py-2.5 font-medium">Status</th>
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
                      {roleLabel[u.role as Role] || u.role}
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
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.id === currentUserId ? (
                      <span className="text-[10px] text-ink-muted italic">
                        You
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
                            ? `Nonaktifkan ${u.name}`
                            : `Aktifkan ${u.name}`
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
              Tambah User Baru
            </DialogTitle>
            <DialogDescription>
              Buat akun untuk user baru dengan role yang sesuai.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">Nama</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@lejel.com"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 karakter"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Role</Label>
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
                      {roleLabel[r]}
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
              {submitting ? "Menyimpan..." : "Tambah User"}
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
              {toggleTarget?.isActive ? "Nonaktifkan User" : "Aktifkan User"}
            </DialogTitle>
            <DialogDescription>
              {toggleTarget?.isActive
                ? `Apakah kamu yakin ingin menonaktifkan user ${toggleTarget?.name}? User tidak akan bisa login sampai diaktifkan kembali.`
                : `Apakah kamu yakin ingin mengaktifkan kembali user ${toggleTarget?.name}? User akan bisa login seperti biasa.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setToggleTarget(null)}
            >
              Batal
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
                  ? "Menonaktifkan..."
                  : "Mengaktifkan..."
                : toggleTarget?.isActive
                  ? "Nonaktifkan"
                  : "Aktifkan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

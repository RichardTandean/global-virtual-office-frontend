"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Video, Lock, Users } from "lucide-react"

interface UserOption {
  id: string
  name: string
}

interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
  users: UserOption[]
  currentUserId: string
}

export default function CreateRoomDialog({ open, onOpenChange, onCreated, users, currentUserId }: CreateRoomDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"breakout" | "private">("breakout")
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)

    try {
      const res = await fetch("/api/call-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          inviteUserIds: type === "private" ? Array.from(selectedUsers) : undefined,
        }),
      })
      if (res.ok) {
        toast.success("Room dibuat")
        onOpenChange(false)
        setName("")
        setSelectedUsers(new Set())
        onCreated()
      }
    } catch {
      toast.error("Gagal membuat room")
    } finally {
      setLoading(false)
    }
  }

  const availableUsers = users.filter((u) => u.id !== currentUserId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Buat Call Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Nama Room</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Review Video Baru"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={type === "breakout" ? "default" : "outline"}
              size="sm"
              onClick={() => setType("breakout")}
              className="flex-1 gap-1"
            >
              <Users className="h-3 w-3" />
              Breakout
            </Button>
            <Button
              variant={type === "private" ? "default" : "outline"}
              size="sm"
              onClick={() => setType("private")}
              className="flex-1 gap-1"
            >
              <Lock className="h-3 w-3" />
              Private
            </Button>
          </div>

          {type === "private" && availableUsers.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">Undang peserta</Label>
              <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                {availableUsers.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 cursor-pointer text-xs hover:bg-muted rounded px-2 py-1">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(u.id)}
                      onChange={(e) => {
                        const next = new Set(selectedUsers)
                        if (e.target.checked) next.add(u.id)
                        else next.delete(u.id)
                        setSelectedUsers(next)
                      }}
                      className="rounded"
                    />
                    {u.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            {type === "breakout"
              ? "Semua orang bisa join room ini."
              : "Hanya kamu dan yang diundang bisa join."}
          </p>

          <Button onClick={handleCreate} disabled={loading || !name.trim()} className="w-full gap-1">
            <Plus className="h-3 w-3" />
            Buat Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Plus, Video, Lock, Users, Phone } from "lucide-react"

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

type RoomType = "breakout" | "private" | "direct"

export default function CreateRoomDialog({ open, onOpenChange, onCreated, users, currentUserId }: CreateRoomDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<RoomType>("breakout")
  const [isPublic, setIsPublic] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [selectedDirectUserId, setSelectedDirectUserId] = useState("")
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setName("")
    setType("breakout")
    setIsPublic(true)
    setSelectedUsers(new Set())
    setSelectedDirectUserId("")
  }

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)

    try {
      const body: any = {
        name: name.trim(),
        type,
      }

      if (type === "breakout") {
        body.isPublic = isPublic
        if (!isPublic && selectedUsers.size > 0) {
          body.inviteUserIds = Array.from(selectedUsers)
        }
      }

      if (type === "private" && selectedUsers.size > 0) {
        body.inviteUserIds = Array.from(selectedUsers)
      }

      if (type === "direct") {
        if (!selectedDirectUserId) return
        body.inviteUserIds = [selectedDirectUserId]
        const invitee = users.find((u) => u.id === selectedDirectUserId)
        body.name = `${(users.find((u) => u.id === currentUserId)?.name || "You")} & ${invitee?.name || "User"}`
      }

      const res = await fetch("/api/call-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success("Room dibuat")
        onOpenChange(false)
        resetForm()
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
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm() }}>
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
              onClick={() => { setType("breakout"); setIsPublic(true); setSelectedDirectUserId("") }}
              className="flex-1 gap-1"
            >
              <Users className="h-3 w-3" />
              Breakout
            </Button>
            <Button
              variant={type === "private" ? "default" : "outline"}
              size="sm"
              onClick={() => { setType("private"); setSelectedDirectUserId("") }}
              className="flex-1 gap-1"
            >
              <Lock className="h-3 w-3" />
              Private
            </Button>
            <Button
              variant={type === "direct" ? "default" : "outline"}
              size="sm"
              onClick={() => setType("direct")}
              className="flex-1 gap-1"
            >
              <Phone className="h-3 w-3" />
              1-on-1
            </Button>
          </div>

          {type === "breakout" && (
            <div className="flex gap-2">
              <Button variant={isPublic ? "default" : "outline"} size="sm" className="flex-1"
                onClick={() => setIsPublic(true)}>
                Open
              </Button>
              <Button variant={!isPublic ? "default" : "outline"} size="sm" className="flex-1"
                onClick={() => setIsPublic(false)}>
                Private
              </Button>
            </div>
          )}

          {type === "direct" && availableUsers.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">Pilih user</Label>
              <ScrollArea className="max-h-32 border rounded-md">
                <div className="p-1 space-y-0.5">
                  {availableUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedDirectUserId(u.id)}
                      className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors ${
                        selectedDirectUserId === u.id ? "bg-muted font-medium" : ""
                      }`}
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {((type === "private") || (type === "breakout" && !isPublic)) && availableUsers.length > 0 && (
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
            {type === "breakout" && isPublic ? "Semua orang bisa lihat dan join room ini."
              : type === "direct" ? "Room private — hanya kalian berdua yang bisa join."
              : "Hanya yang diundang bisa join."}
          </p>

          <Button onClick={handleCreate}
            disabled={loading || !name.trim() || (type === "direct" && !selectedDirectUserId)}
            className="w-full gap-1">
            <Plus className="h-3 w-3" />
            Buat Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

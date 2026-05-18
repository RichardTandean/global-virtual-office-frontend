"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { PageHeader } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import JitsiRoom from "@/components/calls/jitsi-room"
import { Phone, Users, Lock, Plus, Trash2, Copy, Megaphone, UserPlus, MessageCircle } from "lucide-react"
import { toast } from "sonner"

interface CallRoom {
  id: string
  name: string
  type: "office" | "breakout" | "private" | "meeting"
  roomName: string
  createdBy: string
  isActive: boolean
  creator: { id: string; name: string }
  _count: { participants: number }
  participants?: Array<{ user: { id: string; name: string } }>
  invites?: Array<{ user: { id: string; name: string } }>
}

function useCookieUser() {
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null)
  useEffect(() => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)user=([^;]*)/)
      if (match) {
        const u = JSON.parse(decodeURIComponent(match[1]))
        setUser({ id: u.id, name: u.name, role: u.role })
      }
    } catch {}
  }, [])
  return user
}

export default function CallsPage() {
  const t = useTranslations()
  const [rooms, setRooms] = useState<CallRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [activeRoom, setActiveRoom] = useState<CallRoom | null>(null)
  const user = useCookieUser()

  const canCreateMeeting = user?.role === "Admin" || user?.role === "KoreaTeam"

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/call-rooms")
      if (res.ok) setRooms(await res.json())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRooms()
    const interval = setInterval(fetchRooms, 10000)
    return () => clearInterval(interval)
  }, [fetchRooms])

  async function handleDelete(id: string) {
    const res = await fetch(`/api/call-rooms/${id}`, { method: "DELETE" })
    if (res.ok) { fetchRooms(); toast.success(t("calls.roomDeleted")) }
  }

  async function handleCopyLink(room: CallRoom) {
    await navigator.clipboard.writeText(`https://meet.richardtandean.my.id/${room.roomName}`)
    toast.success(t("calls.linkCopied"))
  }

  if (activeRoom) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex items-center gap-3 px-4 py-2 border-b bg-muted/30">
          <span className="text-sm font-medium truncate">
            {activeRoom.type === "office" ? "🟢 Office" :
             activeRoom.type === "meeting" ? `📢 ${t("calls.fullMeeting")}` : `📞 ${activeRoom.name}`}
          </span>
          <button onClick={() => setActiveRoom(null)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground underline">
            {t("calls.closeCall")}
          </button>
        </div>
        <div className="flex-1">
          <JitsiRoom roomName={activeRoom.roomName} displayName={user?.name || t("calls.userFallback")}
            roomId={activeRoom.id} onLeft={() => { setActiveRoom(null); fetchRooms() }} />
        </div>
      </div>
    )
  }

  const office = rooms.find((r) => r.type === "office")
  const meetings = rooms.filter((r) => r.type === "meeting")
  const breakoutRooms = rooms.filter((r) => r.type === "breakout")
  const privateRooms = rooms.filter((r) => r.type === "private")

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={t("calls.title")} title={t("nav.calls")}
        description={t("calls.desc")} />

      {/* Section 1: Full Meeting */}
      <section className="rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Megaphone className="size-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{t("calls.fullMeeting")}</h3>
              <p className="text-[11px] text-muted-foreground">{t("calls.fullMeetingDesc")}</p>
            </div>
          </div>
          {canCreateMeeting && (
            <CreateMeetingDialog onCreated={fetchRooms} user={user!} />
          )}
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : meetings.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {canCreateMeeting
              ? t("calls.noMeeting")
              : t("calls.noMeetingScheduled")}
          </div>
        ) : (
          <div className="divide-y divide-line">
            {meetings.map((r) => (
              <RoomRow key={r.id} room={r} userId={user?.id} onJoin={setActiveRoom}
                onDelete={handleDelete} onCopy={handleCopyLink} showInvolve />
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Breakout Rooms */}
      <section className="rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="size-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{t("calls.breakoutRooms")}</h3>
              <p className="text-[11px] text-muted-foreground">{t("calls.breakoutRoomsDesc")}</p>
            </div>
          </div>
          <CreateRoomDialog type="breakout" onCreated={fetchRooms} user={user!} />
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : breakoutRooms.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {t("calls.noBreakout")}
          </div>
        ) : (
          <div className="divide-y divide-line">
            {breakoutRooms.map((r) => (
              <RoomRow key={r.id} room={r} userId={user?.id} onJoin={setActiveRoom}
                onDelete={handleDelete} onCopy={handleCopyLink} />
            ))}
          </div>
        )}
      </section>

      {/* Section 3: Direct Calls */}
      <section className="rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Phone className="size-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{t("calls.directCalls")}</h3>
              <p className="text-[11px] text-muted-foreground">{t("calls.directCallsDesc")}</p>
            </div>
          </div>
          <DirectCallDialog onCreated={fetchRooms} user={user!} />
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : privateRooms.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {t("calls.noDirectCall")}
          </div>
        ) : (
          <div className="divide-y divide-line">
            {privateRooms.map((r) => (
              <RoomRow key={r.id} room={r} userId={user?.id} onJoin={setActiveRoom}
                onDelete={handleDelete} onCopy={handleCopyLink} />
            ))}
          </div>
        )}
      </section>

      {/* Office Call */}
      {office && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="size-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">{t("calls.officeCall")}</span>
            {office._count.participants > 0 && (
              <Badge variant="secondary" className="text-[10px]">{t("calls.inRoom", { n: office._count.participants })}</Badge>
            )}
          </div>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setActiveRoom(office)}>
            <Phone className="h-3 w-3" /> {t("calls.join")}
          </Button>
        </div>
      )}
    </div>
  )
}

/* ── Room Row ── */
function RoomRow({
  room, userId, onJoin, onDelete, onCopy, showInvolve,
}: {
  room: CallRoom; userId?: string; onJoin: (r: CallRoom) => void
  onDelete: (id: string) => void; onCopy: (r: CallRoom) => void; showInvolve?: boolean
}) {
  const cs = useTranslations("calls")
  const typeIcon = room.type === "meeting" ? <Megaphone className="h-4 w-4 text-purple-500 shrink-0" />
    : room.type === "private" ? <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
      : <Users className="h-4 w-4 text-muted-foreground shrink-0" />

  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-elevated transition-colors">
      {typeIcon}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate">{room.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {cs("byUser", { name: room.creator.name })}
          {room._count.participants > 0 && ` · ${cs("participants", { n: room._count.participants })}`}
          {room.invites && room.invites.length > 0 && ` · ${cs("invited", { n: room.invites.length })}`}
        </p>
        {showInvolve && room.invites && (
          <p className="text-[10px] text-purple-500 mt-0.5">
            {cs("invitingAll")}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(room)}>
          <Copy className="h-3 w-3" />
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onJoin(room)}>
          <Phone className="h-3 w-3" /> {cs("join")}
        </Button>
        {room.createdBy === userId && room.type !== "office" && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(room.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

/* ── Create Meeting Dialog ── */
function CreateMeetingDialog({ onCreated, user }: { onCreated: () => void; user: { id: string; name: string } }) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/call-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type: "meeting" }),
      })
      if (res.ok) {
        toast.success(t("calls.meetingCreated"))
        onCreated()
        setOpen(false)
        setName("")
      }
    } catch { toast.error(t("calls.meetingFailed")) }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Megaphone className="size-4 text-purple-600" />
            {t("calls.createMeeting")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">{t("calls.meetingName")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)}
              placeholder={t("calls.meetingPlaceholder")} autoFocus />
          </div>
          <div className="rounded-lg bg-purple-50 dark:bg-purple-950 p-3 text-xs text-purple-700 dark:text-purple-300">
            {t("calls.meetingInfo")}
          </div>
          <Button onClick={handleCreate} disabled={loading || !name.trim()} className="w-full gap-1">
            <Megaphone className="h-3 w-3" /> {t("calls.createBtn")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ── Create Room Dialog (Breakout) ── */
function CreateRoomDialog({ type, onCreated, user }: { type: "breakout"; onCreated: () => void; user: { id: string; name: string } }) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
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
          type: isPrivate ? "private" : "breakout",
        }),
      })
      if (res.ok) {
        toast.success(t("calls.roomCreated", { type: isPrivate ? t("calls.private") : t("calls.open") }))
        onCreated()
        setOpen(false)
        setName("")
      }
    } catch { toast.error(t("calls.roomFailed")) }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" className="gap-1" onClick={() => setOpen(true)}>
        <Plus className="h-3 w-3" /> {t("calls.createRoom")}
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Users className="size-4 text-blue-600" />
            {t("calls.createBreakout")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">{t("calls.roomName")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)}
              placeholder={t("calls.roomPlaceholder")} autoFocus />
          </div>
          <div className="flex gap-2">
            <Button variant={!isPrivate ? "default" : "outline"} size="sm" className="flex-1 gap-1"
              onClick={() => setIsPrivate(false)}>
              <Users className="h-3 w-3" /> {t("calls.open")}
            </Button>
            <Button variant={isPrivate ? "default" : "outline"} size="sm" className="flex-1 gap-1"
              onClick={() => setIsPrivate(true)}>
              <Lock className="h-3 w-3" /> {t("calls.private")}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isPrivate
              ? t("calls.privateInfo")
              : t("calls.openInfo")}
          </p>
          <Button onClick={handleCreate} disabled={loading || !name.trim()} className="w-full gap-1">
            <Plus className="h-3 w-3" />{" "}
            {isPrivate ? t("calls.createRoom") : t("calls.createBreakout")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ── Direct Call Dialog ── */
function DirectCallDialog({ onCreated, user }: { onCreated: () => void; user: { id: string; name: string } }) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
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
          type: "private",
        }),
      })
      if (res.ok) {
        toast.success(t("calls.directCallCreated"))
        onCreated()
        setOpen(false)
        setName("")
      }
    } catch { toast.error(t("calls.callFailed")) }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" className="gap-1" onClick={() => setOpen(true)}>
        <UserPlus className="h-3 w-3" /> {t("calls.createRoom")}
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Phone className="size-4 text-amber-600" />
            {t("calls.directCall")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">{t("calls.callName")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)}
              placeholder={t("calls.callPlaceholder")} autoFocus />
          </div>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-3 text-xs text-amber-700 dark:text-amber-300">
            {t("calls.privateRoomInfo")}
          </div>
          <Button onClick={handleCreate} disabled={loading || !name.trim()} className="w-full gap-1">
            <Phone className="h-3 w-3" /> {t("calls.createCallBtn")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

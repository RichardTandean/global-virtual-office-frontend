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
import JitsiRoom from "@/components/calls/jitsi-room"
import { Phone, Users, Lock, Plus, Trash2, Copy, Megaphone, UserPlus, MessageCircle, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

interface UserItem {
  id: string
  name: string
}

interface CallRoom {
  id: string
  name: string
  type: "office" | "breakout" | "private" | "meeting" | "direct"
  roomName: string
  createdBy: string
  isActive: boolean
  isPublic: boolean
  scheduledAt: string | null
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

function parseJwt(token: string) {
  try {
    const base64 = token.split(".")[1]
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export default function CallsPage() {
  const t = useTranslations()
  const [rooms, setRooms] = useState<CallRoom[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
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

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users")
      if (res.ok) setUsers(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    fetchRooms()
    fetchUsers()
    const interval = setInterval(fetchRooms, 10000)
    return () => clearInterval(interval)
  }, [fetchRooms, fetchUsers])

  async function handleDelete(id: string) {
    const res = await fetch(`/api/call-rooms/${id}`, { method: "DELETE" })
    if (res.ok) { fetchRooms(); toast.success(t("calls.roomDeleted")) }
  }

  async function handleCopyLink(room: CallRoom) {
    await navigator.clipboard.writeText(`https://meet.richardtandean.my.id/${room.roomName}`)
    toast.success(t("calls.linkCopied"))
  }

  async function handleInvite(roomId: string, userIds: string[]) {
    try {
      const res = await fetch(`/api/call-rooms/${roomId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      })
      if (res.ok) {
        toast.success(t("calls.inviteSent"))
        fetchRooms()
      }
    } catch { toast.error(t("calls.callFailed")) }
  }

  if (activeRoom) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex items-center gap-3 px-4 py-2 border-b bg-muted/30">
          <span className="text-sm font-medium truncate">
            {activeRoom.type === "office" ? "🟢 Office" :
             activeRoom.type === "meeting" ? `📢 ${t("calls.fullMeeting")}` :
             activeRoom.type === "direct" ? `📞 ${activeRoom.name}` :
             `📞 ${activeRoom.name}`}
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
  const directRooms = rooms.filter((r) => r.type === "direct")

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
            <CreateMeetingDialog onCreated={fetchRooms} user={user!} users={users} />
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
                onDelete={handleDelete} onCopy={handleCopyLink} showInvolve
                onInvite={handleInvite} users={users} currentUserId={user?.id} />
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
          <CreateBreakoutDialog onCreated={fetchRooms} user={user!} users={users} />
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
                onDelete={handleDelete} onCopy={handleCopyLink}
                onInvite={handleInvite} users={users} currentUserId={user?.id} />
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
          <DirectCallDialog onCreated={fetchRooms} user={user!} users={users} />
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : directRooms.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {t("calls.noDirectCall")}
          </div>
        ) : (
          <div className="divide-y divide-line">
            {directRooms.map((r) => (
              <RoomRow key={r.id} room={r} userId={user?.id} onJoin={setActiveRoom}
                onDelete={handleDelete} onCopy={handleCopyLink}
                onInvite={handleInvite} users={users} currentUserId={user?.id} />
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
  onInvite, users, currentUserId,
}: {
  room: CallRoom; userId?: string; onJoin: (r: CallRoom) => void
  onDelete: (id: string) => void; onCopy: (r: CallRoom) => void; showInvolve?: boolean
  onInvite?: (roomId: string, userIds: string[]) => void
  users?: UserItem[]; currentUserId?: string
}) {
  const cs = useTranslations("calls")
  const [showInvitePicker, setShowInvitePicker] = useState(false)
  const [selectedInvites, setSelectedInvites] = useState<Set<string>>(new Set())

  const typeIcon = room.type === "meeting" ? <Megaphone className="h-4 w-4 text-purple-500 shrink-0" />
    : room.type === "direct" ? <Phone className="h-4 w-4 text-amber-500 shrink-0" />
    : room.type === "private" ? <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
    : <Users className="h-4 w-4 text-muted-foreground shrink-0" />

  const isOwner = room.createdBy === userId
  const canInvite = isOwner && (room.type === "meeting" || room.type === "breakout" || room.type === "direct")

  const availableToInvite = (users || [])
    .filter((u) => !room.invites?.some((i) => i.user.id === u.id) && u.id !== room.createdBy)

  const scheduledTime = room.scheduledAt
    ? format(new Date(room.scheduledAt), "dd MMM yyyy, HH:mm", { locale: idLocale })
    : null

  const directPartner = room.type === "direct" && room.invites?.[0]?.user

  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-elevated transition-colors">
      {typeIcon}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium truncate">
            {room.type === "direct" && directPartner
              ? cs("youAnd", { name: directPartner.name })
              : room.name}
          </p>
          {room.type === "breakout" && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
              {room.isPublic ? cs("open") : cs("private")}
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {cs("byUser", { name: room.creator.name })}
          {room._count.participants > 0 && ` · ${cs("participants", { n: room._count.participants })}`}
          {room.invites && room.invites.length > 0 && ` · ${cs("invited", { n: room.invites.length })}`}
        </p>
        {scheduledTime && (
          <p className="text-[10px] text-purple-500 mt-0.5">
            {cs("scheduledFor")}: {scheduledTime}
          </p>
        )}
        {showInvolve && room.invites && (
          <p className="text-[10px] text-purple-500 mt-0.5">
            {room.invites.length === 0 ? cs("invitingAll") : cs("invitingSelected", { n: room.invites.length })}
          </p>
        )}
        {showInvitePicker && availableToInvite.length > 0 && (
          <div className="mt-2 p-2 border rounded-md bg-elevated max-h-32 overflow-y-auto space-y-1">
            {availableToInvite.map((u) => (
              <label key={u.id} className="flex items-center gap-2 cursor-pointer text-[11px] hover:bg-muted rounded px-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedInvites.has(u.id)}
                  onChange={(e) => {
                    const next = new Set(selectedInvites)
                    if (e.target.checked) next.add(u.id)
                    else next.delete(u.id)
                    setSelectedInvites(next)
                  }}
                  className="rounded"
                />
                {u.name}
              </label>
            ))}
            <Button
              size="sm"
              className="w-full h-6 text-[10px]"
              disabled={selectedInvites.size === 0}
              onClick={() => {
                onInvite?.(room.id, Array.from(selectedInvites))
                setSelectedInvites(new Set())
                setShowInvitePicker(false)
              }}
            >
              {cs("inviteMore")}
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(room)}>
          <Copy className="h-3 w-3" />
        </Button>
        {canInvite && (
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => setShowInvitePicker(!showInvitePicker)}>
            <UserPlus className="h-3 w-3" />
          </Button>
        )}
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onJoin(room)}>
          <Phone className="h-3 w-3" /> {cs("join")}
        </Button>
        {isOwner && room.type !== "office" && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(room.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

/* ── Create Meeting Dialog ── */
function CreateMeetingDialog({ onCreated, user, users }: { onCreated: () => void; user: { id: string; name: string }; users: UserItem[] }) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [inviteAll, setInviteAll] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  function resetForm() {
    setName("")
    setInviteAll(true)
    setSelectedUsers(new Set())
    setScheduleMode("now")
    setScheduledDate("")
    setScheduledTime("")
  }

  async function handleCreate() {
    if (!name.trim()) return
    if (scheduleMode === "later" && (!scheduledDate || !scheduledTime)) return
    setLoading(true)
    try {
      const body: any = { name: name.trim(), type: "meeting" }
      if (!inviteAll && selectedUsers.size > 0) {
        body.inviteUserIds = Array.from(selectedUsers)
      }
      if (scheduleMode === "later") {
        body.scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
      }
      const res = await fetch("/api/call-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(scheduleMode === "later" ? t("calls.meetingScheduled") : t("calls.meetingCreated"))
        onCreated()
        setOpen(false)
        resetForm()
      }
    } catch { toast.error(t("calls.meetingFailed")) }
    finally { setLoading(false) }
  }

  const availableUsers = users.filter((u) => u.id !== user.id)

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <Button size="sm" variant="outline" className="gap-1" onClick={() => setOpen(true)}>
        <Plus className="h-3 w-3" /> {t("calls.createMeeting")}
      </Button>
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

          <div className="space-y-1">
            <Label className="text-xs">{t("calls.scheduleMeeting")}</Label>
            <div className="flex gap-2">
              <Button variant={scheduleMode === "now" ? "default" : "outline"} size="sm" className="flex-1"
                onClick={() => setScheduleMode("now")}>
                {t("calls.scheduleNow")}
              </Button>
              <Button variant={scheduleMode === "later" ? "default" : "outline"} size="sm" className="flex-1"
                onClick={() => setScheduleMode("later")}>
                {t("calls.scheduleLater")}
              </Button>
            </div>
          </div>

          {scheduleMode === "later" && (
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">{t("calls.schedulePlaceholder")}</Label>
                <input type="date" className="w-full rounded-md border bg-transparent px-3 py-1.5 text-xs"
                  value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
              </div>
              <div className="w-24 space-y-1">
                <Label className="text-xs">&nbsp;</Label>
                <input type="time" className="w-full rounded-md border bg-transparent px-3 py-1.5 text-xs"
                  value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs">{t("calls.selectInvitees")}</Label>
            <div className="flex gap-2">
              <Button variant={inviteAll ? "default" : "outline"} size="sm" className="flex-1"
                onClick={() => setInviteAll(true)}>
                {t("calls.allUsers")}
              </Button>
              <Button variant={!inviteAll ? "default" : "outline"} size="sm" className="flex-1"
                onClick={() => setInviteAll(false)}>
                {t("calls.specificUsers")}
              </Button>
            </div>
          </div>

          {!inviteAll && availableUsers.length > 0 && (
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
          )}

          <p className="text-[10px] text-muted-foreground">
            {inviteAll ? t("calls.meetingInfo") : t("calls.meetingSelectInfo")}
          </p>

          <Button onClick={handleCreate} disabled={loading || !name.trim() ||
            (scheduleMode === "later" && (!scheduledDate || !scheduledTime))} className="w-full gap-1">
            <Megaphone className="h-3 w-3" /> {t("calls.createBtn")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ── Create Breakout Dialog ── */
function CreateBreakoutDialog({ onCreated, user, users }: { onCreated: () => void; user: { id: string; name: string }; users: UserItem[] }) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setName("")
    setIsPublic(true)
    setSelectedUsers(new Set())
  }

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    try {
      const body: any = {
        name: name.trim(),
        type: "breakout",
        isPublic,
      }
      if (!isPublic && selectedUsers.size > 0) {
        body.inviteUserIds = Array.from(selectedUsers)
      }
      const res = await fetch("/api/call-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(t("calls.roomCreated", { type: isPublic ? t("calls.open") : t("calls.private") }))
        onCreated()
        setOpen(false)
        resetForm()
      }
    } catch { toast.error(t("calls.roomFailed")) }
    finally { setLoading(false) }
  }

  const availableUsers = users.filter((u) => u.id !== user.id)

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
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
            <Button variant={isPublic ? "default" : "outline"} size="sm" className="flex-1 gap-1"
              onClick={() => setIsPublic(true)}>
              <Users className="h-3 w-3" /> {t("calls.open")}
            </Button>
            <Button variant={!isPublic ? "default" : "outline"} size="sm" className="flex-1 gap-1"
              onClick={() => setIsPublic(false)}>
              <Lock className="h-3 w-3" /> {t("calls.private")}
            </Button>
          </div>
          {!isPublic && availableUsers.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">{t("calls.selectInvitees")}</Label>
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
            {isPublic ? t("calls.openInfo") : t("calls.privateInfo")}
          </p>
          <Button onClick={handleCreate} disabled={loading || !name.trim()} className="w-full gap-1">
            <Plus className="h-3 w-3" />{" "}
            {isPublic ? t("calls.createBreakout") : t("calls.createRoom")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ── Direct Call Dialog ── */
function DirectCallDialog({ onCreated, user, users }: { onCreated: () => void; user: { id: string; name: string }; users: UserItem[] }) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [loading, setLoading] = useState(false)

  const availableUsers = users.filter((u) => u.id !== user.id)

  function resetForm() { setSelectedUserId("") }

  async function handleCreate() {
    if (!selectedUserId) return
    setLoading(true)
    const invitee = availableUsers.find((u) => u.id === selectedUserId)
    try {
      const res = await fetch("/api/call-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${user.name} & ${invitee?.name || "User"}`,
          type: "direct",
          inviteUserIds: [selectedUserId],
        }),
      })
      if (res.ok) {
        toast.success(t("calls.directCallCreated"))
        onCreated()
        setOpen(false)
        resetForm()
      }
    } catch { toast.error(t("calls.callFailed")) }
    finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
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
            <Label className="text-xs">{t("calls.pickUser")}</Label>
            <ScrollArea className="max-h-48 border rounded-md">
              <div className="p-1 space-y-0.5">
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`w-full text-left text-sm px-3 py-2 rounded hover:bg-muted transition-colors ${
                      selectedUserId === u.id ? "bg-muted font-medium" : ""
                    }`}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-3 text-xs text-amber-700 dark:text-amber-300">
            {t("calls.privateRoomInfo")}
          </div>
          <Button onClick={handleCreate} disabled={loading || !selectedUserId} className="w-full gap-1">
            <Phone className="h-3 w-3" /> {t("calls.createCallBtn")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

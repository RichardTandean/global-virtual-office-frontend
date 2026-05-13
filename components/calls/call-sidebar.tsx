"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Phone, PhoneOff, Plus, Lock, Users, Trash2, Eye } from "lucide-react"
import CreateRoomDialog from "./create-room-dialog"

interface CallRoom {
  id: string
  name: string
  type: "office" | "breakout" | "private"
  roomName: string
  createdBy: string
  isActive: boolean
  creator: { id: string; name: string }
  _count: { participants: number }
  participants?: Array<{ user: { id: string; name: string } }>
  invites?: Array<{ user: { id: string; name: string } }>
}

interface CallSidebarProps {
  currentUser: { id: string; name: string; role: string }
  users: Array<{ id: string; name: string }>
  onJoinRoom: (room: CallRoom) => void
  activeRoomId?: string
}

export default function CallSidebar({ currentUser, users, onJoinRoom, activeRoomId }: CallSidebarProps) {
  const [rooms, setRooms] = useState<CallRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/call-rooms")
      if (res.ok) {
        const data = await res.json()
        setRooms(data)
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRooms()
    const interval = setInterval(fetchRooms, 15000)
    return () => clearInterval(interval)
  }, [fetchRooms])

  async function handleDelete(roomId: string) {
    try {
      const res = await fetch(`/api/call-rooms/${roomId}`, { method: "DELETE" })
      if (res.ok) fetchRooms()
    } catch {}
  }

  const office = rooms.find((r) => r.type === "office")
  const breakoutRooms = rooms.filter((r) => r.type === "breakout")
  const privateRooms = rooms.filter((r) => r.type === "private")
  const activeCount = rooms.reduce((sum, r) => sum + (r._count?.participants || 0), 0)

  return (
    <>
      <div className={`border-r bg-card transition-all duration-200 ${collapsed ? "w-10" : "w-64"} flex flex-col h-full shrink-0 relative`}>
        <Tooltip>
          <TooltipTrigger
            className="h-10 w-10 rounded-none bg-primary text-primary-foreground inline-flex items-center justify-center hover:bg-primary/90 cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Phone className="h-4 w-4" />
            {collapsed && activeCount > 0 && (
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-green-500 text-[8px] font-bold text-white flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent side="right">Calls {activeCount > 0 ? `(${activeCount})` : ""}</TooltipContent>
        </Tooltip>

        {collapsed && (
          <div
            className="flex-1 flex items-center justify-center cursor-pointer"
            onClick={() => setCollapsed(false)}
          >
            <span className="text-[9px] text-muted-foreground font-medium tracking-[0.3em] rotate-180 [writing-mode:vertical-lr]">
              CALLS
            </span>
          </div>
        )}

        {!collapsed && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Calls</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreate(true)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-3 space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {/* Office */}
                  {office && (
                    <Button
                      variant={activeRoomId === office.id ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-2 h-8 text-xs"
                      onClick={() => onJoinRoom(office)}
                    >
                      <div className="size-1.5 rounded-full bg-green-500" />
                      {office.name}
                      {office._count.participants > 0 && (
                        <Badge variant="secondary" className="ml-auto text-[9px] px-1 h-4">{office._count.participants}</Badge>
                      )}
                    </Button>
                  )}

                  {/* Breakout rooms */}
                  {breakoutRooms.length > 0 && (
                    <>
                      <Separator className="my-1" />
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground px-2 py-1">Rooms</p>
                      {breakoutRooms.map((r) => (
                        <div key={r.id} className="flex items-center gap-1">
                          <Button
                            variant={activeRoomId === r.id ? "secondary" : "ghost"}
                            size="sm"
                            className="flex-1 justify-start gap-2 h-8 text-xs"
                            onClick={() => onJoinRoom(r)}
                          >
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">{r.name}</span>
                          </Button>
                          {r.createdBy === currentUser.id && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleDelete(r.id)}>
                              <Trash2 className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </>
                  )}

                  {/* Private rooms */}
                  {privateRooms.length > 0 && (
                    <>
                      <Separator className="my-1" />
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground px-2 py-1">Private</p>
                      {privateRooms.map((r) => (
                        <div key={r.id} className="flex items-center gap-1">
                          <Button
                            variant={activeRoomId === r.id ? "secondary" : "ghost"}
                            size="sm"
                            className="flex-1 justify-start gap-2 h-8 text-xs"
                            onClick={() => onJoinRoom(r)}
                          >
                            <Lock className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">{r.name}</span>
                          </Button>
                          {r.createdBy === currentUser.id && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleDelete(r.id)}>
                              <Trash2 className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      <CreateRoomDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={fetchRooms}
        users={users}
        currentUserId={currentUser.id}
      />
    </>
  )
}

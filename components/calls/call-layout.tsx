"use client"

import { useState, useEffect, useCallback } from "react"
import CallSidebar from "@/components/calls/call-sidebar"
import JitsiRoom from "@/components/calls/jitsi-room"

interface CallRoom {
  id: string
  name: string
  type: "office" | "breakout" | "private" | "meeting" | "direct"
  roomName: string
  createdBy: string
}

interface CallLayoutClientProps {
  children: React.ReactNode
  userSession: string
  userList: string
}

export default function CallLayoutClient({ children, userSession, userList }: CallLayoutClientProps) {
  const [activeRoom, setActiveRoom] = useState<CallRoom | null>(null)
  const [showCall, setShowCall] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(null)
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    try { setCurrentUser(JSON.parse(userSession)) } catch {}
    try { setUsers(JSON.parse(userList)) } catch {}
  }, [userSession, userList])

  function handleJoinRoom(room: CallRoom) {
    setActiveRoom(room)
    setShowCall(true)
  }

  function handleLeaveCall() {
    setShowCall(false)
    setActiveRoom(null)
  }

  if (!currentUser) return <>{children}</>

  return (
    <div className="flex h-full min-h-screen">
      <CallSidebar
        currentUser={currentUser}
        users={users}
        onJoinRoom={handleJoinRoom}
        activeRoomId={activeRoom?.id}
      />
      <div className="flex-1 min-w-0">
        {showCall && activeRoom ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-2 border-b bg-muted/30">
              <span className="text-sm font-medium truncate">
                {activeRoom.type === "office" ? "🟢 Office Call" : `📞 ${activeRoom.name}`}
              </span>
              <button
                onClick={handleLeaveCall}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground underline"
              >
                Tutup call
              </button>
            </div>
            <div className="flex-1">
              <JitsiRoom
                roomName={activeRoom.roomName}
                displayName={currentUser.name}
                roomId={activeRoom.id}
                onLeft={handleLeaveCall}
              />
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

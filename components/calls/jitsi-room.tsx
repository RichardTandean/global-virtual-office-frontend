"use client"

import { useEffect, useRef, useCallback } from "react"
import Script from "next/script"

declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}

const JITSI_DOMAIN = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.richardtandean.my.id"

interface JitsiRoomProps {
  roomName: string
  displayName: string
  roomId: string
  onLeft?: () => void
}

export default function JitsiRoom({ roomName, displayName, roomId, onLeft }: JitsiRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<any>(null)
  const initializedRef = useRef(false)

  const leaveRoom = useCallback(async () => {
    try {
      await fetch(`/api/call-rooms/${roomId}/leave`, { method: "POST" })
    } catch {}
    onLeft?.()
  }, [roomId, onLeft])

  const startCall = useCallback(() => {
    if (initializedRef.current) return
    if (typeof window === "undefined" || !window.JitsiMeetExternalAPI) return
    if (!containerRef.current) return
    initializedRef.current = true

    try {
      fetch(`/api/call-rooms/${roomId}/join`, { method: "POST" }).catch(() => {})

      const options = {
        roomName,
        width: "100%",
        height: "100%",
        parentNode: containerRef.current,
        userInfo: { displayName: displayName || "User" },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: true,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: ["microphone", "camera", "hangup", "chat", "raisehand", "tileview"],
          SHOW_JITSI_WATERMARK: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          FILM_STRIP_MAX_HEIGHT: 120,
        },
      }

      apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, options)

      apiRef.current.addEventListeners({
        readyToClose: () => {
          apiRef.current?.dispose()
          apiRef.current = null
          leaveRoom()
        },
      })
    } catch {}
  }, [roomName, displayName, roomId, leaveRoom])

  useEffect(() => {
    if (window.JitsiMeetExternalAPI) startCall()
    return () => {
      apiRef.current?.dispose()
      apiRef.current = null
    }
  }, [roomName])

  return (
    <>
      <Script
        src={`https://${JITSI_DOMAIN}/external_api.js`}
        onLoad={startCall}
        strategy="afterInteractive"
      />
      <div ref={containerRef} className="w-full h-full" />
    </>
  )
}

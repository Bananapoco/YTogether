"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, WifiOff } from "lucide-react"

import { RoomSidebar } from "@/components/RoomSidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { VideoInput } from "@/components/VideoInput"
import {
  YouTubePlayer,
  type PlaybackChange,
} from "@/features/playback/youtube-player"
import { getParticipantId } from "@/features/room/participant"
import {
  connectParticipant,
  leaveRoom,
  pauseForParticipant,
  resumeAfterReconnect,
  selectVideo,
  subscribeToRoom,
  updatePlayback,
} from "@/features/room/room-store"
import { EMPTY_ROOM_STATE, type RoomState } from "@/features/room/types"

interface RoomClientProps {
  roomId: string
}

export function RoomClient({ roomId }: RoomClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const username = searchParams.get("username")?.trim() || "Anonymous"
  const [participantId, setParticipantId] = useState("")
  const [room, setRoom] = useState<RoomState>(EMPTY_ROOM_STATE)
  const isApplyingRemoteUpdate = useRef(false)
  const lastSeekAt = useRef(0)

  useEffect(() => {
    const id = getParticipantId()
    setParticipantId(id)

    const disconnectPresence = connectParticipant(roomId, { id, name: username })

    return () => {
      disconnectPresence()
      void leaveRoom(roomId, id)
    }
  }, [roomId, username])

  useEffect(() => {
    let resetRemoteUpdateTimer: ReturnType<typeof setTimeout> | undefined

    const unsubscribe = subscribeToRoom(
      roomId,
      (nextRoom) => {
        isApplyingRemoteUpdate.current = true
        setRoom(nextRoom)

        clearTimeout(resetRemoteUpdateTimer)
        resetRemoteUpdateTimer = setTimeout(() => {
          isApplyingRemoteUpdate.current = false
        }, 300)
      },
      () => router.push("/"),
    )

    return () => {
      clearTimeout(resetRemoteUpdateTimer)
      unsubscribe()
    }
  }, [roomId, router])

  useEffect(() => {
    if (!participantId) {
      return
    }

    const participants = Object.values(room.participants)
    const offlineParticipant = participants.find((participant) => !participant.connected)
    const everyoneIsOnline = participants.length > 0 && participants.every((participant) => participant.connected)

    if (offlineParticipant && room.isPlaying && !room.pausedForParticipant) {
      void pauseForParticipant(roomId, offlineParticipant.name)
    } else if (everyoneIsOnline && room.pausedForParticipant) {
      void resumeAfterReconnect(roomId)
    }
  }, [participantId, room.isPlaying, room.participants, room.pausedForParticipant, roomId])

  const handleVideoId = useCallback(
    (videoId: string) => void selectVideo(roomId, videoId),
    [roomId],
  )

  const handlePlaybackChange = useCallback(
    (playback: PlaybackChange) => {
      if (isApplyingRemoteUpdate.current) {
        return
      }

      void updatePlayback(roomId, playback)
    },
    [roomId],
  )

  const handleSeek = useCallback(
    (currentTime: number) => {
      if (isApplyingRemoteUpdate.current || Date.now() - lastSeekAt.current < 300) {
        return
      }

      lastSeekAt.current = Date.now()
      void updatePlayback(roomId, { currentTime })
    },
    [roomId],
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground md:flex-row">
      <main className="relative flex min-w-0 flex-1 flex-col bg-background/50">
        <header className="flex items-center justify-between border-b p-4 md:hidden">
          <h1 className="font-bold">Room: {roomId}</h1>
          <ThemeToggle />
        </header>
        <div className="absolute right-4 top-4 z-10 hidden md:block">
          <ThemeToggle />
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto p-4 md:p-8">
          <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10">
            <YouTubePlayer
              videoId={room.videoId}
              isPlaying={room.isPlaying}
              currentTime={room.currentTime}
              onPlaybackChange={handlePlaybackChange}
              onSeek={handleSeek}
            />

            {room.pausedForParticipant && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center shadow-2xl">
                  <div className="animate-pulse rounded-full bg-destructive/10 p-4">
                    <WifiOff className="h-10 w-10 text-destructive" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Connection Interrupted</h3>
                    <p className="text-sm text-muted-foreground">
                      Waiting for <span className="font-semibold text-foreground">{room.offlineParticipantName || "a member"}</span> to reconnect.
                      Playback will resume automatically.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Syncing playback...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full max-w-3xl">
            <VideoInput onVideoId={handleVideoId} />
          </div>
        </div>
      </main>

      <aside className="h-[40vh] w-full flex-shrink-0 border-t md:h-full md:w-80 md:border-l md:border-t-0">
        <RoomSidebar
          roomId={roomId}
          users={room.participants}
          currentUserId={participantId}
          currentUserName={username}
          creatorId={room.creatorId}
        />
      </aside>
    </div>
  )
}

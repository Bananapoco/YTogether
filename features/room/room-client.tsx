"use client"

import { Loader2, WifiOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { ThemeToggle } from "@/components/theme-toggle"
import { YouTubePlayer } from "@/features/playback/youtube-player"
import { VideoInput } from "@/features/playback/video-input"
import { RoomSidebar } from "./room-sidebar"
import { useRoomSession } from "./use-room-session"

interface RoomClientProps {
  roomId: string
}

export function RoomClient({ roomId }: RoomClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const participantName = searchParams.get("username")?.trim() || "Anonymous"
  const { room, participantId, chooseVideo, changePlayback, seek } = useRoomSession(
    roomId,
    participantName,
    () => router.push("/"),
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
              onPlaybackChange={changePlayback}
              onSeek={seek}
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
            <VideoInput onVideoId={chooseVideo} />
          </div>
        </div>
      </main>

      <aside className="h-[40vh] w-full flex-shrink-0 border-t md:h-full md:w-80 md:border-l md:border-t-0">
        <RoomSidebar
          roomId={roomId}
          participants={room.participants}
          currentParticipantId={participantId}
          currentParticipantName={participantName}
          creatorId={room.creatorId}
        />
      </aside>
    </div>
  )
}

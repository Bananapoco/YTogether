"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { extractVideoId } from "@/features/playback/youtube-api"
import { getParticipantId } from "@/features/room/participant"
import { createRoom, roomExists } from "@/features/room/room-store"
import { ParticipantNameDialog } from "./participant-name-dialog"

export function RoomActions() {
  const router = useRouter()
  const [videoLink, setVideoLink] = useState("")
  const [videoId, setVideoId] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState("")
  const [creatorName, setCreatorName] = useState("")
  const [participantName, setParticipantName] = useState("")
  const [joinError, setJoinError] = useState("")
  const [createError, setCreateError] = useState("")
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isCheckingRoom, setIsCheckingRoom] = useState(false)

  const handleStart = (event: React.FormEvent) => {
    event.preventDefault()
    setCreateError("")

    if (!videoLink.trim()) {
      setVideoId(null)
      setIsCreateDialogOpen(true)
      return
    }

    const id = extractVideoId(videoLink)
    if (!id) {
      setCreateError("That doesn't look like a YouTube link.")
      return
    }

    setVideoId(id)
    setIsCreateDialogOpen(true)
  }

  const handleCreateRoom = async () => {
    if (!creatorName.trim()) {
      return
    }

    setIsCreating(true)
    setCreateError("")

    try {
      const newRoomCode = await createRoom(getParticipantId(), videoId ?? undefined)
      goToRoom(newRoomCode, creatorName)
    } catch (error) {
      console.error("Failed to create room", error)
      setCreateError("Could not create a room. Please try again.")
      setIsCreateDialogOpen(false)
      setIsCreating(false)
    }
  }

  const handleFindRoom = async (event: React.FormEvent) => {
    event.preventDefault()
    setJoinError("")

    if (roomCode.length !== 6) {
      setJoinError("Room codes are 6 characters.")
      return
    }

    setIsCheckingRoom(true)

    try {
      if (await roomExists(roomCode)) {
        setIsJoinDialogOpen(true)
      } else {
        setJoinError("No room with that code. Check it and try again.")
      }
    } catch (error) {
      console.error("Failed to find room", error)
      setJoinError("Could not connect. Please try again.")
    } finally {
      setIsCheckingRoom(false)
    }
  }

  const goToRoom = (code: string, name: string) => {
    router.push(`/room/${code}?username=${encodeURIComponent(name.trim())}`)
  }

  return (
    <>
      <div className="flex w-full max-w-lg flex-col items-center gap-3 md:items-start">
        <form onSubmit={handleStart} className="w-full space-y-2">
          <Label htmlFor="video-link" className="sr-only">
            YouTube link
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="video-link"
              type="text"
              inputMode="url"
              placeholder="Paste a YouTube link"
              value={videoLink}
              aria-invalid={Boolean(createError)}
              onChange={(event) => {
                setVideoLink(event.target.value)
                setCreateError("")
              }}
              className="h-12 flex-1 bg-background text-base"
            />
            <Button type="submit" size="lg" className="h-12 px-6 text-base">
              Start room
            </Button>
          </div>
          {createError && <ErrorText>{createError}</ErrorText>}
        </form>

        {isJoinOpen ? (
          <form onSubmit={handleFindRoom} className="w-full space-y-2 pt-1">
            <Label htmlFor="room-code" className="text-muted-foreground">
              Room code
            </Label>
            <div className="flex gap-2">
              <Input
                id="room-code"
                placeholder="ABC123"
                value={roomCode}
                autoFocus
                aria-invalid={Boolean(joinError)}
                onChange={(event) => {
                  setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                  setJoinError("")
                }}
                maxLength={6}
                className="h-11 max-w-44 bg-background font-mono text-lg uppercase tracking-widest"
              />
              <Button type="submit" variant="outline" size="lg" className="h-11" disabled={isCheckingRoom}>
                {isCheckingRoom ? "Checking..." : "Join"}
              </Button>
            </div>
            {joinError && <ErrorText>{joinError}</ErrorText>}
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsJoinOpen(true)}
            className="text-sm text-muted-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
          >
            Have a code? Join a room
          </button>
        )}
      </div>

      <ParticipantNameDialog
        open={isCreateDialogOpen}
        title="Start a room"
        description="Your name shows up for everyone in the room."
        submitLabel="Start room"
        submittingLabel="Starting..."
        name={creatorName}
        isSubmitting={isCreating}
        onNameChange={setCreatorName}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateRoom}
      />
      <ParticipantNameDialog
        open={isJoinDialogOpen}
        title={`Join room ${roomCode}`}
        description="Pick a name so everyone knows who's here."
        submitLabel="Join room"
        name={participantName}
        onNameChange={setParticipantName}
        onOpenChange={setIsJoinDialogOpen}
        onSubmit={() => goToRoom(roomCode, participantName)}
      />
    </>
  )
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1 text-sm text-destructive">
      <AlertCircle className="h-3 w-3" /> {children}
    </p>
  )
}

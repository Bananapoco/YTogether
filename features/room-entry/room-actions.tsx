"use client"

import { useState } from "react"
import { AlertCircle, ArrowRight, Play, Users } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getParticipantId } from "@/features/room/participant"
import { createRoom, roomExists } from "@/features/room/room-store"
import { ParticipantNameDialog } from "./participant-name-dialog"

export function RoomActions() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [creatorName, setCreatorName] = useState("")
  const [participantName, setParticipantName] = useState("")
  const [joinError, setJoinError] = useState("")
  const [createError, setCreateError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isCheckingRoom, setIsCheckingRoom] = useState(false)

  const handleCreateRoom = async () => {
    if (!creatorName.trim()) {
      return
    }

    setIsCreating(true)
    setCreateError("")

    try {
      const newRoomCode = await createRoom(getParticipantId())
      goToRoom(newRoomCode, creatorName)
    } catch (error) {
      console.error("Failed to create room", error)
      setCreateError("Could not create a room. Please try again.")
      setIsCreating(false)
    }
  }

  const handleFindRoom = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!roomCode) {
      return
    }

    setJoinError("")
    setIsCheckingRoom(true)

    try {
      if (await roomExists(roomCode)) {
        setIsJoinDialogOpen(true)
      } else {
        setJoinError("Room not found. Check the code and try again.")
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
      <div className="flex w-full max-w-md flex-col gap-6 md:ml-auto">
        <Card className="group relative overflow-hidden border-2 border-primary/10 shadow-lg transition-colors hover:border-primary/20">
          <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
            <Play className="-mr-8 -mt-8 h-24 w-24 rotate-12" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Start Watching</CardTitle>
            <CardDescription>Create a new room and invite others</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="h-12 w-full text-lg font-medium"
              size="lg"
            >
              <Play className="mr-2 h-5 w-5 fill-current" /> Create Room
            </Button>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
          </CardContent>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or join existing</span>
          </div>
        </div>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" /> Join a Party
            </CardTitle>
            <CardDescription>Enter the code shared with you</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFindRoom} className="space-y-2">
              <Label htmlFor="room-code">Room Code</Label>
              <div className="flex gap-2">
                <Input
                  id="room-code"
                  placeholder="ABC123"
                  value={roomCode}
                  onChange={(event) => {
                    setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                    setJoinError("")
                  }}
                  maxLength={6}
                  className="h-11 uppercase font-mono text-lg tracking-widest"
                  required
                />
                <Button type="submit" size="lg" className="px-6" disabled={isCheckingRoom || roomCode.length !== 6}>
                  {isCheckingRoom ? <span className="animate-pulse">...</span> : <ArrowRight className="h-5 w-5" />}
                </Button>
              </div>
              {joinError && (
                <p className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" /> {joinError}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      <ParticipantNameDialog
        open={isCreateDialogOpen}
        title="Create Room"
        description="Enter your name so others know who started the party."
        submitLabel="Start Party"
        submittingLabel="Creating..."
        name={creatorName}
        isSubmitting={isCreating}
        onNameChange={setCreatorName}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateRoom}
      />
      <ParticipantNameDialog
        open={isJoinDialogOpen}
        title={`Join Room ${roomCode}`}
        description="Enter your name to join the party."
        submitLabel="Join Party"
        name={participantName}
        onNameChange={setParticipantName}
        onOpenChange={setIsJoinDialogOpen}
        onSubmit={() => goToRoom(roomCode, participantName)}
      />
    </>
  )
}

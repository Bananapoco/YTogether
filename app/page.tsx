"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const router = useRouter()
  const [joinRoomId, setJoinRoomId] = useState("")
  const [joinPassword, setJoinPassword] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  // Generate random 6-character room ID
  const generateRoomId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleCreateRoom = () => {
    const roomId = generateRoomId()
    router.push(`/room/${roomId}`)
  }

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinRoomId.trim()) {
      alert("Please enter a room ID")
      return
    }
    setIsJoining(true)
    const roomId = joinRoomId.trim().toUpperCase()
    const password = joinPassword.trim()
    
    // Navigate to room - password validation will happen there
    router.push(`/room/${roomId}${password ? `?password=${encodeURIComponent(password)}` : ""}`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with theme toggle */}
      <header className="flex justify-end p-4">
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold">YTogether</h1>
            <p className="text-muted-foreground">
              Watch YouTube videos together in sync
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Create Room Card */}
            <Card>
              <CardHeader>
                <CardTitle>Create Room</CardTitle>
                <CardDescription>
                  Start a new watch party room
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleCreateRoom}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  Create New Room
                </Button>
              </CardContent>
            </Card>

            {/* Join Room Card */}
            <Card>
              <CardHeader>
                <CardTitle>Join Room</CardTitle>
                <CardDescription>
                  Enter a room ID to join an existing watch party
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomId">Room ID</Label>
                    <Input
                      id="roomId"
                      placeholder="ABC123"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="uppercase"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password (optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Room password"
                      value={joinPassword}
                      onChange={(e) => setJoinPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                    disabled={isJoining}
                  >
                    {isJoining ? "Joining..." : "Join Room"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

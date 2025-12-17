"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Play, Users, Tv, ArrowRight, Video, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ref, get, set, serverTimestamp } from "firebase/database"
import { db } from "@/lib/firebase"

export default function Home() {
  const router = useRouter()
  const [joinRoomId, setJoinRoomId] = useState("")
  const [joinPassword, setJoinPassword] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState("")
  
  // Create Room State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [creatorName, setCreatorName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Join Room Dialog State
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [joinName, setJoinName] = useState("")

  // Generate random 6-character room ID
  const generateRoomId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!creatorName.trim()) return

    setIsCreating(true)
    const roomId = generateRoomId()
    const name = creatorName.trim()
    
    // Get or create user ID for the creator
    let userId = sessionStorage.getItem("yt_user_id")
    if (!userId) {
      userId = Math.random().toString(36).substring(2, 9)
      sessionStorage.setItem("yt_user_id", userId)
    }
    
    try {
      // Create room in Firebase
      await set(ref(db, `rooms/${roomId}`), {
        createdAt: serverTimestamp(),
        creatorId: userId,
        isPlaying: false,
        currentTime: 0,
        // We don't set users here; the room page handles adding the user
      })
      
      // Navigate to room with username
      router.push(`/room/${roomId}?username=${encodeURIComponent(name)}`)
    } catch (error) {
      console.error("Error creating room:", error)
      setIsCreating(false)
      alert("Failed to create room. Please try again.")
    }
  }

  const handleJoinClick = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinRoomId.trim()) return
    
    setJoinError("")
    setIsJoining(true)
    const roomId = joinRoomId.trim().toUpperCase()

    try {
      // Check if room exists
      const roomSnapshot = await get(ref(db, `rooms/${roomId}`))
      
      if (roomSnapshot.exists()) {
        // Room exists, open name dialog
        setIsJoinDialogOpen(true)
        setIsJoining(false)
      } else {
        setJoinError("Room not found. Check the code and try again.")
        setIsJoining(false)
      }
    } catch (error) {
      console.error("Error checking room:", error)
      setJoinError("Connection error. Please try again.")
      setIsJoining(false)
    }
  }

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinName.trim()) return

    const roomId = joinRoomId.trim().toUpperCase()
    const password = joinPassword.trim()
    const name = joinName.trim()

    // Navigate to room
    router.push(`/room/${roomId}?username=${encodeURIComponent(name)}${password ? `&password=${encodeURIComponent(password)}` : ""}`)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1">
              <Tv className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">YTogether</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl grid gap-8 md:grid-cols-2 items-center">
          
          {/* Hero Section */}
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight lg:text-6xl">
              Watch YouTube <br className="hidden md:block" />
              <span className="text-primary">Together</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-[500px] mx-auto md:mx-0">
              Sync up with friends and family. Watch videos in real-time, no matter where you are.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
                <Video className="h-4 w-4" />
                <span>Real-time Sync</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
                <Users className="h-4 w-4" />
                <span>No Account Needed</span>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="flex flex-col gap-6 w-full max-w-md mx-auto md:ml-auto">
            
            {/* Create Room Card */}
            <Card className="border-2 border-primary/10 shadow-lg relative overflow-hidden group hover:border-primary/20 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Play className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">Start Watching</CardTitle>
                <CardDescription>Create a new room and invite others</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleCreateClick} 
                  className="w-full h-12 text-lg font-medium group-hover:bg-primary/90"
                  size="lg"
                >
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Create Room
                </Button>
              </CardContent>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or join existing</span>
              </div>
            </div>

            {/* Join Room Card */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Join a Party
                </CardTitle>
                <CardDescription>Enter the code shared with you</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinClick} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomId">Room Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="roomId"
                        placeholder="ABC123"
                        value={joinRoomId}
                        onChange={(e) => {
                          setJoinRoomId(e.target.value.toUpperCase())
                          setJoinError("")
                        }}
                        maxLength={6}
                        className="uppercase font-mono tracking-widest text-lg h-11"
                        required
                      />
                      <Button 
                        type="submit" 
                        size="lg"
                        className="px-6"
                        disabled={isJoining || joinRoomId.length < 3}
                      >
                        {isJoining ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          <ArrowRight className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    {joinError && (
                      <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
                        <AlertCircle className="h-3 w-3" />
                        {joinError}
                      </p>
                    )}
                  </div>
                  
                  {joinRoomId.length > 0 && (
                     <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                      <Label htmlFor="password" className="text-xs text-muted-foreground">Password (if required)</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Optional password"
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                        className="h-9 mt-1"
                      />
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      {/* Create Room Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Room</DialogTitle>
            <DialogDescription>
              Enter your name so others know who started the party.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-name">Your Name</Label>
                <Input
                  id="create-name"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="col-span-3"
                  autoFocus
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreating || !creatorName.trim()}>
                {isCreating ? "Creating..." : "Start Party"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Join Room Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join Room {joinRoomId}</DialogTitle>
            <DialogDescription>
              Enter your name to join the party.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJoinSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="join-name">Your Name</Label>
                <Input
                  id="join-name"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="e.g. Sam"
                  className="col-span-3"
                  autoFocus
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!joinName.trim()}>
                Join Party
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ref, onValue, set, update, onDisconnect, serverTimestamp, remove } from "firebase/database"
import { db } from "@/lib/firebase"
import { VideoPlayer } from "@/components/VideoPlayer"
import { VideoInput } from "@/components/VideoInput"
import { RoomSidebar } from "@/components/RoomSidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { RoomState } from "@/types"

interface RoomClientProps {
  roomId: string
}

export function RoomClient({ roomId }: RoomClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState<string>("")
  const username = searchParams.get("username") || "Anonymous"

  // Room State
  const [roomState, setRoomState] = useState<RoomState>({
    videoId: null,
    isPlaying: false,
    currentTime: 0,
    lastUpdate: 0,
    users: {}
  })

  // Prevent circular updates
  const isRemoteUpdate = useRef(false)
  const lastSeekTime = useRef(0) // Debounce seeks
  
  // Track users ref for cleanup
  const usersRefCurrent = useRef<Record<string, any>>({})

  // Update users ref
  useEffect(() => {
    usersRefCurrent.current = roomState.users
  }, [roomState.users])

  // Initialize User & Presence
  useEffect(() => {
    let currentUserId = sessionStorage.getItem("yt_user_id")
    if (!currentUserId) {
      currentUserId = Math.random().toString(36).substring(2, 9)
      sessionStorage.setItem("yt_user_id", currentUserId)
    }
    setUserId(currentUserId)

    const userRef = ref(db, `rooms/${roomId}/users/${currentUserId}`)
    const connectedRef = ref(db, ".info/connected")

    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(userRef).remove()
        set(userRef, {
            name: username,
            connected: true,
            lastSeen: serverTimestamp()
        }).catch(err => console.error("Error setting user:", err));
      }
    })

    return () => {
      unsubscribeConnected()
      // Remove self
      remove(userRef)
      
      // Check if room is empty (excluding self)
      if (usersRefCurrent.current) {
        const remainingUsers = Object.keys(usersRefCurrent.current).filter(id => id !== currentUserId)
        if (remainingUsers.length === 0) {
           remove(ref(db, `rooms/${roomId}`))
        }
      }
    }
  }, [roomId, username])

  // Sync Room State from Firebase
  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomId}`)
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Calculate estimated current time based on elapsed time since last update
        let adjustedTime = data.currentTime || 0
        if (data.isPlaying && data.lastUpdate) {
            const now = Date.now()
            const elapsed = (now - data.lastUpdate) / 1000
            if (elapsed > 0 && elapsed < 3600) {
                adjustedTime += elapsed
            }
        }

        isRemoteUpdate.current = true
        setRoomState({
          videoId: data.videoId || null,
          isPlaying: data.isPlaying || false,
          currentTime: adjustedTime,
          lastUpdate: data.lastUpdate || 0,
          users: data.users || {},
          creatorId: data.creatorId
        })
        
        // Keep the flag true for a bit to prevent echo
        setTimeout(() => {
            isRemoteUpdate.current = false
        }, 300)
      } else {
        // Room deleted or invalid
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [roomId])

  // Handle new video
  const handleVideoId = useCallback((id: string) => {
    update(ref(db, `rooms/${roomId}`), {
      videoId: id,
      isPlaying: true,
      currentTime: 0,
      lastUpdate: serverTimestamp()
    })
  }, [roomId])

  // Handle play/pause from player
  const handlePlayerStateChange = useCallback((event: any) => {
    const playerState = event.data
    
    // Ignore if this is a result of a remote update
    if (isRemoteUpdate.current) return

    // Only handle explicit play/pause, not buffering or other states
    if (playerState === 1) { // PLAYING
      update(ref(db, `rooms/${roomId}`), {
        isPlaying: true,
        currentTime: event.target.getCurrentTime(),
        lastUpdate: serverTimestamp()
      })
    } else if (playerState === 2) { // PAUSED
      update(ref(db, `rooms/${roomId}`), {
        isPlaying: false,
        currentTime: event.target.getCurrentTime(),
        lastUpdate: serverTimestamp()
      })
    }
  }, [roomId])

  // Handle seek from player (user skipped to a new position)
  const handleSeek = useCallback((time: number) => {
    // Ignore if this is from a remote sync
    if (isRemoteUpdate.current) return
    
    // Debounce: don't send seeks more than once per 300ms
    const now = Date.now()
    if (now - lastSeekTime.current < 300) return
    lastSeekTime.current = now

    update(ref(db, `rooms/${roomId}`), {
      currentTime: time,
      isPlaying: true, // Force play after seek
      lastUpdate: serverTimestamp()
    })
  }, [roomId])

  return (
    <div className="flex h-screen flex-col md:flex-row bg-background text-foreground overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background/50 relative">
        
        {/* Header/Toggle */}
        <header className="md:hidden flex items-center justify-between p-4 border-b">
          <h1 className="font-bold">Room: {roomId}</h1>
          <ThemeToggle />
        </header>
        <div className="hidden md:block absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        {/* Video Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 gap-6 overflow-y-auto">
          
          <div className="w-full max-w-5xl aspect-video bg-black rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
            <VideoPlayer 
              videoId={roomState.videoId}
              isPlaying={roomState.isPlaying}
              currentTime={roomState.currentTime}
              onStateChange={handlePlayerStateChange}
              onSeek={handleSeek}
            />
          </div>

          <div className="w-full max-w-3xl">
            <VideoInput onVideoId={handleVideoId} />
          </div>

        </div>
      </main>

      {/* Sidebar */}
      <aside className="w-full md:w-80 h-[40vh] md:h-full border-t md:border-t-0 md:border-l flex-shrink-0">
        <RoomSidebar 
          roomId={roomId} 
          users={roomState.users}
          currentUserId={userId}
          currentUserName={username}
          creatorId={roomState.creatorId}
        />
      </aside>
    </div>
  )
}

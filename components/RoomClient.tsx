"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { ref, onValue, set, update, onDisconnect, serverTimestamp } from "firebase/database"
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
  const searchParams = useSearchParams()
  // User setup
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

  // Initialize User & Presence
  useEffect(() => {
    // Generate or retrieve user ID
    // Use sessionStorage so new tabs = new users (easier for testing/multiple sessions)
    let currentUserId = sessionStorage.getItem("yt_user_id")
    if (!currentUserId) {
      currentUserId = Math.random().toString(36).substring(2, 9)
      sessionStorage.setItem("yt_user_id", currentUserId)
    }
    setUserId(currentUserId)

    const userRef = ref(db, `rooms/${roomId}/users/${currentUserId}`)
    const connectedRef = ref(db, ".info/connected")

    // Handle presence
    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      const isConnected = snap.val();
      console.log("Firebase Connection Status:", isConnected);
      
      if (isConnected === true) {
        // We're connected (or reconnected)
        onDisconnect(userRef).remove() // Remove user on disconnect
        
        console.log("Adding user to room:", currentUserId, username);
        // Add user to room
        set(userRef, {
            name: username,
            connected: true,
            lastSeen: serverTimestamp()
        }).catch(err => console.error("Error setting user:", err));
      }
    })

    return () => {
      unsubscribeConnected()
    }
  }, [roomId, username])

  // Sync Room State
  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomId}`)
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Calculate estimated current time based on lag
        let adjustedTime = data.currentTime || 0
        if (data.isPlaying && data.lastUpdate) {
            const now = Date.now()
            const timeDiff = (now - data.lastUpdate) / 1000
            // Only adjust if the difference is reasonable (e.g., less than 1 hour) to avoid huge jumps on stale data
            if (timeDiff > 0 && timeDiff < 3600) {
                 adjustedTime += timeDiff
            }
        }

        isRemoteUpdate.current = true
        setRoomState(prev => ({
          ...prev,
          videoId: data.videoId || null,
          isPlaying: data.isPlaying || false,
          currentTime: adjustedTime,
          lastUpdate: data.lastUpdate || 0,
          users: data.users || {}
        }))
        
        // Reset flag after a short delay to allow effects to run
        setTimeout(() => {
            isRemoteUpdate.current = false
        }, 500)
      }
    })

    return () => unsubscribe()
  }, [roomId])

  // Handlers
  const handleVideoId = (id: string) => {
    update(ref(db, `rooms/${roomId}`), {
      videoId: id,
      isPlaying: true, // Auto play on new video
      currentTime: 0,
      lastUpdate: serverTimestamp()
    })
  }

  const handlePlayerStateChange = (event: any) => {
    // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    const playerState = event.data
    
    // Avoid sending updates if this change triggered by a remote update
    if (isRemoteUpdate.current) return

    if (playerState === 1) { // Playing
      update(ref(db, `rooms/${roomId}`), {
        isPlaying: true,
        currentTime: event.target.getCurrentTime(),
        lastUpdate: serverTimestamp()
      })
    } else if (playerState === 2) { // Paused
      update(ref(db, `rooms/${roomId}`), {
        isPlaying: false,
        currentTime: event.target.getCurrentTime(),
        lastUpdate: serverTimestamp()
      })
    }
  }

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
            />
          </div>

          <div className="w-full max-w-3xl">
            <VideoInput onVideoId={handleVideoId} />
          </div>

        </div>
      </main>

      {/* Sidebar */}
      <aside className="w-full md:w-80 h-[40vh] md:h-full border-t md:border-t-0 md:border-l flex-shrink-0">
        <RoomSidebar roomId={roomId} users={roomState.users} />
      </aside>
    </div>
  )
}

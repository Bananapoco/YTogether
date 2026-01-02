"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ref, onValue, set, update, onDisconnect, serverTimestamp, remove, get } from "firebase/database"
import { db } from "@/lib/firebase"
import { VideoPlayer } from "@/components/VideoPlayer"
import { VideoInput } from "@/components/VideoInput"
import { RoomSidebar } from "@/components/RoomSidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { RoomState } from "@/types"
import { WifiOff, Loader2 } from "lucide-react"

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
        // When user loses connection, mark as offline but keep entry
        onDisconnect(userRef).update({ 
          connected: false,
          lastSeen: serverTimestamp() 
        })
        
        set(userRef, {
            id: currentUserId,
            name: username,
            connected: true,
            lastSeen: serverTimestamp()
        }).catch(err => console.error("Error setting user:", err));
      }
    })

    return () => {
      unsubscribeConnected()
      // On unmount (intentional leave), remove the user entry entirely
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
          creatorId: data.creatorId,
          isPausedByDisconnect: data.isPausedByDisconnect || false,
          offlineUserName: data.offlineUserName
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

  // Monitor user connectivity to handle automatic pause/resume
  useEffect(() => {
    if (!userId || !roomState.users) return

    const users = Object.values(roomState.users)
    const offlineUser = users.find(u => u.connected === false)
    const allOnline = users.every(u => u.connected === true)

    if (offlineUser && roomState.isPlaying && !roomState.isPausedByDisconnect) {
      // Someone went offline while playing - PAUSE
      update(ref(db, `rooms/${roomId}`), {
        isPlaying: false,
        isPausedByDisconnect: true,
        offlineUserName: offlineUser.name,
        lastUpdate: serverTimestamp()
      })
    } else if (allOnline && roomState.isPausedByDisconnect) {
      // Everyone is back online - RESUME
      update(ref(db, `rooms/${roomId}`), {
        isPlaying: true,
        isPausedByDisconnect: false,
        offlineUserName: null,
        lastUpdate: serverTimestamp()
      })
    }
  }, [roomState.users, roomState.isPlaying, roomState.isPausedByDisconnect, roomId, userId])

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
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 gap-6 overflow-y-auto relative">
          
          <div className="w-full max-w-5xl aspect-video bg-black rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 relative">
            <VideoPlayer 
              videoId={roomState.videoId}
              isPlaying={roomState.isPlaying}
              currentTime={roomState.currentTime}
              onStateChange={handlePlayerStateChange}
              onSeek={handleSeek}
            />

            {/* Connection Lost Overlay */}
            {roomState.isPausedByDisconnect && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border shadow-2xl max-w-sm text-center">
                  <div className="p-4 bg-destructive/10 rounded-full animate-pulse">
                    <WifiOff className="h-10 w-10 text-destructive" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Connection Interrupted</h3>
                    <p className="text-muted-foreground text-sm">
                      Waiting for <span className="font-semibold text-foreground">{roomState.offlineUserName || "a member"}</span> to reconnect. 
                      Playback will resume automatically.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Syncing states...</span>
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

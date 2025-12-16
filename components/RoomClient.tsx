"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { VideoPlayer } from "@/components/VideoPlayer"
import { VideoInput } from "@/components/VideoInput"
import { RoomSidebar } from "@/components/RoomSidebar"
import { ThemeToggle } from "@/components/theme-toggle"

interface RoomClientProps {
  roomId: string
}

export function RoomClient({ roomId }: RoomClientProps) {
  const searchParams = useSearchParams()
  const username = searchParams.get("username")
  
  // Local state for now (will be Firebase sync later)
  const [videoId, setVideoId] = useState<string | null>(null)

  const handleVideoId = (id: string) => {
    setVideoId(id)
    // In Phase 4, we will push this to Firebase instead of setting local state directly
  }

  return (
    <div className="flex h-screen flex-col md:flex-row bg-background text-foreground overflow-hidden">
      {/* Main Content Area (Video + Input) */}
      <main className="flex-1 flex flex-col min-w-0 bg-background/50 relative">
        
        {/* Mobile Header (visible only on small screens) */}
        <header className="md:hidden flex items-center justify-between p-4 border-b">
          <h1 className="font-bold">Room: {roomId}</h1>
          <ThemeToggle />
        </header>

        {/* Desktop Theme Toggle (absolute positioned) */}
        <div className="hidden md:block absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        {/* Video Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 gap-6 overflow-y-auto">
          
          {/* Video Player Container */}
          <div className="w-full max-w-5xl aspect-video bg-black rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
            <VideoPlayer videoId={videoId} />
          </div>

          {/* Video Input Bar */}
          <div className="w-full max-w-3xl">
            <VideoInput onVideoId={handleVideoId} />
          </div>

        </div>
      </main>

      {/* Sidebar */}
      <aside className="w-full md:w-80 h-[40vh] md:h-full border-t md:border-t-0 md:border-l flex-shrink-0">
        <RoomSidebar roomId={roomId} />
      </aside>
    </div>
  )
}


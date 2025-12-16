"use client"

import { useEffect, useRef, useState } from "react"
import { loadYouTubeScript } from "@/lib/youtube"

interface VideoPlayerProps {
  videoId: string | null
  onPlayerReady?: (player: any) => void
  onStateChange?: (event: any) => void
}

export function VideoPlayer({ videoId, onPlayerReady, onStateChange }: VideoPlayerProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isApiLoaded, setIsApiLoaded] = useState(false)

  // Load the API script once
  useEffect(() => {
    loadYouTubeScript().then(() => {
      setIsApiLoaded(true)
    })
  }, [])

  // Initialize player when API is ready and we have a container
  useEffect(() => {
    if (!isApiLoaded || !containerRef.current) return

    // If player already exists, just cue/load the video if ID changed
    // But for clean init, we usually check existence.
    if (!playerRef.current) {
      // @ts-expect-error - YT global is available after script load
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId || '', // Can init without video, or empty string
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          enablejsapi: 1,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            if (onPlayerReady) onPlayerReady(event.target)
          },
          onStateChange: (event: any) => {
            if (onStateChange) onStateChange(event)
          },
        },
      })
    } else if (videoId) {
        // Update existing player
        // We check if cueVideoById or loadVideoById is better. 
        // Usually loadVideoById plays immediately.
        playerRef.current.loadVideoById(videoId)
    }

    // Cleanup: We generally don't destroy the player on every unmount if we want to preserve state, 
    // but for a robust component, we should destroy it. 
    // However, if strict mode is on (React 18), this might mount/unmount rapidly.
    // Let's keep the instance if possible, or destroy on unmount.
    return () => {
        // Optional: playerRef.current?.destroy(); 
        // Leaving it might cause "placeholder" issues if re-mounted.
    }
  }, [isApiLoaded, videoId, onPlayerReady, onStateChange])

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-xl">
        <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}

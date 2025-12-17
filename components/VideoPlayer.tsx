"use client"

import { useEffect, useRef, useState } from "react"
import { loadYouTubeScript } from "@/lib/youtube"

interface VideoPlayerProps {
  videoId: string | null
  isPlaying: boolean
  currentTime: number
  onPlayerReady?: (player: any) => void
  onStateChange?: (event: any) => void
  onTimeUpdate?: (time: number) => void
}

export function VideoPlayer({ 
  videoId, 
  isPlaying, 
  currentTime,
  onPlayerReady, 
  onStateChange,
  onTimeUpdate
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isApiLoaded, setIsApiLoaded] = useState(false)

  // Load the API script once
  useEffect(() => {
    loadYouTubeScript().then(() => {
      setIsApiLoaded(true)
    })
  }, [])

  // Initialize player
  useEffect(() => {
    if (!isApiLoaded || !containerRef.current) return

    if (!playerRef.current) {
      try {
        console.log("Initializing YT Player with ID:", videoId);
        // We access window.YT safely now that types are defined
        playerRef.current = new window.YT.Player(containerRef.current, {
          height: '100%',
          width: '100%',
          videoId: videoId || '',
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            enablejsapi: 1,
            modestbranding: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
          events: {
            onReady: (event: any) => {
              console.log("Player Ready");
              if (onPlayerReady) onPlayerReady(event.target)
            },
            onStateChange: (event: any) => {
              if (onStateChange) onStateChange(event)
            },
            onError: (event: any) => {
              console.error("YouTube Player Error:", event.data);
            }
          },
        })
      } catch (e) {
        console.error("Failed to init player", e);
      }
    }
    // We intentionally omit videoId/onPlayerReady/onStateChange to avoid re-initializing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiLoaded])

  // Handle videoId changes
  useEffect(() => {
    if (playerRef.current && videoId) {
      const currentVideoId = playerRef.current.getVideoData?.()?.video_id;
      if (currentVideoId !== videoId) {
        playerRef.current.loadVideoById(videoId)
      }
    }
  }, [videoId])

  // Sync player state (play/pause/seek)
  useEffect(() => {
    if (!playerRef.current || !playerRef.current.getPlayerState) return;
    
    const playerState = playerRef.current.getPlayerState();
    const playerTime = playerRef.current.getCurrentTime();
    
    // Sync Play/Pause
    // 1=playing, 3=buffering
    if (isPlaying && playerState !== 1 && playerState !== 3) { 
      playerRef.current.playVideo();
    } else if (!isPlaying && playerState === 1) {
      playerRef.current.pauseVideo();
    }

    // Sync Time (only if deviation > 2s to avoid jitter)
    if (Math.abs(playerTime - currentTime) > 2) {
      playerRef.current.seekTo(currentTime, true);
    }

  }, [isPlaying, currentTime])

  // Periodic time update for sync
  useEffect(() => {
    const interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
            const time = playerRef.current.getCurrentTime();
            if (onTimeUpdate) onTimeUpdate(time);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [onTimeUpdate]);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-xl">
        <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}

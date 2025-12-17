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
  const [isPlayerReady, setIsPlayerReady] = useState(false)

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
              setIsPlayerReady(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiLoaded])

  // Handle videoId changes
  useEffect(() => {
    if (playerRef.current && isPlayerReady && videoId) {
      // Check if we can call the method
      if (typeof playerRef.current.getVideoData === 'function') {
        const currentVideoId = playerRef.current.getVideoData()?.video_id;
        if (currentVideoId !== videoId) {
            if (typeof playerRef.current.loadVideoById === 'function') {
                playerRef.current.loadVideoById(videoId)
            }
        }
      }
    }
  }, [videoId, isPlayerReady])

  // Sync player state (play/pause/seek)
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady) return;
    
    // Safety check for methods
    if (typeof playerRef.current.getPlayerState !== 'function') return;

    const playerState = playerRef.current.getPlayerState();
    
    // Safety check for getCurrentTime
    const playerTime = typeof playerRef.current.getCurrentTime === 'function' 
        ? playerRef.current.getCurrentTime() 
        : 0;
    
    // Sync Play/Pause
    // 1=playing, 3=buffering
    if (isPlaying && playerState !== 1 && playerState !== 3) { 
      if (typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
    } else if (!isPlaying && playerState === 1) {
      if (typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    }

    // Sync Time (only if deviation > 2s to avoid jitter)
    if (Math.abs(playerTime - currentTime) > 2) {
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(currentTime, true);
      }
    }

  }, [isPlaying, currentTime, isPlayerReady])

  // Periodic time update for sync
  useEffect(() => {
    if (!isPlayerReady) return;

    const interval = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            const time = playerRef.current.getCurrentTime();
            if (onTimeUpdate) onTimeUpdate(time);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [onTimeUpdate, isPlayerReady]);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-xl">
        <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}

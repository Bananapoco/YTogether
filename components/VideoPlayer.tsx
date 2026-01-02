"use client"

import { useEffect, useRef, useState } from "react"
import { loadYouTubeScript } from "@/lib/youtube"

interface VideoPlayerProps {
  videoId: string | null
  isPlaying: boolean
  currentTime: number
  onPlayerReady?: (player: any) => void
  onStateChange?: (event: any) => void
  onSeek?: (time: number) => void
}

export function VideoPlayer({ 
  videoId, 
  isPlaying, 
  currentTime,
  onPlayerReady, 
  onStateChange,
  onSeek
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevTimeRef = useRef<number>(0)
  const lastSyncTimeRef = useRef<number>(0) // Track when we last synced from props
  const isSyncingRef = useRef<boolean>(false) // Flag to prevent echo
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
              setIsPlayerReady(true);
              prevTimeRef.current = 0;
              if (onPlayerReady) onPlayerReady(event.target)
            },
            onStateChange: (event: any) => {
              // Handle seek detection on state changes (BUFFERING usually precedes a seek)
              if (event.data === window.YT.PlayerState.BUFFERING) {
                const time = event.target.getCurrentTime();
                if (!isSyncingRef.current && onSeek) {
                  onSeek(time);
                }
              }
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
  }, [isApiLoaded])

  // Handle videoId changes
  useEffect(() => {
    if (playerRef.current && isPlayerReady && videoId) {
      if (typeof playerRef.current.getVideoData === 'function') {
        const currentVideoId = playerRef.current.getVideoData()?.video_id;
        if (currentVideoId !== videoId) {
            if (typeof playerRef.current.loadVideoById === 'function') {
                playerRef.current.loadVideoById(videoId)
                prevTimeRef.current = 0; // Reset time tracking for new video
            }
        }
      }
    }
  }, [videoId, isPlayerReady])

  // Sync player state (play/pause/seek) from remote
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady) return;
    if (typeof playerRef.current.getPlayerState !== 'function') return;

    const playerState = playerRef.current.getPlayerState();
    const playerTime = typeof playerRef.current.getCurrentTime === 'function' 
        ? playerRef.current.getCurrentTime() 
        : 0;
    
    // Sync Play/Pause
    if (isPlaying && playerState !== 1 && playerState !== 3) { 
      if (typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
    } else if (!isPlaying && playerState === 1) {
      if (typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    }

    // Sync Time (if deviation > 1.5s)
    const timeDiff = Math.abs(playerTime - currentTime);
    if (timeDiff > 1.5) {
      if (typeof playerRef.current.seekTo === 'function') {
        // Mark that we're syncing from remote, so we don't fire onSeek
        isSyncingRef.current = true;
        lastSyncTimeRef.current = currentTime;
        playerRef.current.seekTo(currentTime, true);
        
        // Reset the syncing flag after the seek completes
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 500);
      }
    }

  }, [isPlaying, currentTime, isPlayerReady])

  // Event-driven state change handling for seek detection
  const handleStateChangeInternal = (event: any) => {
    if (!isPlayerReady || isSyncingRef.current) {
      if (onStateChange) onStateChange(event);
      return;
    }

    // When the user seeks, the player usually enters BUFFERING (3)
    // We can check the time when it returns to PLAYING (1) or PAUSED (2)
    // or when it starts buffering.
    if (event.data === 1 || event.data === 2 || event.data === 3) {
      const currentTime = event.target.getCurrentTime();
      // Check if this time is significantly different from what we expect
      // If we are not syncing, and the time jumped, it's a local seek
      const lastSyncDiff = Math.abs(currentTime - lastSyncTimeRef.current);
      
      // If it's a buffering state, we might want to wait until it's playing again
      // but for now let's just use the state change as the trigger
      if (onStateChange) onStateChange(event);
    } else {
      if (onStateChange) onStateChange(event);
    }
  };

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-xl relative">
        <div ref={containerRef} className="w-full h-full" />
        
        {!videoId && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-white z-10">
                <div className="text-center p-6 max-w-md">
                    <h3 className="text-xl font-bold mb-2">Ready to Watch?</h3>
                    <p className="text-muted-foreground">Paste a YouTube link below to start the show!</p>
                </div>
            </div>
        )}
    </div>
  )
}

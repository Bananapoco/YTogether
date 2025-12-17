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
        
        // Update prevTime to prevent false seek detection
        prevTimeRef.current = currentTime;
        
        // Reset the syncing flag after the seek completes
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 500);
      }
    }

  }, [isPlaying, currentTime, isPlayerReady])

  // Fast polling for seek detection (local user seeking)
  useEffect(() => {
    if (!isPlayerReady) return;

    const interval = setInterval(() => {
        if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;
        
        const time = playerRef.current.getCurrentTime();
        const diff = time - prevTimeRef.current;
        const absDiff = Math.abs(diff);

        // Detect local seek: time jumped more than expected (> 0.5s for 200ms interval)
        // But ignore if we just did a remote sync
        if (absDiff > 0.75 && !isSyncingRef.current) {
            // Check if this is close to our last sync time (meaning it's the result of a remote sync)
            const isNearSyncTime = Math.abs(time - lastSyncTimeRef.current) < 1;
            
            if (!isNearSyncTime && onSeek) {
                onSeek(time);
            }
        }

        prevTimeRef.current = time;
    }, 200);
    
    return () => clearInterval(interval);
  }, [onSeek, isPlayerReady]);

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

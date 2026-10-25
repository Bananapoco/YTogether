"use client"

import { useEffect, useRef, useState } from "react"

import { loadYouTubeApi } from "./youtube-api"

export interface PlaybackChange {
  isPlaying: boolean
  currentTime: number
}

interface YouTubePlayerProps {
  videoId: string | null
  isPlaying: boolean
  currentTime: number
  onPlaybackChange: (playback: PlaybackChange) => void
  onSeek: (currentTime: number) => void
}

interface RemoteCommand {
  expiresAt: number
  isPlaying: boolean
}

export function YouTubePlayer({
  videoId,
  isPlaying,
  currentTime,
  onPlaybackChange,
  onSeek,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const latestVideoId = useRef(videoId)
  const onPlaybackChangeRef = useRef(onPlaybackChange)
  const onSeekRef = useRef(onSeek)
  const remoteCommandRef = useRef<RemoteCommand | null>(null)
  const [isApiReady, setIsApiReady] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)

  latestVideoId.current = videoId
  onPlaybackChangeRef.current = onPlaybackChange
  onSeekRef.current = onSeek

  useEffect(() => {
    void loadYouTubeApi().then(() => setIsApiReady(true))
  }, [])

  useEffect(() => {
    if (!isApiReady || !containerRef.current || playerRef.current) {
      return
    }

    const player = new window.YT.Player(containerRef.current, {
      height: "100%",
      width: "100%",
      videoId: latestVideoId.current ?? "",
      playerVars: {
        autoplay: 1,
        controls: 1,
        enablejsapi: 1,
        modestbranding: 1,
        origin: window.location.origin,
        rel: 0,
      },
      events: {
        onReady: () => setIsPlayerReady(true),
        onStateChange: (event) => {
          if (isRemotePlayerEvent(event.data, remoteCommandRef.current)) {
            if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.PAUSED) {
              remoteCommandRef.current = null
            }
            return
          }

          if (event.data === YT.PlayerState.BUFFERING) {
            onSeekRef.current(event.target.getCurrentTime())
            return
          }

          if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.PAUSED) {
            onPlaybackChangeRef.current({
              isPlaying: event.data === YT.PlayerState.PLAYING,
              currentTime: event.target.getCurrentTime(),
            })
          }
        },
        onError: (event) => console.error("YouTube player error", event.data),
      },
    })

    playerRef.current = player

    return () => {
      player.destroy()
      playerRef.current = null
    }
  }, [isApiReady])

  useEffect(() => {
    const player = playerRef.current
    if (!player || !isPlayerReady || !videoId) {
      return
    }

    if (player.getVideoData().video_id !== videoId) {
      remoteCommandRef.current = remoteCommand(isPlaying)
      player.loadVideoById(videoId)
    }
  }, [isPlayerReady, isPlaying, videoId])

  useEffect(() => {
    const player = playerRef.current
    if (!player || !isPlayerReady) {
      return
    }

    const playerState = player.getPlayerState()
    const playerIsPlaying = playerState === YT.PlayerState.PLAYING
    const playerIsBuffering = playerState === YT.PlayerState.BUFFERING
    const timeDifference = Math.abs(player.getCurrentTime() - currentTime)

    if (isPlaying && !playerIsPlaying && !playerIsBuffering) {
      remoteCommandRef.current = remoteCommand(true)
      player.playVideo()
    } else if (!isPlaying && playerIsPlaying) {
      remoteCommandRef.current = remoteCommand(false)
      player.pauseVideo()
    }

    if (timeDifference > 1.5) {
      remoteCommandRef.current = remoteCommand(isPlaying)
      player.seekTo(currentTime, true)
    }
  }, [currentTime, isPlayerReady, isPlaying])

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-black">
      <div ref={containerRef} className="h-full w-full" />

      {!videoId && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900 text-white">
          <div className="max-w-md p-6 text-center">
            <h3 className="mb-2 text-xl font-bold">Ready to Watch?</h3>
            <p className="text-zinc-400">Paste a YouTube link below to start the show.</p>
          </div>
        </div>
      )}
    </div>
  )
}

function remoteCommand(isPlaying: boolean): RemoteCommand {
  return { isPlaying, expiresAt: Date.now() + 2000 }
}

function isRemotePlayerEvent(playerState: number, command: RemoteCommand | null) {
  if (!command || Date.now() > command.expiresAt) {
    return false
  }

  if (playerState === YT.PlayerState.BUFFERING) {
    return true
  }

  return command.isPlaying
    ? playerState === YT.PlayerState.PLAYING
    : playerState === YT.PlayerState.PAUSED
}

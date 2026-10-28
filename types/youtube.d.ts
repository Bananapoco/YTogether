declare namespace YT {
  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  interface PlayerOptions {
    height: string
    width: string
    videoId: string
    playerVars: Record<string, string | number>
    events: {
      onReady: (event: PlayerEvent) => void
      onStateChange: (event: OnStateChangeEvent) => void
      onError: (event: OnErrorEvent) => void
    }
  }

  interface PlayerEvent {
    target: Player
  }

  interface OnStateChangeEvent extends PlayerEvent {
    data: number
  }

  interface OnErrorEvent extends PlayerEvent {
    data: number
  }

  class Player {
    constructor(element: HTMLElement, options: PlayerOptions)
    destroy(): void
    getCurrentTime(): number
    getPlayerState(): number
    getVideoData(): { video_id: string }
    cueVideoById(videoId: string): void
    loadVideoById(videoId: string): void
    pauseVideo(): void
    playVideo(): void
    seekTo(seconds: number, allowSeekAhead: boolean): void
  }
}

interface Window {
  YT: {
    Player: typeof YT.Player
    PlayerState: typeof YT.PlayerState
  }
  onYouTubeIframeAPIReady?: () => void
}


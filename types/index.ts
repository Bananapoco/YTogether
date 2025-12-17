export interface User {
  id: string
  name: string
  connected: boolean
  lastSeen?: number
}

export interface RoomState {
  videoId: string | null
  isPlaying: boolean
  currentTime: number
  lastUpdate: number
  users: Record<string, User>
}

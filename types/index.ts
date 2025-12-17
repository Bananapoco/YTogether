export interface User {
  id: string
  name: string
  connected: boolean
  lastSeen?: number
}

export interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: number
  parentId?: string
}

export interface RoomState {
  creatorId?: string
  videoId: string | null
  isPlaying: boolean
  currentTime: number
  lastUpdate: number
  users: Record<string, User>
}

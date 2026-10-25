export interface Participant {
  id: string
  name: string
  connected: boolean
  lastSeen?: number
}

export interface ChatMessage {
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
  participants: Record<string, Participant>
  pausedForParticipant?: boolean
  offlineParticipantName?: string
}

export const EMPTY_ROOM_STATE: RoomState = {
  videoId: null,
  isPlaying: false,
  currentTime: 0,
  lastUpdate: 0,
  participants: {},
}

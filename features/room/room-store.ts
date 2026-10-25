import {
  get,
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
  set,
  update,
} from "firebase/database"

import { db } from "@/lib/firebase"
import type { ChatMessage, Participant, RoomState } from "./types"

const roomPath = (roomId: string) => `rooms/${roomId}`
const ROOM_CODE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

export async function createRoom(creatorId: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const roomId = generateRoomId()
    const result = await runTransaction(ref(db, roomPath(roomId)), (existingRoom) => {
      if (existingRoom) {
        return
      }

      return {
        createdAt: serverTimestamp(),
        creatorId,
        isPlaying: false,
        currentTime: 0,
        lastUpdate: serverTimestamp(),
      }
    })

    if (result.committed) {
      return roomId
    }
  }

  throw new Error("Could not reserve a room code")
}

export async function roomExists(roomId: string) {
  const snapshot = await get(ref(db, roomPath(roomId)))
  return snapshot.exists()
}

export function subscribeToRoom(
  roomId: string,
  onRoomChange: (room: RoomState) => void,
  onRoomRemoved: () => void,
) {
  return onValue(ref(db, roomPath(roomId)), (snapshot) => {
    if (!snapshot.exists()) {
      onRoomRemoved()
      return
    }

    const room = snapshot.val()
    let currentTime = room.currentTime ?? 0

    if (room.isPlaying && room.lastUpdate) {
      const elapsedSeconds = (Date.now() - room.lastUpdate) / 1000
      if (elapsedSeconds > 0 && elapsedSeconds < 3600) {
        currentTime += elapsedSeconds
      }
    }

    onRoomChange({
      creatorId: room.creatorId,
      videoId: room.videoId ?? null,
      isPlaying: room.isPlaying ?? false,
      currentTime,
      lastUpdate: room.lastUpdate ?? 0,
      participants: room.users ?? {},
      pausedForParticipant: room.isPausedByDisconnect ?? false,
      offlineParticipantName: room.offlineUserName,
    })
  })
}

export function connectParticipant(
  roomId: string,
  participant: Pick<Participant, "id" | "name">,
) {
  const participantRef = ref(db, `${roomPath(roomId)}/users/${participant.id}`)
  const connectedRef = ref(db, ".info/connected")

  return onValue(connectedRef, (snapshot) => {
    if (snapshot.val() !== true) {
      return
    }

    void onDisconnect(participantRef).update({
      connected: false,
      lastSeen: serverTimestamp(),
    })

    void set(participantRef, {
      ...participant,
      connected: true,
      lastSeen: serverTimestamp(),
    })
  })
}

export async function leaveRoom(roomId: string, participantId: string) {
  await remove(ref(db, `${roomPath(roomId)}/users/${participantId}`))

  await runTransaction(ref(db, roomPath(roomId)), (room) => {
    if (!room || Object.keys(room.users ?? {}).length === 0) {
      return null
    }
    return room
  })
}

export async function closeRoom(roomId: string) {
  await remove(ref(db, roomPath(roomId)))
}

export async function selectVideo(roomId: string, videoId: string) {
  await update(ref(db, roomPath(roomId)), {
    videoId,
    isPlaying: true,
    currentTime: 0,
    lastUpdate: serverTimestamp(),
  })
}

export async function updatePlayback(
  roomId: string,
  playback: { isPlaying?: boolean; currentTime: number },
) {
  await update(ref(db, roomPath(roomId)), {
    ...playback,
    lastUpdate: serverTimestamp(),
  })
}

export async function pauseForParticipant(roomId: string, participantName: string) {
  await update(ref(db, roomPath(roomId)), {
    isPlaying: false,
    isPausedByDisconnect: true,
    offlineUserName: participantName,
    lastUpdate: serverTimestamp(),
  })
}

export async function resumeAfterReconnect(roomId: string) {
  await update(ref(db, roomPath(roomId)), {
    isPlaying: true,
    isPausedByDisconnect: false,
    offlineUserName: null,
    lastUpdate: serverTimestamp(),
  })
}

export function subscribeToMessages(
  roomId: string,
  onMessagesChange: (messages: ChatMessage[]) => void,
) {
  return onValue(ref(db, `${roomPath(roomId)}/comments`), (snapshot) => {
    const messages = snapshot.exists()
      ? (Object.values(snapshot.val()) as ChatMessage[])
      : []

    onMessagesChange(messages.sort((a, b) => a.timestamp - b.timestamp))
  })
}

export async function sendMessage(
  roomId: string,
  message: Omit<ChatMessage, "id" | "timestamp">,
) {
  const messageRef = push(ref(db, `${roomPath(roomId)}/comments`))

  await set(messageRef, {
    ...message,
    id: messageRef.key,
    timestamp: Date.now(),
  })
}

function generateRoomId() {
  return Array.from({ length: 6 }, () => {
    const index = Math.floor(Math.random() * ROOM_CODE_CHARACTERS.length)
    return ROOM_CODE_CHARACTERS[index]
  }).join("")
}

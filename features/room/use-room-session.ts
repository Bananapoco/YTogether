"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { PlaybackChange } from "@/features/playback/youtube-player"
import { getParticipantId } from "./participant"
import {
  connectParticipant,
  disconnectParticipant,
  pauseForParticipant,
  resumeAfterReconnect,
  selectVideo,
  subscribeToRoom,
  updatePlayback,
} from "./room-store"
import { EMPTY_ROOM_STATE, type RoomState } from "./types"

export function useRoomSession(
  roomId: string,
  participantName: string,
  onRoomRemoved: () => void,
) {
  const [participantId] = useState(() =>
    typeof window === "undefined" ? "" : getParticipantId(),
  )
  const [room, setRoom] = useState<RoomState>(EMPTY_ROOM_STATE)
  const lastSeekAt = useRef(0)
  const onRoomRemovedRef = useRef(onRoomRemoved)

  useEffect(() => {
    onRoomRemovedRef.current = onRoomRemoved
  }, [onRoomRemoved])

  useEffect(() => {
    if (!participantId) {
      return
    }

    const disconnectPresence = connectParticipant(roomId, {
      id: participantId,
      name: participantName,
    })

    return () => {
      disconnectPresence()
      void disconnectParticipant(roomId, participantId)
    }
  }, [participantId, participantName, roomId])

  useEffect(() => {
    const unsubscribe = subscribeToRoom(
      roomId,
      setRoom,
      () => onRoomRemovedRef.current(),
    )

    return unsubscribe
  }, [roomId])

  useEffect(() => {
    if (!participantId) {
      return
    }

    const participants = Object.values(room.participants)
    const offlineParticipant = participants.find((participant) => !participant.connected)
    const everyoneIsOnline =
      participants.length > 0 && participants.every((participant) => participant.connected)
    const coordinatorId = participants
      .filter((participant) => participant.connected)
      .map((participant) => participant.id)
      .sort()[0]

    if (participantId !== coordinatorId) {
      return
    }

    if (offlineParticipant && room.isPlaying && !room.pausedForParticipant) {
      void pauseForParticipant(roomId, offlineParticipant.name)
    } else if (everyoneIsOnline && room.pausedForParticipant) {
      void resumeAfterReconnect(roomId)
    }
  }, [participantId, room.isPlaying, room.participants, room.pausedForParticipant, roomId])

  const chooseVideo = useCallback(
    (videoId: string) => void selectVideo(roomId, videoId),
    [roomId],
  )

  const changePlayback = useCallback(
    (playback: PlaybackChange) => void updatePlayback(roomId, playback),
    [roomId],
  )

  const seek = useCallback(
    (currentTime: number) => {
      if (Date.now() - lastSeekAt.current < 300) {
        return
      }

      lastSeekAt.current = Date.now()
      void updatePlayback(roomId, { currentTime })
    },
    [roomId],
  )

  return {
    room,
    participantId,
    chooseVideo,
    changePlayback,
    seek,
  }
}

"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { PlaybackChange } from "@/features/playback/youtube-player"
import { getParticipantId } from "./participant"
import {
  connectParticipant,
  leaveRoom,
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
  const [participantId, setParticipantId] = useState("")
  const [room, setRoom] = useState<RoomState>(EMPTY_ROOM_STATE)
  const isApplyingRemoteUpdate = useRef(false)
  const lastSeekAt = useRef(0)
  const onRoomRemovedRef = useRef(onRoomRemoved)

  onRoomRemovedRef.current = onRoomRemoved

  useEffect(() => {
    const id = getParticipantId()
    setParticipantId(id)

    const disconnectPresence = connectParticipant(roomId, {
      id,
      name: participantName,
    })

    return () => {
      disconnectPresence()
      void leaveRoom(roomId, id)
    }
  }, [participantName, roomId])

  useEffect(() => {
    let resetRemoteUpdateTimer: ReturnType<typeof setTimeout> | undefined

    const unsubscribe = subscribeToRoom(
      roomId,
      (nextRoom) => {
        isApplyingRemoteUpdate.current = true
        setRoom(nextRoom)

        clearTimeout(resetRemoteUpdateTimer)
        resetRemoteUpdateTimer = setTimeout(() => {
          isApplyingRemoteUpdate.current = false
        }, 300)
      },
      () => onRoomRemovedRef.current(),
    )

    return () => {
      clearTimeout(resetRemoteUpdateTimer)
      unsubscribe()
    }
  }, [roomId])

  useEffect(() => {
    if (!participantId) {
      return
    }

    const participants = Object.values(room.participants)
    const offlineParticipant = participants.find((participant) => !participant.connected)
    const everyoneIsOnline =
      participants.length > 0 && participants.every((participant) => participant.connected)

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
    (playback: PlaybackChange) => {
      if (!isApplyingRemoteUpdate.current) {
        void updatePlayback(roomId, playback)
      }
    },
    [roomId],
  )

  const seek = useCallback(
    (currentTime: number) => {
      if (isApplyingRemoteUpdate.current || Date.now() - lastSeekAt.current < 300) {
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

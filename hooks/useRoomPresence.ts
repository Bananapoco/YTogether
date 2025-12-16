import { useEffect, useState } from "react"
import { ref, onValue, set, onDisconnect, remove, serverTimestamp, get } from "firebase/database"
import { db } from "@/lib/firebase"

export interface User {
  id: string
  name: string
  joinedAt: number
  connected: boolean
}

export function useRoomPresence(roomId: string, username: string | null) {
  const [userId, setUserId] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    if (!roomId || !username) return

    // 1. Get or create unique User ID
    let storedUserId = localStorage.getItem("yt_user_id")
    if (!storedUserId) {
      storedUserId = Math.random().toString(36).substring(2, 15)
      localStorage.setItem("yt_user_id", storedUserId)
    }
    setUserId(storedUserId)

    // 2. References
    const userRef = ref(db, `rooms/${roomId}/users/${storedUserId}`)
    const usersRef = ref(db, `rooms/${roomId}/users`)
    const connectedRef = ref(db, ".info/connected")

    // 3. Handle connection state
    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // We're connected (or reconnected)!
        
        // Add user to room
        const user: User = {
          id: storedUserId!,
          name: username,
          joinedAt: Date.now(),
          connected: true
        }
        
        // Set user data
        set(userRef, user)

        // Remove on disconnect
        onDisconnect(userRef).remove()
        
        setCurrentUser(user)
      }
    })

    // 4. Listen for user list changes
    const unsubscribeUsers = onValue(usersRef, (snap) => {
      const data = snap.val()
      if (data) {
        const userList = Object.values(data) as User[]
        setUsers(userList.sort((a, b) => a.joinedAt - b.joinedAt))
      } else {
        setUsers([])
      }
    })

    return () => {
      unsubscribeConnected()
      unsubscribeUsers()
      // Optional: remove user explicitly on unmount (navigation)
      // remove(userRef) 
      // We rely on onDisconnect for tab close, but usually want explicit remove on navigation
      // However, strict mode double-invokes effects, so be careful.
      // For now, let's leave it to onDisconnect to handle "unexpected" drops, 
      // but we might want to keep history? The prompt says "delete room when all users leave", 
      // implying ephemeral rooms.
    }
  }, [roomId, username])

  return { userId, users, currentUser }
}


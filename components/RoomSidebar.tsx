"use client"

import { useState } from "react"
import { UserList } from "./UserList"
import { Comments } from "./Comments"
import { Settings, Share2, LogOut, MessageSquare, Users, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { User } from "@/types"
import { remove, ref } from "firebase/database"
import { db } from "@/lib/firebase"
import { cn } from "@/lib/utils"

interface RoomSidebarProps {
  roomId: string
  users?: Record<string, User>
  currentUserId: string
  currentUserName: string
  creatorId?: string
}

export function RoomSidebar({ roomId, users = {}, currentUserId, currentUserName, creatorId }: RoomSidebarProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"users" | "comments">("users")

  const currentUser = users[currentUserId]
  const isHost = currentUserId === creatorId

  const copyRoomLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
  }

  const leaveRoom = () => {
    router.push("/")
  }

  const closeRoom = async () => {
    if (confirm("Are you sure you want to close this room? Everyone will be disconnected.")) {
      await remove(ref(db, `rooms/${roomId}`))
      // Navigation handled by RoomClient detecting room deletion
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border-l">
      {/* Room Info Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Room {roomId}</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={copyRoomLink}>
          <Share2 className="mr-2 h-3 w-3" />
          Copy Link
        </Button>

        {/* Tabs */}
        <div className="flex p-1 bg-muted rounded-md mt-2">
          <button
            onClick={() => setActiveTab("users")}
            className={cn(
              "flex-1 flex items-center justify-center py-1.5 text-xs font-medium rounded-sm transition-all",
              activeTab === "users" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={cn(
              "flex-1 flex items-center justify-center py-1.5 text-xs font-medium rounded-sm transition-all",
              activeTab === "comments" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Chat
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "users" ? (
          <div className="h-full overflow-y-auto p-4">
            <UserList users={users} />
          </div>
        ) : (
           <Comments 
             roomId={roomId} 
             userId={currentUserId} 
             userName={currentUser?.name || currentUserName || "Anonymous"} 
           />
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t bg-muted/20 space-y-2">
        <Button 
          variant="destructive" 
          className="w-full justify-start text-white hover:text-destructive-foreground hover:bg-destructive"
          onClick={leaveRoom}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Leave Room
        </Button>
        
        {isHost && (
          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            onClick={closeRoom}
          >
            <Power className="mr-2 h-4 w-4" />
            Close Room
          </Button>
        )}
      </div>
    </div>
  )
}

"use client"

import { UserList } from "./UserList"
import { Settings, Share2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"

export function RoomSidebar({ roomId }: { roomId: string }) {
  const router = useRouter()

  const copyRoomLink = () => {
    // In a real app, this would copy the full URL
    navigator.clipboard.writeText(roomId)
    // Could add toast here
  }

  const leaveRoom = () => {
    router.push("/")
  }

  return (
    <div className="flex flex-col h-full bg-card border-l">
      {/* Room Info Header */}
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg">Room {roomId}</h2>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={copyRoomLink}>
            <Share2 className="mr-2 h-3 w-3" />
            Copy Code
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* User List Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <UserList />
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t bg-muted/20">
        <Button 
          variant="destructive" 
          className="w-full justify-start text-muted-foreground hover:text-destructive-foreground hover:bg-destructive"
          onClick={leaveRoom}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Leave Room
        </Button>
      </div>
    </div>
  )
}


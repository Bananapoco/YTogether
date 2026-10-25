"use client"

import { useState } from "react"
import { Check, LogOut, MessageSquare, Power, Share2, Users } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ParticipantList } from "./participant-list"
import { RoomChat } from "./room-chat"
import { closeRoom } from "./room-store"
import type { Participant } from "./types"

interface RoomSidebarProps {
  roomId: string
  participants: Record<string, Participant>
  currentParticipantId: string
  currentParticipantName: string
  creatorId?: string
}

export function RoomSidebar({
  roomId,
  participants,
  currentParticipantId,
  currentParticipantName,
  creatorId,
}: RoomSidebarProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"participants" | "chat">("participants")
  const [isCopied, setIsCopied] = useState(false)
  const currentParticipant = participants[currentParticipantId]
  const isHost = currentParticipantId === creatorId

  const copyRoomLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy room link", error)
    }
  }

  const handleCloseRoom = async () => {
    const confirmed = confirm(
      "Are you sure you want to close this room? Everyone will be disconnected.",
    )

    if (confirmed) {
      await closeRoom(roomId)
    }
  }

  return (
    <div className="flex h-full flex-col border-l bg-card">
      <div className="space-y-3 border-b p-4">
        <h2 className="text-lg font-bold">Room {roomId}</h2>

        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 w-full text-xs transition-all",
            isCopied && "border-primary bg-primary text-primary-foreground",
          )}
          onClick={copyRoomLink}
        >
          {isCopied ? (
            <>
              <Check className="mr-2 h-3 w-3" /> Copied!
            </>
          ) : (
            <>
              <Share2 className="mr-2 h-3 w-3" /> Copy Link
            </>
          )}
        </Button>

        <div className="mt-2 flex rounded-md bg-muted p-1">
          <TabButton
            active={activeTab === "participants"}
            icon={<Users className="h-3.5 w-3.5" />}
            label="Watchers"
            onClick={() => setActiveTab("participants")}
          />
          <TabButton
            active={activeTab === "chat"}
            icon={<MessageSquare className="h-3.5 w-3.5" />}
            label="Chat"
            onClick={() => setActiveTab("chat")}
          />
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {activeTab === "participants" ? (
          <div className="h-full overflow-y-auto p-4">
            <ParticipantList participants={participants} />
          </div>
        ) : (
          <RoomChat
            roomId={roomId}
            participantId={currentParticipantId}
            participantName={currentParticipant?.name || currentParticipantName}
          />
        )}
      </div>

      <div className="space-y-2 border-t bg-muted/20 p-4">
        <Button
          variant="destructive"
          className="w-full justify-start text-white"
          onClick={() => router.push("/")}
        >
          <LogOut className="mr-2 h-4 w-4" /> Leave Room
        </Button>

        {isHost && (
          <Button
            variant="outline"
            className="w-full justify-start border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleCloseRoom}
          >
            <Power className="mr-2 h-4 w-4" /> Close Room
          </Button>
        )}
      </div>
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}

function TabButton({ active, icon, label, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-sm py-1.5 text-xs font-medium transition-all",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  )
}

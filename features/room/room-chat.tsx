"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Reply, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { sendMessage, subscribeToMessages } from "./room-store"
import type { ChatMessage } from "./types"

interface RoomChatProps {
  roomId: string
  participantId: string
  participantName: string
}

export function RoomChat({ roomId, participantId, participantName }: RoomChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)

  useEffect(() => subscribeToMessages(roomId, setMessages), [roomId])

  const rootMessages = messages.filter((message) => !message.parentId)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!draft.trim()) {
      return
    }

    await sendMessage(roomId, {
      userId: participantId,
      userName: participantName,
      content: draft.trim(),
      ...(replyTo ? { parentId: replyTo.id } : {}),
    })

    setDraft("")
    setReplyTo(null)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {rootMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground opacity-50">
            <MessageSquare className="mb-2 h-12 w-12" />
            <p>No messages yet</p>
          </div>
        ) : (
          rootMessages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              replies={messages.filter((reply) => reply.parentId === message.id)}
              onReply={setReplyTo}
            />
          ))
        )}
      </div>

      <div className="border-t bg-card/50 p-3">
        {replyTo && (
          <div className="flex items-center justify-between rounded-t-md border-x border-t bg-muted/50 px-3 py-1.5 text-xs">
            <span>
              Replying to <span className="font-semibold">{replyTo.userName}</span>
            </span>
            <button
              type="button"
              aria-label="Cancel reply"
              className="hover:text-destructive"
              onClick={() => setReplyTo(null)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={replyTo ? "Write a reply..." : "Add a message..."}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send message">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

interface MessageItemProps {
  message: ChatMessage
  replies: ChatMessage[]
  onReply: (message: ChatMessage) => void
  isReply?: boolean
}

function MessageItem({ message, replies, onReply, isReply = false }: MessageItemProps) {
  return (
    <div className={cn("flex gap-3", isReply && "ml-8 mt-2")}>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
        {message.userName.substring(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{message.userName}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="break-words text-sm text-foreground/90">{message.content}</p>

        {!isReply && (
          <button
            type="button"
            onClick={() => onReply(message)}
            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Reply className="h-3 w-3" /> Reply
          </button>
        )}

        {!isReply &&
          replies.map((reply) => (
            <MessageItem
              key={reply.id}
              message={reply}
              replies={[]}
              onReply={onReply}
              isReply
            />
          ))}
      </div>
    </div>
  )
}

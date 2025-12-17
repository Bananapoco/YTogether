"use client"

import { useState, useEffect, useRef } from "react"
import { ref, push, onValue, set, serverTimestamp } from "firebase/database"
import { db } from "@/lib/firebase"
import { Comment } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, MessageSquare, Reply, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommentsProps {
  roomId: string
  userId: string
  userName: string
}

export function Comments({ roomId, userId, userName }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  
  // Load comments
  useEffect(() => {
    const commentsRef = ref(db, `rooms/${roomId}/comments`)
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const commentList = Object.values(data) as Comment[]
        setComments(commentList.sort((a, b) => a.timestamp - b.timestamp))
      } else {
        setComments([])
      }
    })
    return () => unsubscribe()
  }, [roomId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const commentsRef = ref(db, `rooms/${roomId}/comments`)
    const newCommentRef = push(commentsRef)
    
    const comment: Comment = {
      id: newCommentRef.key!,
      userId,
      userName,
      content: newComment.trim(),
      timestamp: Date.now()
    }

    if (replyTo?.id) {
      comment.parentId = replyTo.id
    }

    set(newCommentRef, comment)
    setNewComment("")
    setReplyTo(null)
  }

  const handleReply = (comment: Comment) => {
    setReplyTo(comment)
  }

  // Helper to get initials
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase()

  // Group comments by parent
  const rootComments = comments.filter(c => !c.parentId)
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId)

  const CommentItem = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
    <div className={cn("flex gap-3", isReply && "ml-8 mt-2")}>
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
        {getInitials(comment.userName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{comment.userName}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm text-foreground/90 break-words">{comment.content}</p>
        
        {!isReply && (
          <button 
            onClick={() => handleReply(comment)}
            className="text-xs text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1"
          >
            <Reply className="h-3 w-3" /> Reply
          </button>
        )}
        
        {/* Render Replies */}
        {!isReply && getReplies(comment.id).map(reply => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {rootComments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <MessageSquare className="h-12 w-12 mb-2" />
            <p>No comments yet</p>
          </div>
        ) : (
          rootComments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t bg-card/50">
        {replyTo && (
          <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 rounded-t-md text-xs border-x border-t">
            <span>Replying to <span className="font-semibold">{replyTo.userName}</span></span>
            <button onClick={() => setReplyTo(null)} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newComment.trim()}>
             <MessageSquare className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}


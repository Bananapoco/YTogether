"use client"

import { User } from "lucide-react"
import { User as UserType } from "@/types"

interface UserListProps {
  users: Record<string, UserType>
}

export function UserList({ users }: UserListProps) {
  const userList = Object.values(users || {})

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
        Watchers ({userList.filter(u => u.connected).length})
      </h3>
      <div className="space-y-2">
        {userList.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No one else is here...</p>
        ) : (
          userList.map((user, index) => (
            <div 
              key={user.id || index}
              className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                user.connected ? "bg-card/50" : "opacity-50"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                user.connected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">
                  {user.connected ? "Watching" : "Offline"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

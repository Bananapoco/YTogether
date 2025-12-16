"use client"

import { User } from "lucide-react"

export function UserList() {
  // Placeholder data
  const users = [
    { id: "1", name: "You (Host)", connected: true },
    { id: "2", name: "Mom", connected: true },
    { id: "3", name: "Dad", connected: false },
  ]

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
        Watchers ({users.filter(u => u.connected).length})
      </h3>
      <div className="space-y-2">
        {users.map((user) => (
          <div 
            key={user.id} 
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
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {user.connected ? "Watching" : "Offline"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


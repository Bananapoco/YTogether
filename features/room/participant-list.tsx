import { UserRound } from "lucide-react"

import type { Participant } from "./types"

interface ParticipantListProps {
  participants: Record<string, Participant>
}

export function ParticipantList({ participants }: ParticipantListProps) {
  const participantList = Object.values(participants)
  const connectedCount = participantList.filter((participant) => participant.connected).length

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Watchers ({connectedCount})
      </h3>
      <div className="space-y-2">
        {participantList.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">No one else is here...</p>
        ) : (
          participantList.map((participant) => (
            <div
              key={participant.id}
              className={`flex items-center gap-3 rounded-md p-2 transition-colors ${
                participant.connected ? "bg-card/50" : "opacity-50"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  participant.connected
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <UserRound className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{participant.name || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">
                  {participant.connected ? "Watching" : "Offline"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

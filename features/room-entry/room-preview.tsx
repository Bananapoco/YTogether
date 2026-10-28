import { Play } from "lucide-react"

const participants = [
  { name: "Alex", color: "bg-sky-500" },
  { name: "Maya", color: "bg-amber-500" },
  { name: "Jordan", color: "bg-emerald-500" },
]

const messages = [
  { name: "Maya", color: "text-amber-600 dark:text-amber-400", text: "hold on, grabbing snacks" },
  { name: "Alex", color: "text-sky-600 dark:text-sky-400", text: "paused, take your time" },
  { name: "Jordan", color: "text-emerald-600 dark:text-emerald-400", text: "this next part is so good" },
]

export function RoomPreview() {
  return (
    <div aria-hidden className="w-full select-none overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-mono text-xs tracking-widest text-muted-foreground">ROOM K7Q2XD</span>
        <div className="flex -space-x-2">
          {participants.map((participant) => (
            <Avatar key={participant.name} {...participant} />
          ))}
        </div>
      </div>

      <div className="relative aspect-video overflow-hidden bg-gradient-to-b from-amber-200 via-rose-400 to-indigo-950">
        <div className="absolute -bottom-1/3 -left-1/4 h-2/3 w-3/4 rounded-[50%] bg-indigo-950" />
        <div className="absolute -bottom-1/4 right-[-15%] h-2/3 w-3/4 rounded-[50%] bg-slate-900" />
        <div className="absolute left-[58%] top-[30%] h-10 w-10 rounded-full bg-amber-100/90" />
        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 py-1 pl-1 pr-3 text-xs text-white backdrop-blur">
          <Avatar name="Alex" color="bg-sky-500" size="sm" />
          Alex paused at 2:14
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/50 p-3 text-white">
            <Play className="h-6 w-6 fill-current" />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 space-y-1.5 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6">
          <div className="h-1 w-full rounded-full bg-white/30">
            <div className="relative h-full w-[23%] rounded-full bg-primary">
              <span className="absolute -right-1.5 -top-1 h-3 w-3 rounded-full bg-primary" />
            </div>
          </div>
          <div className="font-mono text-[11px] text-white/80">2:14 / 9:41</div>
        </div>
      </div>

      <ul className="space-y-1.5 px-4 py-3 text-sm">
        {messages.map((message) => (
          <li key={message.text}>
            <span className={`font-medium ${message.color}`}>{message.name}</span>{" "}
            <span className="text-muted-foreground">{message.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Avatar({ name, color, size = "md" }: { name: string; color: string; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-5 w-5 text-[10px]" : "h-7 w-7 text-xs ring-2 ring-card"

  return (
    <span className={`flex items-center justify-center rounded-full font-semibold text-white ${color} ${sizeClass}`}>
      {name[0]}
    </span>
  )
}

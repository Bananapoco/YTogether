import { Pause, Play } from "lucide-react"

import { previewPeople as people, type PreviewPerson } from "./preview-people"

const feed: ({ kind: "message"; name: PreviewPerson; text: string } | { kind: "event"; text: string })[] = [
  { kind: "message", name: "Maya", text: "hold on, grabbing snacks" },
  { kind: "event", text: "Alex paused at 2:14" },
  { kind: "message", name: "Alex", text: "take your time" },
  { kind: "message", name: "Jordan", text: "this next part is so good" },
]

export function RoomPreview() {
  return (
    <div aria-hidden className="w-full select-none overflow-hidden rounded-2xl border bg-card">
      <div className="relative aspect-video overflow-hidden bg-gradient-to-b from-amber-200 via-rose-400 to-indigo-950">
        <div className="absolute -bottom-1/3 -left-1/4 h-2/3 w-3/4 rounded-[50%] bg-indigo-950" />
        <div className="absolute -bottom-1/4 right-[-15%] h-2/3 w-3/4 rounded-[50%] bg-slate-900" />
        <div className="absolute left-[58%] top-[30%] h-10 w-10 rounded-full bg-amber-100/90" />
        <div className="absolute inset-0 bg-black/30" />

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

      <ul className="space-y-3 px-4 py-4 text-sm">
        {feed.map((item) =>
          item.kind === "event" ? (
            <li key={item.text} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex h-7 w-7 items-center justify-center">
                <Pause className="h-3.5 w-3.5 fill-current" />
              </span>
              {item.text}
            </li>
          ) : (
            <li key={item.text} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${people[item.name].color}`}
              >
                {item.name[0]}
              </span>
              <p>
                <span className={`font-medium ${people[item.name].text}`}>{item.name}</span>{" "}
                <span className="text-muted-foreground">{item.text}</span>
              </p>
            </li>
          ),
        )}
      </ul>
    </div>
  )
}

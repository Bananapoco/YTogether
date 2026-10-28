import { Copy, Link2, MousePointer2 } from "lucide-react"

import { previewPeople, type PreviewPerson } from "./preview-people"

const steps = [
  {
    title: "Paste a link",
    text: "Any YouTube video, short, or livestream. The room opens with it ready to go.",
    visual: <LinkVisual />,
  },
  {
    title: "Send the room",
    text: "Send friends the six-character room code. They enter it here, pick a name, and they're in.",
    visual: <CodeVisual />,
  },
  {
    title: "Watch in sync",
    text: "When anyone plays, pauses, or skips ahead, everyone follows. Chat sits right next to the video.",
    visual: <SyncVisual />,
  },
]

export function HowItWorks() {
  return (
    <section className="border-t bg-muted">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">How it works</h2>
        <ol className="mt-12 grid gap-12 md:grid-cols-3 md:gap-10">
          {steps.map((step, index) => (
            <li key={step.title}>
              <div aria-hidden className="flex h-28 items-center justify-center">
                {step.visual}
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Cursor({ className }: { className: string }) {
  return (
    <MousePointer2
      className={`absolute h-5 w-5 fill-black text-white drop-shadow-md ${className}`}
      strokeWidth={1.5}
    />
  )
}

function LinkVisual() {
  return (
    <div className="relative flex w-full items-center gap-2 rounded-lg border bg-background p-1.5 pl-3 shadow-sm">
      <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate text-sm">youtube.com/watch?v=aqz-KE</span>
      <span className="ml-auto shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
        Start
      </span>
      <Cursor className="bottom-0 right-1" />
    </div>
  )
}

function CodeVisual() {
  return (
    <div className="relative flex items-center gap-3 rounded-lg border bg-background py-2 pl-4 pr-2 shadow-sm">
      <span className="font-mono text-2xl font-semibold tracking-[0.2em]">K7Q2XD</span>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-md border bg-muted">
        <Copy className="h-4 w-4 text-muted-foreground" />
        <span className="absolute -top-8 rounded-md bg-foreground px-2 py-0.5 text-[11px] font-medium text-background">
          Copied
        </span>
      </span>
      <Cursor className="-bottom-1 right-1" />
    </div>
  )
}

function SyncVisual() {
  const viewers: PreviewPerson[] = ["Alex", "Maya", "Jordan"]

  return (
    <div className="w-full space-y-3">
      {viewers.map((name) => (
        <div key={name} className="flex items-center gap-3">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${previewPeople[name].color}`}
          >
            {name[0]}
          </span>
          <span className="h-1.5 flex-1 rounded-full bg-accent">
            <span className="block h-full w-[23%] rounded-full bg-primary" />
          </span>
          <span className="font-mono text-xs text-muted-foreground">2:14</span>
        </div>
      ))}
    </div>
  )
}

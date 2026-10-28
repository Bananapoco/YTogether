import { Copy, Link2, Play } from "lucide-react"

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
        <ol className="mt-12 grid gap-12 md:grid-cols-3 md:gap-0">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col items-center text-center">
              <div className="relative flex w-full justify-center">
                {index > 0 && (
                  <span className="absolute right-1/2 top-1/2 hidden w-full border-t-2 border-dashed border-primary/30 md:block" />
                )}
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-muted text-sm font-bold text-primary">
                  {index + 1}
                </span>
              </div>
              <div
                aria-hidden
                className="mt-6 flex h-28 w-full max-w-64 items-center justify-center rounded-xl border bg-background px-4"
              >
                {step.visual}
              </div>
              <h3 className="mt-5 font-semibold">{step.title}</h3>
              <p className="mt-1 max-w-64 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function LinkVisual() {
  return (
    <div className="flex w-full items-center gap-1.5 rounded-lg border bg-card p-1.5 pl-2.5">
      <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate text-xs text-muted-foreground">youtube.com/watch?v=aqz-KE</span>
      <span className="ml-auto shrink-0 rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">
        Start
      </span>
    </div>
  )
}

function CodeVisual() {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-2.5">
      <span className="font-mono text-lg font-semibold tracking-[0.25em]">K7Q2XD</span>
      <Copy className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

function SyncVisual() {
  const viewers = ["bg-sky-500", "bg-amber-500", "bg-emerald-500"]

  return (
    <div className="w-full space-y-2.5">
      {viewers.map((color, index) => (
        <div key={color} className="flex items-center gap-2">
          <span className={`h-5 w-5 shrink-0 rounded-full ${color}`} />
          {index === 0 ? (
            <Play className="h-3 w-3 shrink-0 fill-current text-muted-foreground" />
          ) : (
            <span className="w-3 shrink-0" />
          )}
          <span className="h-1 flex-1 rounded-full bg-accent">
            <span className="block h-full w-[40%] rounded-full bg-primary" />
          </span>
        </div>
      ))}
    </div>
  )
}

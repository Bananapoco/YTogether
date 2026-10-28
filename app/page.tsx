import { Tv } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { RoomActions } from "@/features/room-entry/room-actions"
import { RoomPreview } from "@/features/room-entry/room-preview"

const steps = [
  {
    title: "Paste a link",
    text: "Any YouTube video, short, or livestream. The room opens with it ready to go.",
  },
  {
    title: "Send the room",
    text: "Send friends the six-character room code. They enter it here, pick a name, and they're in.",
  },
  {
    title: "Watch in sync",
    text: "When anyone plays, pauses, or skips ahead, everyone follows. Chat sits right next to the video.",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-1">
            <Tv className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">YTogether</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-5xl px-4">
        <div className="grid items-center gap-10 pb-16 pt-8 md:grid-cols-2 md:pb-20 md:pt-14">
          <section className="flex flex-col gap-4 text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Watch YouTube <br className="hidden md:block" />
              <span className="text-primary">Together</span>
            </h1>
            <p className="mx-auto max-w-[460px] text-lg text-muted-foreground md:mx-0">
              Paste a link, send the room to friends. Play, pause, and skip stay in sync for
              everyone, and nobody needs an account.
            </p>
            <div className="mt-4 flex justify-center md:justify-start">
              <RoomActions />
            </div>
          </section>

          <RoomPreview />
        </div>

        <section className="border-t py-14 md:py-16">
          <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="space-y-2">
                <span className="text-sm font-semibold text-primary">{index + 1}</span>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}

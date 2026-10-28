import { Tv } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { HowItWorks } from "@/features/room-entry/how-it-works"
import { RoomActions } from "@/features/room-entry/room-actions"
import { RoomPreview } from "@/features/room-entry/room-preview"

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

      <main>
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 pb-16 pt-8 md:grid-cols-2 md:pb-24 md:pt-14">
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

        <HowItWorks />
      </main>
    </div>
  )
}

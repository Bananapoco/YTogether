import { Tv, Users, Video } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { RoomActions } from "@/features/room-entry/room-actions"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1">
              <Tv className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">YTogether</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="grid w-full max-w-5xl items-center gap-8 md:grid-cols-2">
          <section className="flex flex-col gap-4 text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Watch YouTube <br className="hidden md:block" />
              <span className="text-primary">Together</span>
            </h1>
            <p className="mx-auto max-w-[500px] text-lg text-muted-foreground md:mx-0">
              Sync up with friends and family. Watch videos in real time, wherever you are.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-4 md:justify-start">
              <FeaturePill icon={<Video className="h-4 w-4" />} label="Real-time Sync" />
              <FeaturePill icon={<Users className="h-4 w-4" />} label="No Account Needed" />
            </div>
          </section>

          <RoomActions />
        </div>
      </main>
    </div>
  )
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy, Link2, MessageCircle, MousePointer2, Pause, Play } from "lucide-react"

import { previewPeople, type PreviewPerson } from "./preview-people"
import { VideoArt } from "./video-art"

const steps = [
  {
    title: "Paste a link",
    text: "Any YouTube video, short, or livestream. The room opens with it ready to go",
    duration: 4500,
    scene: <LinkScene />,
  },
  {
    title: "Send the room",
    text: "Send friends the six-character room code. They enter it here, pick a name, and they're in",
    duration: 6500,
    scene: <SendScene />,
  },
  {
    title: "Watch in sync",
    text: "When anyone plays, pauses, or skips ahead, everyone follows!",
    duration: 4500,
    scene: <SyncScene />,
  },
]

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const [inView, setInView] = useState(false)
  const [visit, setVisit] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) {
          setVisit((count) => count + 1)
        }
      },
      { threshold: 0.5 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) {
      return
    }

    const timeout = setTimeout(() => setActive((step) => (step + 1) % steps.length), steps[active].duration)
    return () => clearTimeout(timeout)
  }, [active, inView, visit])

  return (
    <section ref={sectionRef} className="border-t bg-muted">
      <div className="mx-auto grid max-w-5xl gap-x-10 gap-y-6 px-4 py-12 md:grid-cols-2">
        <h2 className="text-2xl font-bold tracking-tight md:col-span-2 md:text-3xl">How it works</h2>
        <ol className="space-y-1.5">
          {steps.map((step, index) => {
            const isActive = index === active

            return (
              <li key={step.title}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  className={`w-full rounded-xl p-4 text-left transition-colors ${isActive ? "bg-background" : "hover:bg-background/60"}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"}`}
                    >
                      {index + 1}
                    </span>
                    <h3
                      className={`text-lg font-semibold transition-colors ${isActive ? "" : "text-muted-foreground"}`}
                    >
                      {step.title}
                    </h3>
                  </div>
                  {isActive && <p className="mt-1.5 pl-12 text-muted-foreground">{step.text}</p>}
                </button>
              </li>
            )
          })}
        </ol>

        <div aria-hidden className="relative h-72 overflow-hidden rounded-2xl border bg-background">
          {inView && (
            <div
              key={`${active}-${visit}`}
              className="hiw-anim absolute inset-0 flex items-center justify-center"
              style={anim("hiw-pop", 0.3)}
            >
              {steps[active].scene}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function anim(name: string, duration: number, delay = 0, easing = "ease-out"): React.CSSProperties {
  return { animation: `${name} ${duration}s ${easing} ${delay}s both` }
}

function Cursor({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <MousePointer2
      className={`hiw-anim absolute h-5 w-5 fill-black text-white drop-shadow-md ${className}`}
      strokeWidth={1.5}
      style={style}
    />
  )
}

function KeyHint({ className, delay }: { className: string; delay: number }) {
  return (
    <span
      className={`hiw-anim absolute rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold opacity-0 shadow-sm ${className}`}
      style={anim("hiw-flash", 0.7, delay)}
    >
      ⌘V
    </span>
  )
}

function LinkScene() {
  return (
    <div className="w-full max-w-[380px] px-4">
      <div className="relative flex w-full items-center gap-2 rounded-lg border bg-background p-2 pl-3 shadow-sm">
        <span
          className="hiw-anim absolute -top-10 right-0 flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
          style={anim("hiw-pop", 0.25, 2.5)}
        >
          <Check className="h-3 w-3" /> Copied
        </span>
        <Link2 className="h-5 w-5 shrink-0 text-muted-foreground" />
        <span className="hiw-anim truncate text-base" style={anim("hiw-pop", 0.2, 0.7)}>
          youtube.com/watch?v=aqz-KE
        </span>
        <KeyHint className="-top-8 left-2" delay={0.4} />
        <span className="relative ml-auto shrink-0">
          <span
            className="hiw-anim flex items-center gap-1 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground"
            style={anim("hiw-press", 0.25, 2.1)}
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Start
          </span>
          <Cursor className="-bottom-2 right-0" style={anim("hiw-cursor", 0.7, 1.3)} />
        </span>
      </div>
    </div>
  )
}

const sentBubble = "self-end rounded-2xl rounded-br-md bg-[#0A84FF] px-3 py-1.5 text-white"
const receivedBubble =
  "self-start rounded-2xl rounded-bl-md bg-[#E9E9EB] px-3 py-1.5 text-black dark:bg-[#3A3A3C] dark:text-white"

function AppWindow({
  title,
  className = "",
  style,
  children,
}: {
  title: React.ReactNode
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <div
      className={`hiw-anim absolute inset-0 flex flex-col overflow-hidden rounded-xl border bg-background shadow-md ${className}`}
      style={style}
    >
      <div className="flex items-center gap-1.5 border-b bg-muted px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="ml-2 text-[11px] font-medium text-muted-foreground">{title}</span>
      </div>
      {children}
    </div>
  )
}

function SendScene() {
  const viewers: PreviewPerson[] = ["Alex", "Maya", "Jordan"]

  return (
    <>
      <div
        className="hiw-anim absolute inset-0 text-xs text-white opacity-0"
        style={anim("hiw-out", 0.3, 2.7, "ease-in")}
      >
        <VideoArt className="absolute inset-0" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-3 pb-8">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="flex h-4 w-6 items-center justify-center rounded-sm bg-primary"><Play className="h-2 w-2 fill-white text-white" /></span> YTogether
          </span>
          <span className="flex items-center gap-2 rounded-lg bg-white/15 py-1 pl-2.5 pr-1 backdrop-blur">
            <span className="font-mono text-sm font-semibold tracking-[0.15em]">K7Q2XD</span>
            <span
              className="hiw-anim relative flex h-6 w-6 items-center justify-center rounded-md bg-white/20"
              style={anim("hiw-press", 0.25, 1.0)}
            >
              <Copy className="h-3 w-3" />
              <Cursor className="-bottom-2.5 -right-1" style={anim("hiw-cursor", 0.6, 0.3)} />
            </span>
          </span>
        </div>

        <span
          className="hiw-anim absolute right-3 top-14 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-black"
          style={anim("hiw-pop", 0.25, 1.1)}
        >
          <Check className="h-3 w-3" /> Copied
        </span>

        <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
          <span className="block h-1 rounded-full bg-white/30">
            <span className="block h-full w-[36%] rounded-full bg-primary" />
          </span>
          <div className="flex items-center gap-3">
            <Play className="h-3.5 w-3.5 fill-current" />
            <span className="font-medium tabular-nums text-white/80">4:12 / 11:58</span>
            <span className="ml-auto flex -space-x-1.5">
              {viewers.map((name) => (
                <span
                  key={name}
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-black/40 ${previewPeople[name].color}`}
                >
                  {name[0]}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-52 w-[300px] text-xs">
        <AppWindow title="Messages · Maya" style={anim("hiw-in", 0.35, 2.85)}>
          <div className="flex flex-1 flex-col justify-end gap-1 p-3">
            <span className={receivedBubble}>yo can I join</span>
            <span
              className={`hiw-anim ${sentBubble} font-mono font-semibold tracking-widest`}
              style={anim("hiw-pop", 0.3, 4.3)}
            >
              K7Q2XD
            </span>
            <span className={`hiw-anim ${receivedBubble} mt-1`} style={anim("hiw-pop", 0.3, 5.2)}>
              omw!
            </span>
          </div>
          <div className="relative mx-3 mb-3 flex h-7 items-center rounded-full border px-3 text-muted-foreground">
            iMessage
            <span
              className="hiw-anim absolute inset-y-0 left-3 right-3 flex items-center bg-background font-mono font-semibold tracking-widest text-foreground opacity-0"
              style={anim("hiw-flash", 0.75, 3.6)}
            >
              K7Q2XD
            </span>
            <KeyHint className="-top-7 right-0" delay={3.4} />
          </div>
        </AppWindow>

        <div
          className="hiw-anim absolute left-1/2 top-1/2 z-10 -ml-[66px] -mt-9 flex gap-3 rounded-2xl bg-black/75 p-3 opacity-0 backdrop-blur"
          style={anim("hiw-flash", 1.0, 2.0)}
        >
          <span
            className="hiw-anim absolute left-1.5 top-1.5 h-[60px] w-[60px] rounded-xl bg-white/20"
            style={{
              ...anim("hiw-switch", 0.2, 2.4),
              ["--switch-x" as string]: "60px",
            }}
          />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Play className="h-3.5 w-3.5 fill-white text-white" />
          </span>
          <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#34C759]">
            <MessageCircle className="h-6 w-6 fill-white text-white" />
          </span>
        </div>
      </div>
    </>
  )
}

function SyncScene() {
  const viewers: PreviewPerson[] = ["Alex", "Maya", "Jordan"]
  const fill = {
    ...anim("hiw-fill", 2, 0.3, "linear"),
    ["--fill-from" as string]: "10%",
    ["--fill-to" as string]: "38%",
  }

  return (
    <div className="flex w-full max-w-[380px] flex-col items-center gap-6 px-4">
      <div className="w-full space-y-4">
        {viewers.map((name) => (
          <div key={name} className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${previewPeople[name].color}`}
            >
              {name[0]}
            </span>
            <span className="h-2 flex-1 rounded-full bg-accent">
              <span className="hiw-anim block h-full w-[38%] rounded-full bg-primary" style={fill} />
            </span>
          </div>
        ))}
      </div>
      <span
        className="hiw-anim flex items-center gap-2 rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background"
        style={anim("hiw-pop", 0.3, 2.3)}
      >
        <Pause className="h-4 w-4 fill-current" /> Alex paused for everyone
      </span>
    </div>
  )
}

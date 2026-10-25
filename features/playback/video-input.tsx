"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { extractVideoId } from "./youtube-api"

interface VideoInputProps {
  onVideoId: (videoId: string) => void
}

export function VideoInput({ onVideoId }: VideoInputProps) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const videoId = extractVideoId(value)

    if (!videoId) {
      setError("Enter a valid YouTube link or video ID.")
      return
    }

    onVideoId(videoId)
    setValue("")
    setError("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            aria-invalid={Boolean(error)}
            placeholder="Paste a YouTube URL..."
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setError("")
            }}
            className="border-input/50 bg-card/50 pl-9"
          />
        </div>
        <Button type="submit">Load Video</Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  )
}

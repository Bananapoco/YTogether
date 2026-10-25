"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { extractVideoId } from "@/features/playback/youtube-api"

interface VideoInputProps {
  onVideoId: (id: string) => void
}

export function VideoInput({ onVideoId }: VideoInputProps) {
  const [url, setUrl] = useState("")
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    const videoId = extractVideoId(url)
    if (videoId) {
      onVideoId(videoId)
      setUrl("")
    } else {
      alert("Invalid YouTube URL")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Paste YouTube URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="pl-9 bg-card/50 border-input/50"
        />
      </div>
      <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
        Load Video
      </Button>
    </form>
  )
}

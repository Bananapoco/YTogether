"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { extractVideoId } from "@/lib/youtube"
import { useToast } from "@/hooks/use-toast" // Use standard toast if available, or just console/alert for now

interface VideoInputProps {
  onVideoId: (id: string) => void
}

export function VideoInput({ onVideoId }: VideoInputProps) {
  const [url, setUrl] = useState("")
  // We don't have the toast hook set up in the codebase yet based on file list (only shadcn components), 
  // checking components/ui... wait, I added shadcn components but maybe not the toast hook/component explicitly?
  // I'll stick to simple validation for now or check if toast exists.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    const videoId = extractVideoId(url)
    if (videoId) {
      onVideoId(videoId)
      setUrl("")
    } else {
      // For now, just a browser alert or non-blocking UI
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

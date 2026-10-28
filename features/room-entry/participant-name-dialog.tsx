"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ParticipantNameDialogProps {
  open: boolean
  title: string
  description?: string
  submitLabel: string
  submitIcon?: React.ReactNode
  submittingLabel?: string
  name: string
  isSubmitting?: boolean
  onNameChange: (name: string) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function ParticipantNameDialog({
  open,
  title,
  description,
  submitLabel,
  submitIcon,
  submittingLabel = "Working...",
  name,
  isSubmitting = false,
  onNameChange,
  onOpenChange,
  onSubmit,
}: ParticipantNameDialogProps) {
  const [error, setError] = useState("")
  const inputId = `${submitLabel.replace(/\s+/g, "-").toLowerCase()}-name`

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setError("")
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent
        className="gap-6 sm:max-w-md"
        {...(!description && { "aria-describedby": undefined })}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form
          noValidate
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (!name.trim()) {
              setError("Enter a name so others know who's here.")
              return
            }
            onSubmit()
          }}
        >
          <Label htmlFor={inputId} className="sr-only">
            Your name
          </Label>
          <div className="flex gap-2">
            <Input
              id={inputId}
              value={name}
              aria-invalid={Boolean(error)}
              onChange={(event) => {
                onNameChange(event.target.value)
                setError("")
              }}
              placeholder="Your name"
              className="h-11 flex-1"
              autoFocus
            />
            <Button type="submit" size="lg" className="h-11 px-5" disabled={isSubmitting}>
              {!isSubmitting && submitIcon}
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </div>
          {error && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-3 w-3" /> {error}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}

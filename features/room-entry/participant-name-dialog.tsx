"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ParticipantNameDialogProps {
  open: boolean
  title: string
  description: string
  submitLabel: string
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
  submittingLabel = "Working...",
  name,
  isSubmitting = false,
  onNameChange,
  onOpenChange,
  onSubmit,
}: ParticipantNameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <div className="grid gap-2 py-4">
            <Label htmlFor={`${submitLabel}-name`}>Your Name</Label>
            <Input
              id={`${submitLabel}-name`}
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="e.g. Alex"
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

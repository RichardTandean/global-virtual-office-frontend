"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, Send, X } from "lucide-react"
import { CommentItem } from "@/types/comment"
import { cn } from "@/lib/utils"

interface CommentInputProps {
  taskId: string
  videoSubmissionId?: string
  parentId?: string
  onCommentAdded: (comment: CommentItem) => void
  onCancel?: () => void
  placeholder?: string
}

export default function CommentInput({
  taskId,
  videoSubmissionId,
  parentId,
  onCommentAdded,
  onCancel,
  placeholder = "Tulis komentar...",
}: CommentInputProps) {
  const [content, setContent] = useState("")
  const [showTimestamp, setShowTimestamp] = useState(false)
  const [timestampInput, setTimestampInput] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function parseTimestamp(val: string): number | undefined {
    const parts = val.trim().split(":")
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10)
      const secs = parseInt(parts[1], 10)
      if (!isNaN(mins) && !isNaN(secs) && mins >= 0 && secs >= 0) {
        return mins * 60 + secs
      }
    }
    return undefined
  }

  async function handleSubmit() {
    if (!content.trim()) return
    setSubmitting(true)

    const timestampSeconds = showTimestamp
      ? parseTimestamp(timestampInput)
      : undefined

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          videoSubmissionId,
          content: content.trim(),
          timestampSeconds,
          parentId,
        }),
      })
      if (!res.ok) throw new Error("Gagal kirim komentar")
      const comment = await res.json()
      onCommentAdded(comment)
      setContent("")
      setTimestampInput("")
      setShowTimestamp(false)
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={cn(
        "rounded-md border border-line bg-surface p-3 space-y-2",
        parentId && "ml-8"
      )}
    >
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={parentId ? 2 : 3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            handleSubmit()
          }
        }}
      />

      {showTimestamp && (
        <div className="flex items-center gap-2">
          <Label className="shrink-0">Timestamp</Label>
          <Input
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            placeholder="MM:SS"
            className="h-7 w-24"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger
            onClick={() => setShowTimestamp(!showTimestamp)}
            className="inline-flex items-center gap-1 rounded-xs px-2 py-1 text-[11px] text-ink-secondary hover:text-ink hover:bg-subtle transition-colors cursor-pointer"
          >
            <Clock className="size-3" />
            {showTimestamp ? "Hapus timestamp" : "Timestamp"}
          </TooltipTrigger>
          <TooltipContent>
            Tambahkan timestamp video untuk komentar ini
          </TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-1">
          {onCancel && (
            <Button variant="ghost" size="xs" onClick={onCancel}>
              <X />
              Batal
            </Button>
          )}
          <Button
            size="xs"
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
          >
            <Send />
            {submitting ? "Mengirim..." : "Kirim"}
          </Button>
        </div>
      </div>
    </div>
  )
}

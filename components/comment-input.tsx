"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, Send, X } from "lucide-react"
import { CommentItem } from "@/types/comment"

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

    const timestampSeconds = showTimestamp ? parseTimestamp(timestampInput) : undefined

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
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className={parentId ? "mt-2 ml-8" : ""}>
      <CardContent className={`${parentId ? "p-3" : "p-4"}`}>
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={parentId ? 2 : 3}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit()
              }
            }}
          />

          {showTimestamp && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Timestamp (MM:SS):</Label>
              <Input
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                placeholder="1:23"
                className="h-7 w-24 text-xs"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger
                onClick={() => setShowTimestamp(!showTimestamp)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-muted cursor-pointer"
              >
                <Clock className="h-3 w-3" />
                {showTimestamp ? "Hapus timestamp" : "Timestamp"}
              </TooltipTrigger>
              <TooltipContent>
                Tambahkan timestamp video untuk komentar ini
              </TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="h-7 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Batal
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() || submitting}
                className="h-7 text-xs gap-1"
              >
                <Send className="h-3 w-3" />
                {submitting ? "Mengirim..." : "Kirim"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

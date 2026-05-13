"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import CommentInput from "./comment-input"
import { CommentItem, buildCommentTree, formatTimestamp } from "@/types/comment"
import {
  MessageSquare,
  CornerDownRight,
  ChevronDown,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CommentListProps {
  taskId: string
  videoSubmissionId?: string
  currentUserId: string
  currentUserRole: string
  onSeekVideo?: (seconds: number) => void
  compact?: boolean
}

function CommentNode({
  comment,
  depth,
  taskId,
  videoSubmissionId,
  currentUserId,
  currentUserRole,
  onSeekVideo,
  onDeleted,
}: {
  comment: CommentItem
  depth: number
  taskId: string
  videoSubmissionId?: string
  currentUserId: string
  currentUserRole: string
  onSeekVideo?: (seconds: number) => void
  onDeleted: (id: string) => void
}) {
  const [showReply, setShowReply] = useState(false)
  const [open, setOpen] = useState(depth < 2)
  const maxDepth = 2

  const initials = comment.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const roleLabel =
    comment.user.role === "KoreaTeam"
      ? "Korea"
      : comment.user.role === "Admin"
      ? "Admin"
      : "Editor"

  return (
    <div className={depth > 0 ? "ml-7" : ""}>
      <div className="flex items-start gap-3 py-3">
        <Avatar size="sm" className="shrink-0">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-medium text-ink">
              {comment.user.name}
            </span>
            <span className="text-[9px] font-medium uppercase tracking-wider text-ink-muted px-1.5 py-0.5 rounded-xs border border-line">
              {roleLabel}
            </span>
            {comment.videoSubmission && (
              <span className="font-mono text-[10px] text-accent bg-accent-subtle px-1.5 py-0.5 rounded-xs">
                V{comment.videoSubmission.version}
              </span>
            )}
            <span className="ml-auto text-[10px] font-mono tabular-nums text-ink-muted">
              {new Date(comment.createdAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {comment.timestampSeconds != null && onSeekVideo && (
            <Tooltip>
              <TooltipTrigger
                onClick={() => onSeekVideo(comment.timestampSeconds!)}
                className="mt-1 inline-flex items-center gap-1 rounded-xs border border-line bg-subtle px-1.5 py-0.5 text-[10px] font-mono tabular-nums cursor-pointer hover:bg-elevated transition-colors"
              >
                {formatTimestamp(comment.timestampSeconds)}
              </TooltipTrigger>
              <TooltipContent>Klik untuk lompat ke bagian video ini</TooltipContent>
            </Tooltip>
          )}

          <p className="mt-1.5 text-[12px] leading-relaxed text-ink whitespace-pre-wrap">
            {comment.content}
          </p>

          <div className="flex items-center gap-1 mt-1.5">
            {depth < maxDepth && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-[10px] text-ink-secondary hover:text-ink hover:bg-subtle transition-colors"
              >
                <CornerDownRight className="size-2.5" />
                Balas
              </button>
            )}

            {comment.userId === currentUserId && (
              <button
                onClick={async () => {
                  const res = await fetch(`/api/comments/${comment.id}`, {
                    method: "DELETE",
                  })
                  if (res.ok) {
                    onDeleted(comment.id)
                    toast.success("Komentar dihapus")
                  }
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-[10px] transition-colors",
                  "text-ink-muted hover:text-status-danger hover:bg-status-danger/10"
                )}
              >
                <Trash2 className="size-2.5" />
                Hapus
              </button>
            )}
          </div>

          {showReply && (
            <div className="mt-2">
              <CommentInput
                taskId={taskId}
                videoSubmissionId={videoSubmissionId}
                parentId={comment.id}
                placeholder="Tulis balasan..."
                onCommentAdded={() => {
                  setShowReply(false)
                }}
                onCancel={() => setShowReply(false)}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <Collapsible open={open} onOpenChange={setOpen}>
          {depth < maxDepth ? (
            <>
              {comment.replies.map((reply) => (
                <CommentNode
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  taskId={taskId}
                  videoSubmissionId={videoSubmissionId}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  onSeekVideo={onSeekVideo}
                  onDeleted={onDeleted}
                />
              ))}
            </>
          ) : (
            <>
              <CollapsibleTrigger className="inline-flex items-center gap-1 rounded-xs px-2 py-1 text-[10px] ml-7 cursor-pointer text-ink-secondary hover:text-ink hover:bg-subtle transition-colors">
                <ChevronDown className="size-2.5" />
                {open ? "Sembunyikan" : "Lihat"} {comment.replies.length} balasan
              </CollapsibleTrigger>
              <CollapsibleContent>
                {comment.replies.map((reply) => (
                  <CommentNode
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    taskId={taskId}
                    videoSubmissionId={videoSubmissionId}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    onSeekVideo={onSeekVideo}
                    onDeleted={onDeleted}
                  />
                ))}
              </CollapsibleContent>
            </>
          )}
        </Collapsible>
      )}
    </div>
  )
}

export default function CommentList({
  taskId,
  videoSubmissionId,
  currentUserId,
  currentUserRole,
  onSeekVideo,
  compact,
}: CommentListProps) {
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/comments/${taskId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  function handleDeleted(id: string) {
    setRemovedIds((prev) => new Set(prev).add(id))
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  const handleCommentAdded = useCallback((comment: CommentItem) => {
    setComments((prev) => [...prev, { ...comment, replies: [] }])
  }, [])

  const filtered = videoSubmissionId
    ? comments.filter((c) => c.videoSubmissionId === videoSubmissionId)
    : comments

  const tree = buildCommentTree(filtered)
  const visibleTree = tree.filter((c) => !removedIds.has(c.id))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">
        <MessageSquare className="size-3.5" />
        <span>
          Komentar{" "}
          <span className="font-mono tabular-nums text-ink-secondary">
            {filtered.length}
          </span>
        </span>
      </div>

      <CommentInput
        taskId={taskId}
        videoSubmissionId={videoSubmissionId}
        onCommentAdded={handleCommentAdded}
      />

      {loading ? (
        <div className="space-y-2 pt-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : visibleTree.length === 0 ? (
        <p className="text-center py-6 text-[12px] text-ink-muted">
          Belum ada komentar
        </p>
      ) : (
        <ScrollArea
          className={`${compact ? "max-h-[300px]" : "max-h-[400px]"} pr-2 divide-y divide-line`}
        >
          {visibleTree.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              depth={0}
              taskId={taskId}
              videoSubmissionId={videoSubmissionId}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onSeekVideo={onSeekVideo}
              onDeleted={handleDeleted}
            />
          ))}
        </ScrollArea>
      )}
    </div>
  )
}

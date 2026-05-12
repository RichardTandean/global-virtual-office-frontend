"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import CommentInput from "./comment-input"
import { CommentItem, buildCommentTree, formatTimestamp } from "@/types/comment"
import { MessageSquare, CornerDownRight, ChevronDown, Trash2 } from "lucide-react"
import { toast } from "sonner"

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

  return (
    <div className={depth > 0 ? "ml-8" : ""}>
      <Card className="mb-2">
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{comment.user.name}</span>
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  {comment.user.role === "KoreaTeam"
                    ? "Korea Team"
                    : comment.user.role === "Admin"
                      ? "Admin"
                      : "Editor"}
                </Badge>
                {comment.videoSubmission && (
                  <Badge variant="secondary" className="text-[10px]">
                    V{comment.videoSubmission.version}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString("id-ID")}
                </span>
              </div>

              {comment.timestampSeconds != null && onSeekVideo && (
                <Tooltip>
                  <TooltipTrigger
                    onClick={() => onSeekVideo(comment.timestampSeconds!)}
                    className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] cursor-pointer hover:bg-muted mb-1"
                  >
                    menit {formatTimestamp(comment.timestampSeconds)}
                  </TooltipTrigger>
                  <TooltipContent>Klik untuk lompat ke bagian video ini</TooltipContent>
                </Tooltip>
              )}

              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

              <div className="flex items-center gap-1 mt-1">
                {depth < maxDepth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-1 gap-1 text-muted-foreground"
                    onClick={() => setShowReply(!showReply)}
                  >
                    <CornerDownRight className="h-3 w-3" />
                    Balas
                  </Button>
                )}

                {comment.userId === currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-1 gap-1 text-muted-foreground hover:text-red-600"
                    onClick={async () => {
                      const res = await fetch(`/api/comments/${comment.id}`, {
                        method: "DELETE",
                      })
                      if (res.ok) {
                        onDeleted(comment.id)
                        toast.success("Komentar dihapus")
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                    Hapus
                  </Button>
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
        </CardContent>
      </Card>

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
              <CollapsibleTrigger className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] ml-8 mb-2 cursor-pointer hover:bg-muted">
                <ChevronDown className="h-3 w-3" />
                {open ? "Sembunyikan" : "Lihat"}{" "}
                {comment.replies.length} balasan
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
      // ignore
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

  const handleCommentAdded = useCallback(
    (comment: CommentItem) => {
      setComments((prev) => [...prev, { ...comment, replies: [] }])
    },
    [],
  )

  const filtered = videoSubmissionId
    ? comments.filter((c) => c.videoSubmissionId === videoSubmissionId)
    : comments

  const tree = buildCommentTree(filtered)
  const visibleTree = tree.filter((c) => !removedIds.has(c.id))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          Komentar ({filtered.length})
        </span>
      </div>

      <CommentInput
        taskId={taskId}
        videoSubmissionId={videoSubmissionId}
        onCommentAdded={handleCommentAdded}
      />

      <Separator />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : visibleTree.length === 0 ? (
        <p className="text-center py-6 text-sm text-muted-foreground">
          Belum ada komentar
        </p>
      ) : (
        <ScrollArea className={`${compact ? "max-h-[300px]" : "max-h-[400px]"} pr-2`}>
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
